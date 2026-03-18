"""
Gene-related API endpoints.

GET /api/v1/genes/search          - search genes by symbol/name
GET /api/v1/genes/<symbol>/neighbors - gene interaction neighbors
"""

import re
import logging

from flask import Blueprint, jsonify, request

from db import db_connection

logger = logging.getLogger(__name__)

genes_bp = Blueprint("genes", __name__)

# ---------------------------------------------------------------------------
# Input sanitisation helpers
# ---------------------------------------------------------------------------

_GENE_SYMBOL_RE = re.compile(r"^[A-Za-z0-9._-]{1,60}$")


def _sanitize_gene_symbol(value: str) -> str | None:
    """Return the symbol if valid, otherwise None."""
    if not value:
        return None
    value = value.strip()
    if _GENE_SYMBOL_RE.match(value):
        return value
    return None


def _parse_pagination(args) -> tuple[int, int]:
    """Return (page, per_page) with sane bounds."""
    try:
        page = max(1, int(args.get("page", 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        per_page = min(200, max(1, int(args.get("per_page", 50))))
    except (ValueError, TypeError):
        per_page = 50
    return page, per_page


# ---------------------------------------------------------------------------
# GET /api/v1/genes/search
# ---------------------------------------------------------------------------

@genes_bp.route("/genes/search", methods=["GET"])
def search_genes():
    """
    Search genes by symbol, locustag, synonyms, dbxrefs, or description.

    Query params:
      q        - search term (required)
      species  - optional species filter (maps to tax_id in t_gene_info)
      page     - page number (default 1)
      per_page - results per page (default 50, max 200)
    """
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "MissingParameter", "message": "Query parameter 'q' is required."}), 400

    species = request.args.get("species", "").strip()
    page, per_page = _parse_pagination(request.args)
    offset = (page - 1) * per_page

    like_term = f"%{q}%"

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # t_gene_info has columns: GeneID, Symbol, Synonyms, description, tax_id
            count_sql = """
                SELECT COUNT(*) AS total
                FROM t_gene_info
                WHERE (Symbol LIKE %s OR Synonyms LIKE %s OR description LIKE %s)
            """
            count_params = [like_term, like_term, like_term]
            if species:
                count_sql += " AND tax_id = %s"
                count_params.append(species)
            cursor.execute(count_sql, count_params)
            row = cursor.fetchone()
            total = int(row["total"]) if row else 0

            data_sql = """
                SELECT GeneID, Symbol, Synonyms, description, tax_id,
                       type_of_gene, chromosome
                FROM t_gene_info
                WHERE (Symbol LIKE %s OR Synonyms LIKE %s OR description LIKE %s)
            """
            data_params = [like_term, like_term, like_term]
            if species:
                data_sql += " AND tax_id = %s"
                data_params.append(species)
            data_sql += " ORDER BY Symbol ASC LIMIT %s OFFSET %s"
            data_params += [per_page, offset]
            cursor.execute(data_sql, data_params)
            genes = cursor.fetchall()

    except Exception as exc:
        logger.exception("Error in search_genes: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query genes."}), 500

    return jsonify({
        "genes": genes,
        "total": total,
        "page": page,
        "per_page": per_page,
    })


# ---------------------------------------------------------------------------
# GET /api/v1/genes/<symbol>/neighbors
# ---------------------------------------------------------------------------

_SORT_COLS = {"score", "hasVaccine", "neighbor", "PMID"}
_SORT_ORDERS = {"ASC", "DESC"}


