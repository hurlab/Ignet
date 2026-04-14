"""
MCP Streamable HTTP endpoint for Ignet/Vignet.

POST /api/v1/mcp — implements the Model Context Protocol (MCP) Streamable HTTP
transport, allowing AI assistants (Claude Desktop, Claude.ai) to query gene
interaction and vaccine data directly.

Protocol: JSON-RPC 2.0
Reference: https://spec.modelcontextprotocol.io/specification/2025-03-26/

Supported methods:
  initialize   — server capabilities handshake
  tools/list   — enumerate available tools
  tools/call   — execute a tool and return content blocks
"""

import json
import logging
import re

from flask import Blueprint, jsonify, request

from db import db_connection
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)

mcp_bp = Blueprint("mcp", __name__)

# ---------------------------------------------------------------------------
# CORS — /mcp must be accessible cross-origin for Claude Desktop / Claude.ai
# ---------------------------------------------------------------------------

@mcp_bp.after_request
def add_cors(response):
    """Allow any origin to call the MCP endpoint."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    return response


@mcp_bp.route("/mcp", methods=["OPTIONS"])
def mcp_preflight():
    """Handle CORS preflight requests."""
    return "", 204


# ---------------------------------------------------------------------------
# Tool definitions (JSON Schema for parameters)
# ---------------------------------------------------------------------------

_TOOLS = [
    {
        "name": "ignet_search_genes",
        "description": (
            "Search for genes by symbol, name, or synonym in the Ignet database. "
            "Returns gene IDs, symbols, synonyms, and descriptions."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Gene symbol, name, or synonym to search for (e.g. 'BRCA1', 'tumor suppressor')",
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of results to return (default 10, max 50)",
                    "default": 10,
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "ignet_get_gene_neighbors",
        "description": (
            "Get the top interacting genes for a given gene symbol, ranked by "
            "co-occurrence count across PubMed literature."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "gene": {
                    "type": "string",
                    "description": "Gene symbol (e.g. 'BRCA1', 'TP53')",
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of neighbors to return (default 20, max 50)",
                    "default": 20,
                },
            },
            "required": ["gene"],
        },
    },
    {
        "name": "ignet_get_gene_pair_evidence",
        "description": (
            "Get co-occurrence evidence sentences for a specific gene pair from "
            "PubMed literature. Returns sentence text, PMID, and interaction scores."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "gene1": {
                    "type": "string",
                    "description": "First gene symbol (e.g. 'BRCA1')",
                },
                "gene2": {
                    "type": "string",
                    "description": "Second gene symbol (e.g. 'TP53')",
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of evidence sentences to return (default 10, max 50)",
                    "default": 10,
                },
            },
            "required": ["gene1", "gene2"],
        },
    },
    {
        "name": "ignet_get_stats",
        "description": (
            "Get Ignet database statistics: total genes, gene pairs, PMIDs, and "
            "unique sentences extracted from PubMed."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "ignet_get_enrichment",
        "description": (
            "Analyze a list of genes for pairwise interactions found in PubMed, "
            "INO interaction types, and associated drugs and diseases."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "genes": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of gene symbols to analyze (2 to 50 genes, e.g. ['BRCA1', 'TP53', 'ATM'])",
                },
            },
            "required": ["genes"],
        },
    },
    {
        "name": "vignet_search_vaccines",
        "description": (
            "Search for vaccines by name or VO (Vaccine Ontology) ID in the Vignet "
            "database. Returns VO IDs, vaccine names, and mention counts."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Vaccine name or VO ID to search for (e.g. 'influenza', 'VO_0004908')",
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of results to return (default 10, max 50)",
                    "default": 10,
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "vignet_get_vaccine_genes",
        "description": (
            "Get genes associated with a vaccine (identified by VO ID) via PubMed "
            "co-occurrence. Returns gene symbols ranked by shared PMID count."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "vo_id": {
                    "type": "string",
                    "description": "Vaccine Ontology ID (e.g. 'VO_0004908')",
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of genes to return (default 20, max 50)",
                    "default": 20,
                },
            },
            "required": ["vo_id"],
        },
    },
    {
        "name": "vignet_get_vaccine_stats",
        "description": (
            "Get Vignet database statistics: total vaccines, associated genes, and "
            "PMIDs with vaccine-gene co-occurrence evidence."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {},
        },
    },
]


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

def _tool_ignet_search_genes(params: dict) -> str:
    """Search genes by symbol, name, or synonym."""
    query = str(params.get("query", "")).strip()
    if not query:
        return "Error: 'query' parameter is required."
    try:
        limit = min(50, max(1, int(params.get("limit", 10))))
    except (TypeError, ValueError):
        limit = 10

    like_term = f"%{query}%"
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT GeneID, Symbol, Synonyms, description
                FROM t_gene_info
                WHERE Symbol LIKE %s OR Synonyms LIKE %s
                ORDER BY (Symbol = %s) DESC, (Symbol LIKE %s) DESC, Symbol ASC
                LIMIT %s
                """,
                (like_term, like_term, query.upper(), f"{query}%", limit),
            )
            genes = cursor.fetchall()
    except Exception as exc:
        logger.exception("MCP ignet_search_genes error: %s", exc)
        return f"Database error: {exc}"

    if not genes:
        return f"No genes found matching '{query}'."

    lines = [f"Gene search results for '{query}' ({len(genes)} found):\n"]
    for i, g in enumerate(genes, 1):
        desc = (g.get("description") or "").strip()
        syns = (g.get("Synonyms") or "").strip()
        line = f"{i}. {g['Symbol']} (GeneID: {g['GeneID']})"
        if syns:
            line += f" — Synonyms: {syns}"
        if desc:
            # Truncate long descriptions
            desc_short = desc[:120] + "..." if len(desc) > 120 else desc
            line += f"\n   {desc_short}"
        lines.append(line)
    return "\n".join(lines)


