"""
Dignet query API endpoints.

POST /api/v1/dignet/search         - search PubMed and return gene pairs
GET  /api/v1/dignet/<query_id>     - retrieve Cytoscape.js graph for a query
GET  /api/v1/dignet/<query_id>/export/graphml - export graph as GraphML
"""

import hashlib
import logging
import re
import time
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timedelta, timezone

import requests
from flask import Blueprint, Response, jsonify, request

from db import db_connection, get_redis
from utils import sanitize_gene_symbol
from utils.ino_classifier import INO_COLORS, classify_ino

logger = logging.getLogger(__name__)

dignet_bp = Blueprint("dignet", __name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# NCBI eUtils base URL
_NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
# Maximum PMIDs to retrieve from NCBI per query
_NCBI_MAX_PMIDS = 9999
# Rate limit: NCBI allows 3 req/s without API key
_NCBI_SLEEP = 0.34
# Cache TTL: 7 days in seconds
_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60
# Chunk size for SQL IN clauses
_PMID_CHUNK = 500

# ---------------------------------------------------------------------------
# Input sanitisation
# ---------------------------------------------------------------------------


def _sanitize_keywords(value: str) -> str:
    """Strip non-printable/control characters; keep printable ASCII + spaces."""
    return re.sub(r"[^\x20-\x7E]", "", value).strip()


# ---------------------------------------------------------------------------
# NCBI eUtils helpers
# ---------------------------------------------------------------------------


def _ncbi_search_pmids(keywords: str) -> list[int]:
    """
    Query NCBI PubMed and return a list of PMIDs (up to _NCBI_MAX_PMIDS).
    Raises requests.RequestException on network failure.

    Fetches up to 5000 PMIDs from NCBI, then filters to only those present
    in t_gene_pairs (our processed data). This ensures
    results are actionable even for broad queries where PubMed returns
    mostly recent papers not yet in the Ignet pipeline.
    """
    search_url = (
        f"{_NCBI_BASE}/esearch.fcgi"
        f"?db=pubmed&term={requests.utils.quote(keywords)}"
        f"&retmax=9999&retmode=json&sort=relevance"
    )
    resp = requests.get(search_url, timeout=20)
    resp.raise_for_status()
    time.sleep(_NCBI_SLEEP)

    data = resp.json()
    id_list: list[str] = data.get("esearchresult", {}).get("idlist", [])
    ncbi_pmids = [int(x) for x in id_list if x.isdigit()]

    if not ncbi_pmids:
        return []

    # Filter to PMIDs that exist in our database
    try:
        with db_connection() as conn:
            cursor = conn.cursor()
            placeholders = ",".join(["%s"] * len(ncbi_pmids))
            cursor.execute(
                f"SELECT DISTINCT pmid FROM t_gene_pairs "
                f"WHERE pmid IN ({placeholders})",
                tuple(ncbi_pmids),
            )
            db_pmids = {row[0] for row in cursor.fetchall()}
            cursor.close()
    except Exception as exc:
        logger.warning("PMID filtering failed, using all PMIDs: %s", exc)
        return ncbi_pmids[:_NCBI_MAX_PMIDS]

    # Return only PMIDs in our DB, capped at limit
    filtered = [p for p in ncbi_pmids if p in db_pmids]
    logger.info(
        "NCBI returned %d PMIDs, %d exist in Ignet DB (%.1f%% coverage)",
        len(ncbi_pmids), len(filtered),
        len(filtered) / len(ncbi_pmids) * 100 if ncbi_pmids else 0,
    )
    return filtered[:_NCBI_MAX_PMIDS]


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------


def _upsert_query(conn, keywords: str, pmids: list[int]) -> int:
    """
    Insert or update a row in t_pubmed_query for the given keywords.
    Actual schema: c_query_int_id (PK auto), c_query_text, c_query_id (hash),
                   c_pubmed_records (CSV of PMIDs), c_num_pubmed_records, c_query_ts.
    Returns c_query_int_id.
    """
    pmid_csv = ",".join(str(p) for p in pmids)
    query_hash = hashlib.md5(keywords.encode()).hexdigest()[:8]
    cursor = conn.cursor()
    # Check if this keyword search already exists
    cursor.execute(
        "SELECT c_query_int_id FROM t_pubmed_query WHERE c_query_text = %s ORDER BY c_query_int_id DESC LIMIT 1",
        (keywords,),
    )
    row = cursor.fetchone()
    if row:
        qid = int(row[0])
        cursor.execute(
            "UPDATE t_pubmed_query SET c_pubmed_records = %s, c_num_pubmed_records = %s, c_query_ts = NOW() WHERE c_query_int_id = %s",
            (pmid_csv, len(pmids), qid),
        )
        conn.commit()
        return qid
    cursor.execute(
        """
        INSERT INTO t_pubmed_query
            (c_query_text, c_query_id, c_pubmed_records, c_num_pubmed_records, c_query_ts)
        VALUES (%s, %s, %s, %s, NOW())
        """,
        (keywords, query_hash, pmid_csv, len(pmids)),
    )
    conn.commit()
    return cursor.lastrowid


def _load_query(conn, query_id: int) -> dict | None:
    """
    Load a t_pubmed_query row by c_query_int_id.
    Returns normalised dict with 'id', 'query_hash', 'keywords', 'pmid_list', 'created_at' or None.
    """
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT c_query_int_id AS id, c_query_id AS query_hash,
                  c_query_text AS keywords,
                  c_pubmed_records AS pmid_list, c_query_ts AS created_at
           FROM t_pubmed_query WHERE c_query_int_id = %s""",
        (query_id,),
    )
    return cursor.fetchone()


def _is_cache_valid(row: dict) -> bool:
    """Return True when the row was created within the 7-day TTL."""
    created_at = row.get("created_at")
    if not created_at:
        return False
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return datetime.now(tz=timezone.utc) - created_at < timedelta(seconds=_CACHE_TTL_SECONDS)


def _fetch_gene_pairs(
    conn,
    pmids: list[int],
    has_vaccine: bool | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
) -> list[dict]:
    """
    Query t_gene_pairs for gene pairs matching the given PMIDs.
    Processes in chunks of _PMID_CHUNK to avoid oversized IN clauses.

    Args:
        conn: Active database connection.
        pmids: List of PubMed IDs to filter on.
        has_vaccine: When True, restrict to rows where has_vaccine = 1.
                     When False, restrict to rows where has_vaccine = 0.
                     When None (default), no filter is applied.
        year_min: When set, restrict to PMIDs with pub_year >= year_min.
        year_max: When set, restrict to PMIDs with pub_year <= year_max.
    """
    if not pmids:
        return []

    vaccine_clause = ""
    if has_vaccine is True:
        vaccine_clause = " AND has_vaccine = 1"
    elif has_vaccine is False:
        vaccine_clause = " AND has_vaccine = 0"

    use_year_filter = year_min is not None or year_max is not None

    pairs: list[dict] = []
    for i in range(0, len(pmids), _PMID_CHUNK):
        chunk = pmids[i : i + _PMID_CHUNK]
        placeholders = ",".join(["%s"] * len(chunk))
        params: list = list(chunk)

        if use_year_filter:
            year_clause = ""
            if year_min is not None:
                year_clause += " AND py.pub_year >= %s"
                params.append(year_min)
            if year_max is not None:
                year_clause += " AND py.pub_year <= %s"
                params.append(year_max)
            sql = f"""
                SELECT h.gene_symbol1  AS gene1,
                       h.gene_symbol2  AS gene2,
                       h.score,
                       h.pmid         AS pmid,
                       h.sentence_id   AS sentence_id,
                       py.pub_year
                FROM t_gene_pairs h
                JOIN t_pmid_year py ON py.pmid = h.pmid
                WHERE h.pmid IN ({placeholders}){vaccine_clause}{year_clause}
            """
        else:
            sql = f"""
                SELECT gene_symbol1  AS gene1,
                       gene_symbol2  AS gene2,
                       score,
                       PMID         AS pmid,
                       sentence_id   AS sentence_id
                FROM t_gene_pairs
                WHERE pmid IN ({placeholders}){vaccine_clause}
            """

        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params)
        pairs.extend(cursor.fetchall())

    return pairs


# ---------------------------------------------------------------------------
# INO and centrality helpers
# ---------------------------------------------------------------------------


def _build_ino_map(conn, sentence_ids: list[int]) -> dict[int, str]:
    """
    Batch-query t_ino for the given sentence IDs and return a map of
    sentence_id -> dominant INO category (most frequent for that sentence).
    """
    if not sentence_ids:
        return {}

    placeholders = ",".join(["%s"] * len(sentence_ids))
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        f"SELECT sentence_id, matching_phrase FROM t_ino WHERE sentence_id IN ({placeholders})",
        tuple(sentence_ids),
    )
    rows = cursor.fetchall()

    # Group phrases by sentence_id then pick most frequent category
    phrase_groups: dict[int, list[str]] = {}
    for row in rows:
        sid = row["sentence_id"]
        phrase_groups.setdefault(sid, []).append(classify_ino(row["matching_phrase"] or ""))

    ino_map: dict[int, str] = {}
    for sid, categories in phrase_groups.items():
        most_common = Counter(categories).most_common(1)[0][0]
        ino_map[sid] = most_common

    return ino_map


def _build_centrality_map(
    conn, gene_symbols: list[str], query_hash: str
) -> dict[str, dict[str, float]]:
    """
    Query t_centrality_score_dignet for the given gene symbols and query hash.
    Returns a map of genesymbol -> {score_type: score} with types d, p, c, b, e.
    """
    if not gene_symbols or not query_hash:
        return {}

    placeholders = ",".join(["%s"] * len(gene_symbols))
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        f"""SELECT genesymbol, score_type, score
            FROM t_centrality_score_dignet
            WHERE genesymbol IN ({placeholders})
              AND c_query_id = %s""",
        tuple(gene_symbols) + (query_hash,),
    )
    rows = cursor.fetchall()

    centrality_map: dict[str, dict[str, float]] = {}
    for row in rows:
        gene = row["genesymbol"]
        centrality_map.setdefault(gene, {})[row["score_type"]] = (
            float(row["score"]) if row["score"] is not None else 0.0
        )

    return centrality_map


# ---------------------------------------------------------------------------
# GET /api/v1/dignet/year-range
# ---------------------------------------------------------------------------


@dignet_bp.route("/dignet/year-range", methods=["GET"])
def year_range():
    """Return min and max publication year from t_pmid_year."""
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT MIN(pub_year) AS min_year, MAX(pub_year) AS max_year FROM t_pmid_year WHERE pub_year > 1970"
            )
            row = cursor.fetchone()
            cursor.close()
    except Exception as exc:
        logger.exception("Error in year_range: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500
    return jsonify(row)


# ---------------------------------------------------------------------------
# POST /api/v1/dignet/search
# ---------------------------------------------------------------------------


@dignet_bp.route("/dignet/search", methods=["POST"])
def network_search():
    """
    Search PubMed for the given keywords and return matching gene pairs.

    Request JSON:
        keywords   - search terms (required, non-empty string)
        use_cache  - boolean, default true; skip NCBI call if cached result exists

    Response JSON:
        query_id, keywords, pmid_count, gene_pairs, total_pairs
    """
    body = request.get_json(silent=True) or {}

    # Validate and sanitise keywords
    raw_keywords: str = body.get("keywords", "")
    if not raw_keywords or not isinstance(raw_keywords, str):
        return jsonify({"error": "MissingParameter", "message": "'keywords' is required."}), 400
    keywords = _sanitize_keywords(raw_keywords)
    if not keywords:
        return jsonify({"error": "InvalidInput", "message": "'keywords' contains no valid characters."}), 400

    use_cache: bool = bool(body.get("use_cache", True))

    try:
        with db_connection() as conn:
            # Check for a valid cached result
            if use_cache:
                cursor = conn.cursor(dictionary=True)
                cursor.execute(
                    """SELECT c_query_int_id AS id, c_query_text AS keywords,
                              c_pubmed_records AS pmid_list, c_query_ts AS created_at
                       FROM t_pubmed_query WHERE c_query_text = %s
                       ORDER BY c_query_int_id DESC LIMIT 1""",
                    (keywords,),
                )
                cached = cursor.fetchone()
                if cached and _is_cache_valid(cached):
                    pmids = [int(p) for p in cached["pmid_list"].split(",") if p.strip().isdigit()]
                    pairs = _fetch_gene_pairs(conn, pmids)
                    return jsonify({
                        "data": {
                            "query_id": cached["id"],
                            "keywords": keywords,
                            "gene_pairs": pairs,
                            "total_pairs": len(pairs),
                            "pmid_count": len(pmids),
                            "cached": True,
                        }
                    })

            # Not cached (or cache bypassed) — call NCBI
            try:
                pmids = _ncbi_search_pmids(keywords)
            except requests.Timeout:
                return jsonify({"error": "NCBITimeout", "message": "NCBI request timed out. Try again later."}), 502
            except requests.RequestException as exc:
                logger.error("NCBI request failed: %s", exc)
                return jsonify({"error": "NCBIError", "message": "Failed to contact NCBI eUtils."}), 502

            # Persist result and fetch gene pairs
            query_id = _upsert_query(conn, keywords, pmids)
            pairs = _fetch_gene_pairs(conn, pmids)

    except Exception as exc:
        logger.exception("Error in network_search: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query database."}), 500

    return jsonify({
        "data": {
            "query_id": query_id,
            "keywords": keywords,
            "gene_pairs": pairs,
            "total_pairs": len(pairs),
            "pmid_count": len(pmids),
            "cached": False,
        }
    })


# ---------------------------------------------------------------------------
# GET /api/v1/dignet/<query_id>
# ---------------------------------------------------------------------------


@dignet_bp.route("/dignet/<int:query_id>", methods=["GET"])
def network_graph(query_id: int):
    """
    Return a Cytoscape.js-compatible graph for the given query_id.

    Query Parameters:
        has_vaccine  - "true"/"false": filter edges by has_vaccine flag
        ino_type     - one of positive_regulation, negative_regulation,
                       binding, phosphorylation, other, unknown:
                       filter edges to only include the specified INO category

    Response JSON:
        query_id, keywords, elements.nodes, elements.edges, stats
        Each node carries: id, label, centrality {d, p, c, b, e}
        Each edge carries: source, target, score, pmid, ino_category, ino_color
    """
    # Parse optional filter params
    has_vaccine_param = request.args.get("has_vaccine")
    has_vaccine: bool | None = None
    if has_vaccine_param is not None:
        has_vaccine = has_vaccine_param.lower() in ("true", "1", "yes")

    ino_type_filter: str | None = request.args.get("ino_type")

    year_min_param = request.args.get("year_min")
    year_max_param = request.args.get("year_max")
    year_min = int(year_min_param) if year_min_param else None
    year_max = int(year_max_param) if year_max_param else None

    try:
        with db_connection() as conn:
            row = _load_query(conn, query_id)
            if not row:
                return jsonify({"error": "NotFound", "message": f"query_id {query_id} not found."}), 404

            pmids = [int(p) for p in row["pmid_list"].split(",") if p.strip().isdigit()]
            pairs = _fetch_gene_pairs(conn, pmids, has_vaccine=has_vaccine, year_min=year_min, year_max=year_max)

            # Batch-fetch INO categories for all sentence IDs
            sentence_ids = [
                int(p["sentence_id"])
                for p in pairs
                if p.get("sentence_id") is not None
            ]
            ino_map = _build_ino_map(conn, sentence_ids)

            # Determine all unique genes for centrality lookup
            gene_symbols = list(
                {sanitize_gene_symbol(str(p.get("gene1", ""))) for p in pairs}
                | {sanitize_gene_symbol(str(p.get("gene2", ""))) for p in pairs}
            )
            gene_symbols = [g for g in gene_symbols if g]

            query_hash: str = row.get("query_hash") or ""
            centrality_map = _build_centrality_map(conn, gene_symbols, query_hash)

    except Exception as exc:
        logger.exception("Error in network_graph: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query database."}), 500

    # Build Cytoscape.js elements
    unique_genes: set[str] = set()
    edges: list[dict] = []

    for pair in pairs:
        g1 = sanitize_gene_symbol(str(pair.get("gene1", "")))
        g2 = sanitize_gene_symbol(str(pair.get("gene2", "")))
        if not g1 or not g2:
            continue

        # Resolve INO category for this edge via sentence_id
        sid = pair.get("sentence_id")
        if sid is not None:
            ino_category = ino_map.get(int(sid), "unknown")
        else:
            ino_category = "unknown"

        # Apply optional INO type filter
        if ino_type_filter and ino_category != ino_type_filter:
            continue

        unique_genes.add(g1)
        unique_genes.add(g2)
        edge_data = {
            "source": g1,
            "target": g2,
            "score": pair.get("score"),
            "pmid": pair.get("pmid"),
            "ino_category": ino_category,
            "ino_color": INO_COLORS.get(ino_category, INO_COLORS["unknown"]),
        }
        if pair.get("pub_year") is not None:
            edge_data["pub_year"] = int(pair["pub_year"])
        edges.append({"data": edge_data})

    # Build nodes with centrality data
    nodes: list[dict] = []
    for gene in sorted(unique_genes):
        centrality = centrality_map.get(gene, {})
        nodes.append({
            "data": {
                "id": gene,
                "label": gene,
                "centrality": {
                    "d": centrality.get("d", 0.0),
                    "p": centrality.get("p", 0.0),
                    "c": centrality.get("c", 0.0),
                    "b": centrality.get("b", 0.0),
                    "e": centrality.get("e", 0.0),
                },
            }
        })

    return jsonify({
        "data": {
            "query_id": query_id,
            "keywords": row["keywords"],
            "elements": {
                "nodes": nodes,
                "edges": edges,
            },
            "stats": {
                "node_count": len(nodes),
                "edge_count": len(edges),
            },
        }
    })


# ---------------------------------------------------------------------------
# GET /api/v1/dignet/<query_id>/entities  (fast, PMID-based)
# ---------------------------------------------------------------------------


@dignet_bp.route("/dignet/<int:query_id>/entities", methods=["GET"])
def network_entities(query_id: int):
    """
    Fast entity lookup for a Dignet query's PMIDs.
    Queries t_biosummary and t_ino directly using cached PMIDs.
    Much faster than the full enrichment endpoint for sidebar use.
    """
    try:
        with db_connection() as conn:
            row = _load_query(conn, query_id)
            if not row:
                return jsonify({"error": "NotFound"}), 404

            pmids = [int(p) for p in row["pmid_list"].split(",") if p.strip().isdigit()]
            if not pmids:
                return jsonify({"drugs": [], "diseases": [], "ino_distribution": []})

            cursor = conn.cursor(dictionary=True)
            placeholders = ",".join(["%s"] * min(len(pmids), 500))
            pmid_subset = tuple(pmids[:500])

            # Drugs from t_biosummary (direct PMID lookup, no gene JOIN)
            cursor.execute(
                f"""SELECT drug_term AS term, COUNT(*) AS cnt
                    FROM t_biosummary
                    WHERE pmid IN ({placeholders})
                      AND drug_term IS NOT NULL AND drug_term != ''
                    GROUP BY drug_term ORDER BY cnt DESC LIMIT 20""",
                pmid_subset,
            )
            drugs = [dict(r) for r in cursor.fetchall()]

            # Diseases
            cursor.execute(
                f"""SELECT hdo_term AS term, COUNT(*) AS cnt
                    FROM t_biosummary
                    WHERE pmid IN ({placeholders})
                      AND hdo_term IS NOT NULL AND hdo_term != ''
                    GROUP BY hdo_term ORDER BY cnt DESC LIMIT 20""",
                pmid_subset,
            )
            diseases = [dict(r) for r in cursor.fetchall()]

            # INO types (from the network's sentence IDs)
            cursor.execute(
                f"""SELECT ino.matching_phrase AS term, COUNT(*) AS cnt
                    FROM t_gene_pairs h
                    JOIN t_ino ino ON ino.sentence_id = h.sentence_id
                    WHERE h.pmid IN ({placeholders})
                    GROUP BY ino.matching_phrase ORDER BY cnt DESC LIMIT 20""",
                pmid_subset,
            )
            ino_distribution = [dict(r) for r in cursor.fetchall()]

            cursor.close()

    except Exception as exc:
        logger.exception("Error in network_entities: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    return jsonify({
        "drugs": drugs,
        "diseases": diseases,
        "ino_distribution": ino_distribution,
    })


# ---------------------------------------------------------------------------
# GET /api/v1/dignet/<query_id>/export/graphml
# ---------------------------------------------------------------------------


@dignet_bp.route("/dignet/<int:query_id>/export/graphml", methods=["GET"])
def network_export_graphml(query_id: int):
    """
    Export the gene interaction network for <query_id> as a GraphML file.
    """
    try:
        with db_connection() as conn:
            row = _load_query(conn, query_id)
            if not row:
                return jsonify({"error": "NotFound", "message": f"query_id {query_id} not found."}), 404

            pmids = [int(p) for p in row["pmid_list"].split(",") if p.strip().isdigit()]
            pairs = _fetch_gene_pairs(conn, pmids)

    except Exception as exc:
        logger.exception("Error in network_export_graphml: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query database."}), 500

    # Build GraphML XML
    ns = "http://graphml.graphdrawing.org/graphml"
    ET.register_namespace("", ns)

    root = ET.Element(f"{{{ns}}}graphml")

    # Attribute declarations
    key_score = ET.SubElement(root, f"{{{ns}}}key", {
        "id": "d0", "for": "edge", "attr.name": "score", "attr.type": "double"
    })
    key_pmid = ET.SubElement(root, f"{{{ns}}}key", {
        "id": "d1", "for": "edge", "attr.name": "pmid", "attr.type": "int"
    })

    graph_el = ET.SubElement(root, f"{{{ns}}}graph", {
        "id": f"G{query_id}",
        "edgedefault": "undirected",
    })

    unique_genes: set[str] = set()
    edge_elements: list[tuple[str, str, dict]] = []

    for pair in pairs:
        g1 = sanitize_gene_symbol(str(pair.get("gene1", "")))
        g2 = sanitize_gene_symbol(str(pair.get("gene2", "")))
        if not g1 or not g2:
            continue
        unique_genes.add(g1)
        unique_genes.add(g2)
        edge_elements.append((g1, g2, {
            "score": pair.get("score"),
            "pmid": pair.get("pmid"),
        }))

    for gene in sorted(unique_genes):
        ET.SubElement(graph_el, f"{{{ns}}}node", {"id": gene})

    for idx, (g1, g2, attrs) in enumerate(edge_elements):
        edge_el = ET.SubElement(graph_el, f"{{{ns}}}edge", {
            "id": f"e{idx}",
            "source": g1,
            "target": g2,
        })
        if attrs.get("score") is not None:
            data_score = ET.SubElement(edge_el, f"{{{ns}}}data", {"key": "d0"})
            data_score.text = str(attrs["score"])
        if attrs.get("pmid") is not None:
            data_pmid = ET.SubElement(edge_el, f"{{{ns}}}data", {"key": "d1"})
            data_pmid.text = str(attrs["pmid"])

    xml_str = ET.tostring(root, encoding="unicode", xml_declaration=False)
    xml_body = f'<?xml version="1.0" encoding="UTF-8"?>\n{xml_str}'

    filename = f"ignet_network_query{query_id}.graphml"
    return Response(
        xml_body,
        mimetype="application/xml",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "application/xml; charset=utf-8",
        },
    )


# ---------------------------------------------------------------------------
# POST /api/v1/dignet/compare
# ---------------------------------------------------------------------------


def _run_search(conn, keywords: str) -> tuple[list[int], list[dict]]:
    """
    Run a PubMed search for *keywords* with caching, returning (pmids, pairs).
    Reuses the same cache / NCBI logic as :func:`network_search`.
    """
    # Check cache first
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT c_query_int_id AS id, c_query_text AS keywords,
                  c_pubmed_records AS pmid_list, c_query_ts AS created_at
           FROM t_pubmed_query WHERE c_query_text = %s
           ORDER BY c_query_int_id DESC LIMIT 1""",
        (keywords,),
    )
    cached = cursor.fetchone()
    if cached and _is_cache_valid(cached):
        pmids = [int(p) for p in cached["pmid_list"].split(",") if p.strip().isdigit()]
        pairs = _fetch_gene_pairs(conn, pmids)
        return pmids, pairs

    # Not cached -- call NCBI
    pmids = _ncbi_search_pmids(keywords)
    _upsert_query(conn, keywords, pmids)
    pairs = _fetch_gene_pairs(conn, pmids)
    return pmids, pairs


