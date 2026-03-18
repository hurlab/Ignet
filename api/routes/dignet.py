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
_NCBI_MAX_PMIDS = 1000
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
    """
    # Step 1 – esearch to get PMIDs
    search_url = (
        f"{_NCBI_BASE}/esearch.fcgi"
        f"?db=pubmed&term={requests.utils.quote(keywords)}"
        f"&retmax={_NCBI_MAX_PMIDS}&retmode=json"
    )
    resp = requests.get(search_url, timeout=20)
    resp.raise_for_status()
    time.sleep(_NCBI_SLEEP)

    data = resp.json()
    id_list: list[str] = data.get("esearchresult", {}).get("idlist", [])
    return [int(x) for x in id_list if x.isdigit()]


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
) -> list[dict]:
    """
    Query t_sentence_hit_gene2gene_Host for gene pairs matching the given PMIDs.
    Processes in chunks of _PMID_CHUNK to avoid oversized IN clauses.

    Args:
        conn: Active database connection.
        pmids: List of PubMed IDs to filter on.
        has_vaccine: When True, restrict to rows where hasVaccine = 1.
                     When False, restrict to rows where hasVaccine = 0.
                     When None (default), no filter is applied.
    """
    if not pmids:
        return []

    vaccine_clause = ""
    if has_vaccine is True:
        vaccine_clause = " AND hasVaccine = 1"
    elif has_vaccine is False:
        vaccine_clause = " AND hasVaccine = 0"

    pairs: list[dict] = []
    for i in range(0, len(pmids), _PMID_CHUNK):
        chunk = pmids[i : i + _PMID_CHUNK]
        placeholders = ",".join(["%s"] * len(chunk))
        sql = f"""
            SELECT geneSymbol1  AS gene1,
                   geneSymbol2  AS gene2,
                   score,
                   PMID         AS pmid,
                   sentenceID   AS sentenceID
            FROM t_sentence_hit_gene2gene_Host
            WHERE PMID IN ({placeholders}){vaccine_clause}
        """
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, chunk)
        pairs.extend(cursor.fetchall())

    return pairs


# ---------------------------------------------------------------------------
# INO and centrality helpers
# ---------------------------------------------------------------------------


def _build_ino_map(conn, sentence_ids: list[int]) -> dict[int, str]:
    """
    Batch-query ino_host25 for the given sentence IDs and return a map of
    sentence_id -> dominant INO category (most frequent for that sentence).
    """
    if not sentence_ids:
        return {}

    placeholders = ",".join(["%s"] * len(sentence_ids))
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        f"SELECT sentence_id, matching_phrase FROM ino_host25 WHERE sentence_id IN ({placeholders})",
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
        has_vaccine  - "true"/"false": filter edges by hasVaccine flag
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

    try:
        with db_connection() as conn:
            row = _load_query(conn, query_id)
            if not row:
                return jsonify({"error": "NotFound", "message": f"query_id {query_id} not found."}), 404

            pmids = [int(p) for p in row["pmid_list"].split(",") if p.strip().isdigit()]
            pairs = _fetch_gene_pairs(conn, pmids, has_vaccine=has_vaccine)

            # Batch-fetch INO categories for all sentence IDs
            sentence_ids = [
                int(p["sentenceID"])
                for p in pairs
                if p.get("sentenceID") is not None
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

        # Resolve INO category for this edge via sentenceID
        sid = pair.get("sentenceID")
        if sid is not None:
            ino_category = ino_map.get(int(sid), "unknown")
        else:
            ino_category = "unknown"

        # Apply optional INO type filter
        if ino_type_filter and ino_category != ino_type_filter:
            continue

        unique_genes.add(g1)
        unique_genes.add(g2)
        edges.append({
            "data": {
                "source": g1,
                "target": g2,
                "score": pair.get("score"),
                "pmid": pair.get("pmid"),
                "ino_category": ino_category,
                "ino_color": INO_COLORS.get(ino_category, INO_COLORS["unknown"]),
            }
        })

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