def _tool_ignet_get_gene_neighbors(params: dict) -> str:
    """Get top interacting gene neighbors by co-occurrence count."""
    gene = sanitize_gene_symbol(str(params.get("gene", "")))
    if not gene:
        return "Error: valid 'gene' symbol is required."
    try:
        limit = min(50, max(1, int(params.get("limit", 20))))
    except (TypeError, ValueError):
        limit = 20

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT neighbor,
                       SUM(cnt) AS count,
                       SUM(pmid_cnt) AS unique_pmids,
                       MAX(max_score) AS score
                FROM (
                    SELECT gene_symbol2 AS neighbor,
                           COUNT(*) AS cnt,
                           COUNT(DISTINCT pmid) AS pmid_cnt,
                           MAX(score) AS max_score
                    FROM t_gene_pairs
                    WHERE gene_symbol1 = %s
                    GROUP BY gene_symbol2
                    UNION ALL
                    SELECT gene_symbol1 AS neighbor,
                           COUNT(*) AS cnt,
                           COUNT(DISTINCT pmid) AS pmid_cnt,
                           MAX(score) AS max_score
                    FROM t_gene_pairs
                    WHERE gene_symbol2 = %s
                    GROUP BY gene_symbol1
                ) AS combined
                GROUP BY neighbor
                ORDER BY count DESC
                LIMIT %s
                """,
                (gene, gene, limit),
            )
            neighbors = cursor.fetchall()
    except Exception as exc:
        logger.exception("MCP ignet_get_gene_neighbors error: %s", exc)
        return f"Database error: {exc}"

    if not neighbors:
        return f"No interaction partners found for gene '{gene}'."

    lines = [f"Top interacting genes for {gene} ({len(neighbors)} results):\n"]
    for i, n in enumerate(neighbors, 1):
        count = int(n.get("count") or 0)
        pmids = int(n.get("unique_pmids") or 0)
        score = n.get("score")
        score_str = f", score: {float(score):.2f}" if score is not None else ""
        lines.append(
            f"{i}. {n['neighbor']} — {count:,} co-occurrences, {pmids:,} PMIDs{score_str}"
        )
    return "\n".join(lines)


def _tool_ignet_get_gene_pair_evidence(params: dict) -> str:
    """Get evidence sentences for a gene pair."""
    gene1 = sanitize_gene_symbol(str(params.get("gene1", "")))
    gene2 = sanitize_gene_symbol(str(params.get("gene2", "")))
    if not gene1 or not gene2:
        return "Error: valid 'gene1' and 'gene2' symbols are required."
    try:
        limit = min(50, max(1, int(params.get("limit", 10))))
    except (TypeError, ValueError):
        limit = 10

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT h.sentence_id, h.pmid, h.score,
                       s.sentence AS sentence_text,
                       ino.matching_phrase AS ino_term
                FROM t_gene_pairs h
                LEFT JOIN t_sentences s ON h.sentence_id = s.sentence_id
                LEFT JOIN t_ino ino ON h.sentence_id = ino.sentence_id
                WHERE (h.gene_symbol1 = %s AND h.gene_symbol2 = %s)
                   OR (h.gene_symbol1 = %s AND h.gene_symbol2 = %s)
                ORDER BY h.score DESC
                LIMIT %s
                """,
                (gene1, gene2, gene2, gene1, limit),
            )
            rows = cursor.fetchall()

            # Total count
            cursor.execute(
                """
                SELECT COUNT(*) AS total
                FROM t_gene_pairs
                WHERE (gene_symbol1 = %s AND gene_symbol2 = %s)
                   OR (gene_symbol1 = %s AND gene_symbol2 = %s)
                """,
                (gene1, gene2, gene2, gene1),
            )
            total_row = cursor.fetchone()
            total = int(total_row["total"]) if total_row else 0
    except Exception as exc:
        logger.exception("MCP ignet_get_gene_pair_evidence error: %s", exc)
        return f"Database error: {exc}"

    if not rows:
        return f"No evidence found for gene pair {gene1} — {gene2}."

    lines = [
        f"Evidence for {gene1} — {gene2} "
        f"({total:,} total sentences, showing top {len(rows)}):\n"
    ]
    for i, r in enumerate(rows, 1):
        score = r.get("score")
        score_str = f" [score: {float(score):.2f}]" if score is not None else ""
        ino = r.get("ino_term") or ""
        ino_str = f" [{ino}]" if ino else ""
        text = (r.get("sentence_text") or "").strip() or "(no sentence text)"
        lines.append(
            f"{i}. PMID:{r['pmid']}{score_str}{ino_str}\n   {text}"
        )
    return "\n".join(lines)


