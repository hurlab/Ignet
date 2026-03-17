"""
Network query API endpoints.

POST /api/v1/network/search         - search PubMed and return gene pairs
GET  /api/v1/network/<query_id>     - retrieve Cytoscape.js graph for a query
GET  /api/v1/network/<query_id>/export/graphml - export graph as GraphML
"""

import hashlib
import logging
import re
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

import requests
from flask import Blueprint, Response, jsonify, request

from db import db_connection, get_redis

logger = logging.getLogger(__name__)

network_bp = Blueprint("network", __name__)

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

_SAFE_GENE_RE = re.compile(r"[^A-Za-z0-9._-]")


def _sanitize_gene_symbol(value: str) -> str:
    """Strip characters that are not valid in gene symbols."""
    return _SAFE_GENE_RE.sub("", value)


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
    Returns the query_id (auto-increment primary key).
    """
    pmid_csv = ",".join(str(p) for p in pmids)
    cursor = conn.cursor()
    # t_pubmed_query schema assumed: id, keywords, pmid_list (TEXT), created_at
    cursor.execute(
        """
        INSERT INTO t_pubmed_query (keywords, pmid_list, created_at)
        VALUES (%s, %s, NOW())
        ON DUPLICATE KEY UPDATE
            pmid_list  = VALUES(pmid_list),
            created_at = NOW()
        """,
        (keywords, pmid_csv),
    )
    # Retrieve the inserted or updated row id
    cursor.execute(
        "SELECT id FROM t_pubmed_query WHERE keywords = %s ORDER BY id DESC LIMIT 1",
        (keywords,),
    )
    row = cursor.fetchone()
    return int(row[0]) if row else 0


def _load_query(conn, query_id: int) -> dict | None:
    """
    Load a t_pubmed_query row by id.
    Returns a dict with 'id', 'keywords', 'pmid_list', 'created_at' or None.
    """
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, keywords, pmid_list, created_at FROM t_pubmed_query WHERE id = %s",
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
    # Ensure UTC-aware comparison
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return datetime.now(tz=timezone.utc) - created_at < timedelta(seconds=_CACHE_TTL_SECONDS)


def _fetch_gene_pairs(conn, pmids: list[int]) -> list[dict]:
    """
    Query t_sentence_hit_gene2gene_Host for gene pairs matching the given PMIDs.
    Processes in chunks of _PMID_CHUNK to avoid oversized IN clauses.
    """
    if not pmids:
        return []

    pairs: list[dict] = []
    for i in range(0, len(pmids), _PMID_CHUNK):
        chunk = pmids[i : i + _PMID_CHUNK]
        placeholders = ",".join(["%s"] * len(chunk))
        sql = f"""
            SELECT geneSymbol1 AS gene1,
                   geneSymbol2 AS gene2,
                   score,
                   PMID        AS pmid
            FROM t_sentence_hit_gene2gene_Host
            WHERE PMID IN ({placeholders})
        """
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, chunk)
        pairs.extend(cursor.fetchall())

    return pairs


# ---------------------------------------------------------------------------
# POST /api/v1/network/search
# ---------------------------------------------------------------------------


@network_bp.route("/network/search", methods=["POST"])
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
                    "SELECT id, keywords, pmid_list, created_at FROM t_pubmed_query WHERE keywords = %s LIMIT 1",
                    (keywords,),
                )
                cached = cursor.fetchone()
                if cached and _is_cache_valid(cached):
                    pmids = [int(p) for p in cached["pmid_list"].split(",") if p.strip().isdigit()]
                    pairs = _fetch_gene_pairs(conn, pmids)
                    return jsonify({
                        "query_id": cached["id"],
                        "keywords": keywords,
                        "pmid_count": len(pmids),
                        "gene_pairs": pairs,
                        "total_pairs": len(pairs),
                        "cached": True,
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
        "query_id": query_id,
        "keywords": keywords,
        "pmid_count": len(pmids),
        "gene_pairs": pairs,
        "total_pairs": len(pairs),
        "cached": False,
    })


# ---------------------------------------------------------------------------
# GET /api/v1/network/<query_id>
# ---------------------------------------------------------------------------


@network_bp.route("/network/<int:query_id>", methods=["GET"])
def network_graph(query_id: int):
    """
    Return a Cytoscape.js-compatible graph for the given query_id.

    Response JSON:
        query_id, keywords, elements.nodes, elements.edges, stats
    """
    try:
        with db_connection() as conn:
            row = _load_query(conn, query_id)
            if not row:
                return jsonify({"error": "NotFound", "message": f"query_id {query_id} not found."}), 404

            pmids = [int(p) for p in row["pmid_list"].split(",") if p.strip().isdigit()]
            pairs = _fetch_gene_pairs(conn, pmids)

    except Exception as exc:
        logger.exception("Error in network_graph: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query database."}), 500

    # Build Cytoscape.js elements
    unique_genes: set[str] = set()
    edges: list[dict] = []

    for pair in pairs:
        g1 = _sanitize_gene_symbol(str(pair.get("gene1", "")))
        g2 = _sanitize_gene_symbol(str(pair.get("gene2", "")))
        if not g1 or not g2:
            continue
        unique_genes.add(g1)
        unique_genes.add(g2)
        edges.append({
            "data": {
                "source": g1,
                "target": g2,
                "score": pair.get("score"),
                "pmid": pair.get("pmid"),
            }
        })

    nodes = [{"data": {"id": g, "label": g}} for g in sorted(unique_genes)]

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
# GET /api/v1/network/<query_id>/export/graphml
# ---------------------------------------------------------------------------


@network_bp.route("/network/<int:query_id>/export/graphml", methods=["GET"])
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
        g1 = _sanitize_gene_symbol(str(pair.get("gene1", "")))
        g2 = _sanitize_gene_symbol(str(pair.get("gene2", "")))
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