@dignet_bp.route("/dignet/compare", methods=["POST"])
def compare_networks():
    """Compare two Dignet query results side by side."""
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "InvalidJSON"}), 400

    query_a = _sanitize_keywords(body.get("query_a") or "")
    query_b = _sanitize_keywords(body.get("query_b") or "")
    if not query_a or not query_b:
        return (
            jsonify(
                {
                    "error": "MissingParameter",
                    "message": "Provide query_a and query_b.",
                }
            ),
            400,
        )

    try:
        with db_connection() as conn:
            pmids_a, pairs_a = _run_search(conn, query_a)
            pmids_b, pairs_b = _run_search(conn, query_b)
    except requests.Timeout:
        return (
            jsonify(
                {"error": "NCBITimeout", "message": "NCBI request timed out. Try again later."}
            ),
            502,
        )
    except requests.RequestException as exc:
        logger.error("NCBI request failed during compare: %s", exc)
        return (
            jsonify({"error": "NCBIError", "message": "Failed to contact NCBI eUtils."}),
            502,
        )
    except Exception as exc:
        logger.exception("Error in compare_networks: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    def _extract_genes(pairs: list[dict]) -> set[str]:
        genes: set[str] = set()
        for p in pairs:
            g1 = sanitize_gene_symbol(str(p.get("gene1", "")))
            g2 = sanitize_gene_symbol(str(p.get("gene2", "")))
            if g1:
                genes.add(g1)
            if g2:
                genes.add(g2)
        return genes

    genes_a = _extract_genes(pairs_a)
    genes_b = _extract_genes(pairs_b)

    shared = genes_a & genes_b
    unique_a = genes_a - genes_b
    unique_b = genes_b - genes_a
    union = genes_a | genes_b

    return jsonify(
        {
            "query_a": {
                "keywords": query_a,
                "gene_count": len(genes_a),
                "pair_count": len(pairs_a),
                "pmid_count": len(pmids_a),
            },
            "query_b": {
                "keywords": query_b,
                "gene_count": len(genes_b),
                "pair_count": len(pairs_b),
                "pmid_count": len(pmids_b),
            },
            "shared_genes": sorted(shared),
            "unique_a": sorted(unique_a),
            "unique_b": sorted(unique_b),
            "overlap": {
                "shared": len(shared),
                "unique_a": len(unique_a),
                "unique_b": len(unique_b),
                "jaccard": round(len(shared) / len(union), 4) if union else 0,
            },
        }
    )