@genes_bp.route("/genes/<symbol>/neighbors", methods=["GET"])
def gene_neighbors(symbol: str):
    """
    Return genes paired with <symbol> in t_sentence_hit_gene2gene_Host.

    Query params:
      score     - minimum score threshold (float)
      has_vaccine - Y or N filter on hasVaccine column
      keywords  - full-text keyword filter on sentence
      page      - page number (default 1)
      per_page  - results per page (default 50, max 200)
      sort_by   - column to sort by (score, hasVaccine, neighbor, PMID)
      order     - ASC or DESC
    """
    clean_symbol = _sanitize_gene_symbol(symbol)
    if not clean_symbol:
        return jsonify({"error": "InvalidInput", "message": "Invalid gene symbol."}), 400

    # Parse optional filters
    score_raw = request.args.get("score", "")
    has_vaccine_raw = request.args.get("has_vaccine", "").strip().upper()
    keywords_raw = request.args.get("keywords", "").strip()
    page, per_page = _parse_pagination(request.args)
    offset = (page - 1) * per_page

    sort_by_raw = request.args.get("sort_by", "score").strip()
    order_raw = request.args.get("order", "DESC").strip().upper()
    sort_col = sort_by_raw if sort_by_raw in _SORT_COLS else "score"
    sort_order = order_raw if order_raw in _SORT_ORDERS else "DESC"

    # Build score filter
    score_filter_sql = ""
    score_params: list = []
    if score_raw:
        try:
            score_val = float(score_raw)
            score_filter_sql = "AND score > %s "
            score_params = [score_val]
        except ValueError:
            pass

    # Build vaccine filter
    vaccine_filter_sql = ""
    vaccine_params: list = []
    if has_vaccine_raw in ("Y", "N"):
        vaccine_val = 1 if has_vaccine_raw == "Y" else 0
        vaccine_filter_sql = "AND hasVaccine = %s "
        vaccine_params = [vaccine_val]

    # Build keyword filter
    kw_filter_sql = ""
    kw_params: list = []
    if keywords_raw:
        ft_kw = re.sub(r"[+\-><()~*\"@]", " ", keywords_raw).strip()
        if ft_kw:
            kw_filter_sql = "AND MATCH(sentence) AGAINST (%s IN BOOLEAN MODE) "
            kw_params = [ft_kw]

    # Combined filter fragments
    filters = score_filter_sql + vaccine_filter_sql + kw_filter_sql
    filter_params = score_params + vaccine_params + kw_params

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # COUNT using UNION
            count_sql = f"""
                SELECT COUNT(*) AS total FROM (
                    (SELECT geneSymbol2 AS neighbor
                     FROM t_sentence_hit_gene2gene_Host
                     WHERE geneSymbol1 = %s {filters})
                    UNION ALL
                    (SELECT geneSymbol1 AS neighbor
                     FROM t_sentence_hit_gene2gene_Host
                     WHERE geneSymbol2 = %s {filters})
                ) AS combined
            """
            cursor.execute(count_sql, [clean_symbol] + filter_params + [clean_symbol] + filter_params)
            row = cursor.fetchone()
            total = int(row["total"]) if row else 0

            # Data query using UNION
            data_sql = f"""
                SELECT neighbor, score, hasVaccine, PMID, sentenceID
                FROM (
                    (SELECT geneSymbol2 AS neighbor, score, hasVaccine, PMID, sentenceID
                     FROM t_sentence_hit_gene2gene_Host
                     WHERE geneSymbol1 = %s {filters})
                    UNION ALL
                    (SELECT geneSymbol1 AS neighbor, score, hasVaccine, PMID, sentenceID
                     FROM t_sentence_hit_gene2gene_Host
                     WHERE geneSymbol2 = %s {filters})
                ) AS combined
                ORDER BY {sort_col} {sort_order}
                LIMIT %s OFFSET %s
            """
            cursor.execute(
                data_sql,
                [clean_symbol] + filter_params + [clean_symbol] + filter_params + [per_page, offset],
            )
            neighbors = cursor.fetchall()

    except Exception as exc:
        logger.exception("Error in gene_neighbors: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query gene neighbors."}), 500

    return jsonify({
        "gene": clean_symbol,
        "neighbors": neighbors,
        "total": total,
        "page": page,
        "per_page": per_page,
    })