def _tool_ignet_get_stats(_params: dict) -> str:
    """Return overall Ignet database statistics."""
    from db import get_redis

    redis_client = get_redis()

    def _from_cache(key: str):
        if not redis_client:
            return None
        try:
            v = redis_client.get(key)
            return int(v) if v is not None else None
        except Exception:
            return None

    total_genes = _from_cache("ignet:stats:total_genes")
    total_pmids = _from_cache("ignet:stats:total_pmids")
    total_sentences = _from_cache("ignet:stats:total_sentences")
    total_interactions = _from_cache("ignet:stats:total_interactions")

    if any(v is None for v in [total_genes, total_pmids, total_sentences, total_interactions]):
        try:
            with db_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                if total_interactions is None:
                    cursor.execute("SELECT COUNT(*) AS n FROM t_gene_pairs")
                    total_interactions = int((cursor.fetchone() or {}).get("n", 0))

                if total_sentences is None:
                    cursor.execute(
                        "SELECT COUNT(DISTINCT sentence_id) AS n FROM t_gene_pairs"
                    )
                    total_sentences = int((cursor.fetchone() or {}).get("n", 0))

                if total_pmids is None:
                    cursor.execute(
                        "SELECT COUNT(DISTINCT pmid) AS n FROM t_gene_pairs"
                    )
                    total_pmids = int((cursor.fetchone() or {}).get("n", 0))

                if total_genes is None:
                    cursor.execute(
                        """
                        SELECT COUNT(DISTINCT gene) AS n
                        FROM (
                            SELECT gene_symbol1 AS gene FROM t_gene_pairs
                            UNION
                            SELECT gene_symbol2 AS gene FROM t_gene_pairs
                        ) AS g
                        WHERE gene IS NOT NULL
                        """
                    )
                    total_genes = int((cursor.fetchone() or {}).get("n", 0))
        except Exception as exc:
            logger.exception("MCP ignet_get_stats error: %s", exc)
            return f"Database error: {exc}"

    return (
        "Ignet Database Statistics:\n\n"
        f"  Genes:              {total_genes:,}\n"
        f"  Gene Pairs:         {total_interactions:,}\n"
        f"  Unique PMIDs:       {total_pmids:,}\n"
        f"  Unique Sentences:   {total_sentences:,}\n\n"
        "Data source: PubMed co-occurrence mining across biomedical literature."
    )


