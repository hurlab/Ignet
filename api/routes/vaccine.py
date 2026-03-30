"""
Vaccine-related API endpoints.

GET /api/v1/vaccine/stats             - summary counts for vaccine data
GET /api/v1/vaccine/explore           - paginated list of vaccines
GET /api/v1/vaccine/top-genes         - top genes associated with vaccines
GET /api/v1/vaccine/hierarchy         - nested VO hierarchy tree
GET /api/v1/vaccine/network           - network graph (multi-VO, gene-gene via ?vo_ids=)
GET /api/v1/vaccine/network/<vo_id>   - network graph data for Cytoscape (single VO)
GET /api/v1/vaccine/<vo_id>           - vaccine profile (info + top genes)
GET /api/v1/vaccine/<vo_id>/sentences - sentences for a given VO ID
"""

import logging

from flask import Blueprint, jsonify, request

from db import db_connection

logger = logging.getLogger(__name__)

vaccine_bp = Blueprint("vaccine", __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_limit_offset(args, default_limit: int = 50, max_limit: int = 200) -> tuple[int, int]:
    """Return (limit, offset) with sane bounds."""
    try:
        limit = min(max_limit, max(1, int(args.get("limit", default_limit))))
    except (ValueError, TypeError):
        limit = default_limit
    try:
        offset = max(0, int(args.get("offset", 0)))
    except (ValueError, TypeError):
        offset = 0
    return limit, offset


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/stats
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/stats", methods=["GET"])
def vaccine_stats():
    """
    Return summary counts for the vaccine dataset.

    Response:
      {
        "total_vaccines": int,
        "total_genes":    int,
        "total_pmids":    int,
        "total_sentences": int
      }
    """
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            cursor.execute("""
                SELECT COUNT(*) AS total_vaccines FROM (
                    SELECT vo_id AS vo_id FROM t_vo GROUP BY vo_id
                    UNION
                    SELECT voID AS vo_id FROM vo_sciminer_187_terms GROUP BY voID
                ) combined
            """)
            total_vaccines = cursor.fetchone()["total_vaccines"]

            cursor.execute(
                """
                SELECT COUNT(DISTINCT h.gene_symbol1) AS total_genes
                FROM t_vo v
                INNER JOIN t_gene_pairs h ON v.pmid = h.pmid
                """
            )
            total_genes = cursor.fetchone()["total_genes"]

            cursor.execute("SELECT COUNT(DISTINCT pmid) AS total_pmids FROM t_vo")
            total_pmids = cursor.fetchone()["total_pmids"]

            cursor.execute("SELECT COUNT(*) AS total_sentences FROM t_vo")
            total_sentences = cursor.fetchone()["total_sentences"]

            cursor.close()
    except Exception as exc:
        logger.exception("Error fetching vaccine stats: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to retrieve stats."}), 500

    return jsonify({
        "total_vaccines": int(total_vaccines),
        "total_genes": int(total_genes),
        "total_pmids": int(total_pmids),
        "total_sentences": int(total_sentences),
    })


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/explore
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/explore", methods=["GET"])
def vaccine_explore():
    """
    Paginated list of vaccines grouped by VO ID.

    Query params:
      q      - optional search term (filters on matching_phrase LIKE %q%)
      limit  - results per page (default 50, max 200)
      offset - number of rows to skip (default 0)

    Response:
      { "vaccines": [{ "vo_id", "name", "mention_count", "pmid_count" }], "total": int }
    """
    q = request.args.get("q", "").strip()
    limit, offset = _parse_limit_offset(request.args)

    where_clause = ""
    params_count: list = []
    params_data: list = []

    if q:
        where_clause = "WHERE matching_phrase LIKE %s"
        like_term = f"%{q}%"
        params_count = [like_term]
        params_data = [like_term]

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            count_sql = f"SELECT COUNT(DISTINCT vo_id) AS total FROM t_vo {where_clause}"
            cursor.execute(count_sql, params_count)
            total = int(cursor.fetchone()["total"])

            data_sql = f"""
                SELECT
                    vo_id,
                    SUBSTRING_INDEX(GROUP_CONCAT(matching_phrase ORDER BY matching_phrase), ',', 1) AS name,
                    COUNT(*) AS mention_count,
                    COUNT(DISTINCT pmid) AS pmid_count
                FROM t_vo
                {where_clause}
                GROUP BY vo_id
                ORDER BY mention_count DESC
                LIMIT %s OFFSET %s
            """
            params_data.extend([limit, offset])
            cursor.execute(data_sql, params_data)
            vaccines = cursor.fetchall()
            cursor.close()
    except Exception as exc:
        logger.exception("Error in vaccine explore: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to retrieve vaccines."}), 500

    return jsonify({"vaccines": vaccines, "total": total})


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/top-genes
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/top-genes", methods=["GET"])
def vaccine_top_genes():
    """
    Top genes associated with vaccines from t_sentence_hit_gene2vaccine.

    Response:
      [{ "gene", "total_sentences", "unique_vaccines" }]
    """
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT
                    h.gene_symbol1 AS gene,
                    COUNT(*) AS total_sentences,
                    COUNT(DISTINCT v.vo_id) AS unique_vaccines
                FROM t_vo v
                INNER JOIN t_gene_pairs h ON v.pmid = h.pmid
                GROUP BY h.gene_symbol1
                ORDER BY total_sentences DESC
                LIMIT 20
                """
            )
            rows = cursor.fetchall()
            cursor.close()
    except Exception as exc:
        logger.exception("Error fetching top vaccine genes: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to retrieve top genes."}), 500

    return jsonify(rows)


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/hierarchy
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/hierarchy", methods=["GET"])
def vaccine_hierarchy():
    """
    Return the VO vaccine ontology as a nested tree.

    Query params:
      max_depth - how many levels to return (default 4, max 6)

    Response:
      {
        "tree": [ { "vo_id", "name", "level", "has_data", "children": [...] } ],
        "total_nodes": int
      }
    """
    try:
        max_depth = int(request.args.get("max_depth", 10))
    except (ValueError, TypeError):
        max_depth = 10
    max_depth = max(1, min(14, max_depth))

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Fetch named nodes within the requested depth
            # Exclude nodes that only have a VO ID as their name (no real name available)
            cursor.execute(
                """
                SELECT vo_id, name, level, parent_vo_id
                FROM t_vo_hierarchy
                WHERE level <= %s AND name NOT REGEXP '^VO_[0-9]+$'
                ORDER BY level, vo_id
                """,
                (max_depth,),
            )
            rows = cursor.fetchall()
            total_nodes = len(rows)

            # Fetch VO IDs that actually have gene association data
            cursor.execute("SELECT vo_id FROM t_vo_has_gene_data")
            gene_data_ids = {r["vo_id"] for r in cursor.fetchall()}

            cursor.close()
    except Exception as exc:
        logger.exception("Error fetching vaccine hierarchy: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to retrieve hierarchy."}), 500

    has_data_ids = gene_data_ids

    # Build tree in Python
    node_map: dict = {}
    for row in rows:
        node_map[row["vo_id"]] = {
            "vo_id": row["vo_id"],
            "name": row["name"] or row["vo_id"],
            "level": int(row["level"]),
            "has_data": row["vo_id"] in has_data_ids,
            "children": [],
            "_parent": row["parent_vo_id"],
        }

    # Build parent-child links
    for vo_id, node in node_map.items():
        parent_id = node.pop("_parent")
        if parent_id and parent_id in node_map:
            node_map[parent_id]["children"].append(node)
        else:
            # Orphan root — attach to VO_0000001 if it exists and this isn't VO_0000001
            if vo_id != "VO_0000001" and "VO_0000001" in node_map:
                node_map["VO_0000001"]["children"].append(node)

    # Sort children by name for readability
    def _sort_children(node: dict) -> None:
        node["children"].sort(key=lambda n: n["name"].lower())
        for child in node["children"]:
            _sort_children(child)

    # Root at VO_0000001 only
    root = node_map.get("VO_0000001")
    if root:
        # Remove _parent if still present
        root.pop("_parent", None)
        _sort_children(root)
        tree = [root]
    else:
        tree = []

    return jsonify({"tree": tree, "total_nodes": total_nodes})


# ---------------------------------------------------------------------------
# Shared network builder (used by both network routes below)
# ---------------------------------------------------------------------------

def _build_vaccine_network(vo_ids: list[str], gene_gene: bool):
    """
    Build Cytoscape-compatible node/edge data for one or more vaccine VO IDs.

    Returns a (response_dict, status_code) tuple.
    """
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Resolve display labels for all requested VO IDs
            vaccine_labels: dict[str, str] = {}
            for vo_id in vo_ids:
                cursor.execute(
                    """
                    SELECT matching_phrase
                    FROM t_vo
                    WHERE vo_id = %s
                    GROUP BY matching_phrase
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                    """,
                    (vo_id,),
                )
                name_row = cursor.fetchone()
                if not name_row:
                    cursor.execute(
                        """
                        SELECT mentionedTerm AS matching_phrase
                        FROM vo_sciminer_187_terms
                        WHERE voID = %s
                        GROUP BY mentionedTerm
                        ORDER BY COUNT(*) DESC
                        LIMIT 1
                        """,
                        (vo_id,),
                    )
                    name_row = cursor.fetchone()
                if not name_row:
                    cursor.close()
                    return (
                        {"error": "NotFound", "message": f"Vaccine '{vo_id}' not found."},
                        404,
                    )
                vaccine_labels[vo_id] = name_row["matching_phrase"]

            # Collect gene associations per vaccine; track max pmid_count per gene
            # gene_pmid_counts: gene -> max pmid_count across all vaccines
            gene_pmid_counts: dict[str, int] = {}
            # vaccine_gene_edges: list of (vo_id, gene, pmid_count)
            vaccine_gene_edges: list[tuple[str, str, int]] = []

            for vo_id in vo_ids:
                cursor.execute(
                    """
                    SELECT gene, SUM(pmid_count) AS pmid_count FROM (
                        SELECT h.gene_symbol1 AS gene, COUNT(DISTINCT v.pmid) AS pmid_count
                        FROM t_vo v
                        INNER JOIN t_gene_pairs h ON v.pmid = h.pmid
                        WHERE v.vo_id = %s
                        GROUP BY h.gene_symbol1
                        UNION ALL
                        SELECT h.gene_symbol1 AS gene, COUNT(DISTINCT v.pmid) AS pmid_count
                        FROM vo_sciminer_187_terms v
                        INNER JOIN t_gene_pairs h ON v.pmid = h.pmid
                        WHERE v.voID = %s
                          AND v.pmid NOT IN (SELECT pmid FROM t_vo WHERE vo_id = %s)
                        GROUP BY h.gene_symbol1
                    ) combined
                    GROUP BY gene
                    ORDER BY pmid_count DESC
                    LIMIT 50
                    """,
                    (vo_id, vo_id, vo_id),
                )
                gene_rows = cursor.fetchall()
                for row in gene_rows:
                    gene = row["gene"]
                    cnt = int(row["pmid_count"])
                    vaccine_gene_edges.append((vo_id, gene, cnt))
                    if gene not in gene_pmid_counts or gene_pmid_counts[gene] < cnt:
                        gene_pmid_counts[gene] = cnt

            # If gene-gene mode: limit to top 30 genes by pmid_count
            gene_gene_edges: list[dict] = []
            if gene_gene and gene_pmid_counts:
                top_genes = sorted(gene_pmid_counts.keys(), key=lambda g: gene_pmid_counts[g], reverse=True)[:30]
                top_genes_set = set(top_genes)

                if len(top_genes_set) >= 2:
                    # Build IN-clause placeholders
                    placeholders = ",".join(["%s"] * len(top_genes))
                    cursor.execute(
                        f"""
                        SELECT gene_symbol1, gene_symbol2, COUNT(*) AS weight
                        FROM t_gene_pairs
                        WHERE gene_symbol1 IN ({placeholders})
                          AND gene_symbol2 IN ({placeholders})
                          AND gene_symbol1 < gene_symbol2
                        GROUP BY gene_symbol1, gene_symbol2
                        ORDER BY weight DESC
                        LIMIT 200
                        """,
                        top_genes + top_genes,
                    )
                    gg_rows = cursor.fetchall()
                    for row in gg_rows:
                        gene_gene_edges.append({
                            "source": row["gene_symbol1"],
                            "target": row["gene_symbol2"],
                            "weight": int(row["weight"]),
                            "type": "gene-gene",
                        })

            cursor.close()
    except Exception as exc:
        logger.exception("Error building vaccine network for %s: %s", vo_ids, exc)
        return {"error": "DatabaseError", "message": "Failed to build network."}, 500

    # Build node and edge lists
    nodes = []
    for vo_id in vo_ids:
        nodes.append({"id": vo_id, "label": vaccine_labels[vo_id], "type": "vaccine"})

    # Determine which genes to include as nodes
    gene_nodes_seen: set[str] = set()
    edges = []

    for (vo_id, gene, pmid_count) in vaccine_gene_edges:
        if gene not in gene_nodes_seen:
            gene_nodes_seen.add(gene)
            nodes.append({"id": gene, "label": gene, "type": "gene"})
        edges.append({"source": vo_id, "target": gene, "weight": pmid_count, "type": "vaccine-gene"})

    # Add any gene nodes referenced only in gene-gene edges that are not yet included
    if gene_gene_edges:
        for gg_edge in gene_gene_edges:
            for g in (gg_edge["source"], gg_edge["target"]):
                if g not in gene_nodes_seen:
                    gene_nodes_seen.add(g)
                    nodes.append({"id": g, "label": g, "type": "gene"})
        edges.extend(gene_gene_edges)

    return {"nodes": nodes, "edges": edges}, 200


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/network  (multi-VO via ?vo_ids= query param)
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/network", methods=["GET"])
def vaccine_network_multi():
    """
    Network graph data for one or more vaccine VO IDs supplied via query params.

    Query params:
      vo_ids    - comma-separated VO IDs (required)
      gene_gene - if "true", also include gene-gene edges between top 30 genes

    Response:
      {
        "nodes": [{ "id": str, "label": str, "type": "vaccine"|"gene" }],
        "edges": [{ "source": str, "target": str, "weight": int, "type": str }]
      }
    """
    vo_ids_param = request.args.get("vo_ids", "").strip()
    if not vo_ids_param:
        return jsonify({"error": "BadRequest", "message": "vo_ids query parameter is required."}), 400

    vo_ids = [v.strip() for v in vo_ids_param.split(",") if v.strip()]
    if not vo_ids:
        return jsonify({"error": "BadRequest", "message": "No valid VO IDs provided."}), 400

    gene_gene = request.args.get("gene_gene", "").lower() in ("true", "1", "yes")

    result, status_code = _build_vaccine_network(vo_ids, gene_gene)
    return jsonify(result), status_code


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/network/<vo_id>  (single VO via path param)
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/network/<path:vo_id>", methods=["GET"])
def vaccine_network(vo_id: str):
    """
    Network graph data for Cytoscape visualisation (single VO ID).

    Query params:
      gene_gene - if "true", also include gene-gene edges between top 30 genes
      vo_ids    - comma-separated VO IDs; if provided, overrides the path param

    Response:
      {
        "nodes": [{ "id": str, "label": str, "type": "vaccine"|"gene" }],
        "edges": [{ "source": str, "target": str, "weight": int, "type": str }]
      }
    """
    # If vo_ids query param is present, use it instead of the path param
    vo_ids_param = request.args.get("vo_ids", "").strip()
    if vo_ids_param:
        vo_ids = [v.strip() for v in vo_ids_param.split(",") if v.strip()]
        if not vo_ids:
            return jsonify({"error": "BadRequest", "message": "No valid VO IDs provided."}), 400
    else:
        vo_ids = [vo_id]

    gene_gene = request.args.get("gene_gene", "").lower() in ("true", "1", "yes")

    result, status_code = _build_vaccine_network(vo_ids, gene_gene)
    return jsonify(result), status_code


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/<vo_id>
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/<path:vo_id>", methods=["GET"])
def vaccine_profile(vo_id: str):
    """
    Vaccine profile for a given VO ID (e.g. VO_0004908).

    Response:
      {
        "vo_id": str,
        "name": str,
        "total_mentions": int,
        "pmid_count": int,
        "top_genes": [{ "gene", "sentence_count", "pmid_count" }]
      }
    """
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Basic info: try t_vo first, fall back to vo_sciminer_187_terms
            cursor.execute(
                """
                SELECT
                    vo_id,
                    COUNT(*) AS total_mentions,
                    COUNT(DISTINCT pmid) AS pmid_count
                FROM t_vo
                WHERE vo_id = %s
                GROUP BY vo_id
                """,
                (vo_id,),
            )
            basic = cursor.fetchone()

            if not basic:
                # Fallback: check vo_sciminer_187_terms
                cursor.execute(
                    """
                    SELECT
                        voID AS vo_id,
                        COUNT(*) AS total_mentions,
                        COUNT(DISTINCT pmid) AS pmid_count
                    FROM vo_sciminer_187_terms
                    WHERE voID = %s
                    GROUP BY voID
                    """,
                    (vo_id,),
                )
                basic = cursor.fetchone()

            if not basic:
                cursor.close()
                return jsonify({"error": "NotFound", "message": f"Vaccine '{vo_id}' not found."}), 404

            # Most common name: try t_vo first, fall back to vo_sciminer_187_terms
            cursor.execute(
                """
                SELECT matching_phrase
                FROM t_vo
                WHERE vo_id = %s
                GROUP BY matching_phrase
                ORDER BY COUNT(*) DESC
                LIMIT 1
                """,
                (vo_id,),
            )
            name_row = cursor.fetchone()
            if not name_row:
                cursor.execute(
                    """
                    SELECT mentionedTerm AS matching_phrase
                    FROM vo_sciminer_187_terms
                    WHERE voID = %s
                    GROUP BY mentionedTerm
                    ORDER BY COUNT(*) DESC
                    LIMIT 1
                    """,
                    (vo_id,),
                )
                name_row = cursor.fetchone()
            vaccine_name = name_row["matching_phrase"] if name_row else vo_id

            # Top associated genes: combine t_vo (primary) + vo_sciminer_187_terms (fallback)
            cursor.execute(
                """
                SELECT gene, SUM(pmid_count) AS pmid_count FROM (
                    SELECT h.gene_symbol1 AS gene, COUNT(DISTINCT v.pmid) AS pmid_count
                    FROM t_vo v
                    INNER JOIN t_gene_pairs h ON v.pmid = h.pmid
                    WHERE v.vo_id = %s
                    GROUP BY h.gene_symbol1
                    UNION ALL
                    SELECT h.gene_symbol1 AS gene, COUNT(DISTINCT v.pmid) AS pmid_count
                    FROM vo_sciminer_187_terms v
                    INNER JOIN t_gene_pairs h ON v.pmid = h.pmid
                    WHERE v.voID = %s
                      AND v.pmid NOT IN (SELECT pmid FROM t_vo WHERE vo_id = %s)
                    GROUP BY h.gene_symbol1
                ) combined
                GROUP BY gene
                ORDER BY pmid_count DESC
                LIMIT 20
                """,
                (vo_id, vo_id, vo_id),
            )
            top_genes = cursor.fetchall()

            cursor.close()
    except Exception as exc:
        logger.exception("Error fetching vaccine profile for %s: %s", vo_id, exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to retrieve vaccine profile."}), 500

    return jsonify({
        "vo_id": basic["vo_id"],
        "name": vaccine_name,
        "total_mentions": int(basic["total_mentions"]),
        "pmid_count": int(basic["pmid_count"]),
        "top_genes": top_genes,
    })


# ---------------------------------------------------------------------------
# GET /api/v1/vaccine/<vo_id>/sentences
# ---------------------------------------------------------------------------

@vaccine_bp.route("/vaccine/<path:vo_id>/sentences", methods=["GET"])
def vaccine_sentences(vo_id: str):
    """
    Paginated list of t_vo rows for a given VO ID.

    Query params:
      limit  - default 20, max 200
      offset - default 0

    Response:
      { "sentences": [{ "sentence_id", "pmid", "matching_phrase" }], "total": int }
    """
    limit, offset = _parse_limit_offset(request.args, default_limit=20)

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                "SELECT COUNT(*) AS total FROM t_vo WHERE vo_id = %s",
                (vo_id,),
            )
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                """
                SELECT sentence_id, pmid, matching_phrase
                FROM t_vo
                WHERE vo_id = %s
                ORDER BY sentence_id
                LIMIT %s OFFSET %s
                """,
                (vo_id, limit, offset),
            )
            sentences = cursor.fetchall()
            cursor.close()
    except Exception as exc:
        logger.exception("Error fetching sentences for %s: %s", vo_id, exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to retrieve sentences."}), 500

    return jsonify({"sentences": sentences, "total": total})