def _tool_ignet_get_enrichment(params: dict) -> str:
    """Analyze a gene set for pairwise interactions, INO types, drugs, diseases."""
    raw_genes = params.get("genes")
    if not isinstance(raw_genes, list) or len(raw_genes) < 2:
        return "Error: 'genes' must be a list of at least 2 gene symbols."
    if len(raw_genes) > 50:
        return "Error: maximum 50 genes per enrichment analysis via MCP."

    genes = [sanitize_gene_symbol(str(g)) for g in raw_genes if g]
    genes = [g for g in genes if g]
    if len(genes) < 2:
        return "Error: at least 2 valid gene symbols are required."

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            placeholders = ",".join(["%s"] * len(genes))
            gene_params = tuple(genes) + tuple(genes)

            cursor.execute(
                f"""
                SELECT gene_symbol1 AS gene1, gene_symbol2 AS gene2,
                       COUNT(*) AS evidence_count,
                       COUNT(DISTINCT pmid) AS unique_pmids,
                       MAX(score) AS max_score
                FROM t_gene_pairs
                WHERE gene_symbol1 IN ({placeholders})
                  AND gene_symbol2 IN ({placeholders})
                GROUP BY gene_symbol1, gene_symbol2
                ORDER BY evidence_count DESC
                LIMIT 50
                """,
                gene_params,
            )
            interactions = cursor.fetchall()

            cursor.execute(
                f"""
                SELECT ino.matching_phrase AS term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_ino ino ON ino.sentence_id = h.sentence_id
                WHERE h.gene_symbol1 IN ({placeholders})
                  AND h.gene_symbol2 IN ({placeholders})
                GROUP BY ino.matching_phrase
                ORDER BY cnt DESC
                LIMIT 10
                """,
                gene_params,
            )
            ino_dist = cursor.fetchall()

            cursor.execute(
                f"""
                SELECT b.drug_term AS term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE h.gene_symbol1 IN ({placeholders})
                  AND h.gene_symbol2 IN ({placeholders})
                  AND b.drug_term IS NOT NULL AND b.drug_term != ''
                GROUP BY b.drug_term
                ORDER BY cnt DESC
                LIMIT 10
                """,
                gene_params,
            )
            drugs = cursor.fetchall()

            cursor.execute(
                f"""
                SELECT b.hdo_term AS term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE h.gene_symbol1 IN ({placeholders})
                  AND h.gene_symbol2 IN ({placeholders})
                  AND b.hdo_term IS NOT NULL AND b.hdo_term != ''
                GROUP BY b.hdo_term
                ORDER BY cnt DESC
                LIMIT 10
                """,
                gene_params,
            )
            diseases = cursor.fetchall()
    except Exception as exc:
        logger.exception("MCP ignet_get_enrichment error: %s", exc)
        return f"Database error: {exc}"

    found_genes: set[str] = set()
    for i in interactions:
        found_genes.add(i["gene1"])
        found_genes.add(i["gene2"])
    coverage_pct = round(len(found_genes) / len(genes) * 100, 1) if genes else 0

    lines = [
        f"Enrichment Analysis for {len(genes)} genes: {', '.join(genes)}\n",
        f"Coverage: {len(found_genes)}/{len(genes)} genes ({coverage_pct}%) have interaction evidence\n",
    ]

    if interactions:
        lines.append(f"\nTop Pairwise Interactions ({len(interactions)} found):")
        for r in interactions[:20]:
            score_str = (
                f", score: {float(r['max_score']):.2f}" if r.get("max_score") else ""
            )
            lines.append(
                f"  {r['gene1']} — {r['gene2']}: "
                f"{int(r['evidence_count']):,} sentences, "
                f"{int(r['unique_pmids']):,} PMIDs{score_str}"
            )
    else:
        lines.append("\nNo pairwise interactions found among the input genes.")

    if ino_dist:
        lines.append("\nInteraction Types (INO):")
        for r in ino_dist:
            lines.append(f"  {r['term']}: {int(r['cnt']):,}")

    if drugs:
        lines.append("\nAssociated Drugs:")
        for r in drugs:
            lines.append(f"  {r['term']}: {int(r['cnt']):,} co-occurrences")

    if diseases:
        lines.append("\nAssociated Diseases:")
        for r in diseases:
            lines.append(f"  {r['term']}: {int(r['cnt']):,} co-occurrences")

    return "\n".join(lines)


def _tool_vignet_search_vaccines(params: dict) -> str:
    """Search vaccines by name or VO ID."""
    query = str(params.get("query", "")).strip()
    if not query:
        return "Error: 'query' parameter is required."
    try:
        limit = min(50, max(1, int(params.get("limit", 10))))
    except (TypeError, ValueError):
        limit = 10

    like_term = f"%{query}%"
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT
                    vo_id,
                    SUBSTRING_INDEX(
                        GROUP_CONCAT(matching_phrase ORDER BY matching_phrase), ',', 1
                    ) AS name,
                    COUNT(*) AS mention_count,
                    COUNT(DISTINCT pmid) AS pmid_count
                FROM t_vo
                WHERE matching_phrase LIKE %s OR vo_id LIKE %s
                GROUP BY vo_id
                ORDER BY mention_count DESC
                LIMIT %s
                """,
                (like_term, like_term, limit),
            )
            vaccines = cursor.fetchall()
    except Exception as exc:
        logger.exception("MCP vignet_search_vaccines error: %s", exc)
        return f"Database error: {exc}"

    if not vaccines:
        return f"No vaccines found matching '{query}'."

    lines = [f"Vaccine search results for '{query}' ({len(vaccines)} found):\n"]
    for i, v in enumerate(vaccines, 1):
        lines.append(
            f"{i}. {v['name']} (VO ID: {v['vo_id']}) — "
            f"{int(v['mention_count']):,} mentions, {int(v['pmid_count']):,} PMIDs"
        )
    return "\n".join(lines)


def _tool_vignet_get_vaccine_genes(params: dict) -> str:
    """Get genes associated with a vaccine by VO ID."""
    vo_id = str(params.get("vo_id", "")).strip()
    if not vo_id:
        return "Error: 'vo_id' parameter is required."
    try:
        limit = min(50, max(1, int(params.get("limit", 20))))
    except (TypeError, ValueError):
        limit = 20

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Resolve vaccine name
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

            # Pre-computed co-occurrence lookup
            cursor.execute(
                """
                SELECT gene_symbol AS gene, shared_pmids AS pmid_count
                FROM t_cooccurrence_vo_gene
                WHERE vo_id = %s
                ORDER BY shared_pmids DESC
                LIMIT %s
                """,
                (vo_id, limit),
            )
            gene_rows = cursor.fetchall()
    except Exception as exc:
        logger.exception("MCP vignet_get_vaccine_genes error: %s", exc)
        return f"Database error: {exc}"

    if not gene_rows:
        return f"No gene associations found for vaccine '{vo_id}'."

    lines = [
        f"Genes associated with {vaccine_name} ({vo_id}), "
        f"top {len(gene_rows)} by shared PMID count:\n"
    ]
    for i, r in enumerate(gene_rows, 1):
        lines.append(
            f"{i}. {r['gene']} — {int(r['pmid_count']):,} shared PMIDs"
        )
    return "\n".join(lines)


def _tool_vignet_get_vaccine_stats(_params: dict) -> str:
    """Return overall Vignet database statistics."""
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                """
                SELECT COUNT(*) AS total_vaccines FROM (
                    SELECT DISTINCT vo_id FROM t_vo
                ) combined
                """
            )
            total_vaccines = int(cursor.fetchone()["total_vaccines"])

            cursor.execute(
                "SELECT COUNT(DISTINCT gene_symbol) AS total_genes"
                " FROM t_cooccurrence_vo_gene"
            )
            total_genes = int(cursor.fetchone()["total_genes"])

            cursor.execute(
                "SELECT COUNT(DISTINCT pmid) AS total_pmids FROM t_vo"
            )
            total_pmids = int(cursor.fetchone()["total_pmids"])
    except Exception as exc:
        logger.exception("MCP vignet_get_vaccine_stats error: %s", exc)
        return f"Database error: {exc}"

    return (
        "Vignet (Vaccine-Gene Network) Database Statistics:\n\n"
        f"  Vaccines:        {total_vaccines:,}\n"
        f"  Associated Genes:{total_genes:,}\n"
        f"  Unique PMIDs:    {total_pmids:,}\n\n"
        "Data source: PubMed co-occurrence mining for vaccine-gene associations "
        "using the Vaccine Ontology (VO)."
    )


# ---------------------------------------------------------------------------
# Tool dispatch table
# ---------------------------------------------------------------------------

_TOOL_HANDLERS = {
    "ignet_search_genes": _tool_ignet_search_genes,
    "ignet_get_gene_neighbors": _tool_ignet_get_gene_neighbors,
    "ignet_get_gene_pair_evidence": _tool_ignet_get_gene_pair_evidence,
    "ignet_get_stats": _tool_ignet_get_stats,
    "ignet_get_enrichment": _tool_ignet_get_enrichment,
    "vignet_search_vaccines": _tool_vignet_search_vaccines,
    "vignet_get_vaccine_genes": _tool_vignet_get_vaccine_genes,
    "vignet_get_vaccine_stats": _tool_vignet_get_vaccine_stats,
}


# ---------------------------------------------------------------------------
# JSON-RPC helpers
# ---------------------------------------------------------------------------

def _ok(id_, result):
    return {"jsonrpc": "2.0", "id": id_, "result": result}


def _err(id_, code: int, message: str):
    return {"jsonrpc": "2.0", "id": id_, "error": {"code": code, "message": message}}


# ---------------------------------------------------------------------------
# Method handlers
# ---------------------------------------------------------------------------

def _handle_initialize(id_, params: dict):
    client_version = (params.get("protocolVersion") or "2025-03-26")
    return _ok(id_, {
        "protocolVersion": "2025-03-26",
        "capabilities": {"tools": {}},
        "serverInfo": {
            "name": "hurlab-ignet-vignet",
            "version": "1.0.0",
        },
    })


def _handle_tools_list(id_, _params):
    return _ok(id_, {"tools": _TOOLS})


def _handle_tools_call(id_, params: dict):
    tool_name = (params.get("name") or "").strip()
    tool_params = params.get("arguments") or params.get("params") or {}

    if tool_name not in _TOOL_HANDLERS:
        return _err(id_, -32601, f"Unknown tool: {tool_name!r}")

    if not isinstance(tool_params, dict):
        return _err(id_, -32602, "Tool arguments must be a JSON object.")

    try:
        text = _TOOL_HANDLERS[tool_name](tool_params)
    except Exception as exc:
        logger.exception("Unhandled error in tool %r: %s", tool_name, exc)
        text = f"Internal error executing tool '{tool_name}': {exc}"

    return _ok(id_, {
        "content": [{"type": "text", "text": text}],
        "isError": text.startswith("Error:") or text.startswith("Database error:"),
    })


# ---------------------------------------------------------------------------
# Main POST handler
# ---------------------------------------------------------------------------

_METHOD_HANDLERS = {
    "initialize": _handle_initialize,
    "tools/list": _handle_tools_list,
    "tools/call": _handle_tools_call,
}


@mcp_bp.route("/mcp", methods=["POST"])
def mcp_handler():
    """
    MCP Streamable HTTP transport endpoint.

    Accepts a single JSON-RPC 2.0 request object or a batch array.
    Returns the corresponding response object(s).
    """
    body = request.get_json(silent=True, force=True)
    if body is None:
        resp = _err(None, -32700, "Parse error: request body must be valid JSON.")
        return jsonify(resp), 400

    # Batch requests
    if isinstance(body, list):
        responses = []
        for item in body:
            if not isinstance(item, dict):
                responses.append(_err(None, -32600, "Invalid Request: array element is not an object."))
            else:
                responses.append(_dispatch(item))
        return jsonify(responses)

    # Single request
    if not isinstance(body, dict):
        resp = _err(None, -32600, "Invalid Request: body must be a JSON object or array.")
        return jsonify(resp), 400

    return jsonify(_dispatch(body))


def _dispatch(req: dict):
    """Dispatch a single JSON-RPC request dict."""
    if req.get("jsonrpc") != "2.0":
        return _err(req.get("id"), -32600, "Invalid Request: 'jsonrpc' must be '2.0'.")

    method = req.get("method", "")
    id_ = req.get("id")
    params = req.get("params") or {}

    handler = _METHOD_HANDLERS.get(method)
    if handler is None:
        return _err(id_, -32601, f"Method not found: {method!r}")

    try:
        return handler(id_, params)
    except Exception as exc:
        logger.exception("JSON-RPC dispatch error for method %r: %s", method, exc)
        return _err(id_, -32603, f"Internal error: {exc}")
