"""
Gene-related API endpoints.

GET /api/v1/genes/search              - search genes by symbol/name
GET /api/v1/genes/autocomplete        - fast prefix search for gene symbols
GET /api/v1/genes/top                 - top connected genes
GET /api/v1/genes/<symbol>/neighbors  - gene interaction neighbors
GET /api/v1/genes/<symbol>/report     - aggregated gene report card
"""

import logging
import re

from flask import Blueprint, jsonify, request

from db import db_connection, get_redis
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)

genes_bp = Blueprint("genes", __name__)


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
            data_sql += " ORDER BY (Symbol = %s) DESC, (Symbol LIKE %s) DESC, Symbol ASC LIMIT %s OFFSET %s"
            data_params += [q.upper(), f"{q}%", per_page, offset]
            cursor.execute(data_sql, data_params)
            genes = cursor.fetchall()

    except Exception as exc:
        logger.exception("Error in search_genes: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query genes."}), 500

    return jsonify({
        "data": genes,
        "total": total,
        "page": page,
        "per_page": per_page,
    })


# ---------------------------------------------------------------------------
# GET /api/v1/genes/top
# ---------------------------------------------------------------------------


@genes_bp.route("/genes/top", methods=["GET"])
def top_genes():
    """
    Return the most connected genes (by co-occurrence count).
    Cached in Redis for 24 hours.

    Query params:
      limit - max genes to return (default 50, max 200)
    """
    try:
        limit = min(200, max(1, int(request.args.get("limit", 50))))
    except (ValueError, TypeError):
        limit = 50

    redis_client = get_redis()
    cache_key = f"ignet:top_genes:{limit}"

    # Try cache first
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                import json
                return jsonify(json.loads(cached))
        except Exception:
            pass

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT gene, COUNT(*) AS pair_count FROM (
                    SELECT gene_symbol1 AS gene FROM t_gene_pairs
                    UNION ALL
                    SELECT gene_symbol2 AS gene FROM t_gene_pairs
                ) AS g
                WHERE gene IS NOT NULL
                GROUP BY gene
                ORDER BY pair_count DESC
                LIMIT %s
                """,
                (limit,),
            )
            genes = cursor.fetchall()

    except Exception as exc:
        logger.exception("Error in top_genes: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query top genes."}), 500

    result = {"data": genes, "total": len(genes)}

    # Cache for 24 hours
    if redis_client:
        try:
            import json
            redis_client.set(cache_key, json.dumps(result), ex=86400)
        except Exception:
            pass

    return jsonify(result)


# ---------------------------------------------------------------------------
# GET /api/v1/genes/autocomplete
# ---------------------------------------------------------------------------


@genes_bp.route("/genes/autocomplete", methods=["GET"])
def autocomplete_genes():
    """
    Fast prefix search on gene symbols.

    Query params:
      q     - prefix to search (required, min 2 chars)
      limit - max results to return (default 10, max 20)

    Returns genes whose Symbol starts with the given prefix.
    """
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({
            "error": "InvalidInput",
            "message": "Query parameter 'q' must be at least 2 characters.",
        }), 400

    # Allow only alphanumeric and a few safe chars for prefix search
    if not re.match(r"^[A-Za-z0-9._-]{2,60}$", q):
        return jsonify({
            "error": "InvalidInput",
            "message": "Query parameter 'q' contains invalid characters.",
        }), 400

    try:
        limit = min(20, max(1, int(request.args.get("limit", 10))))
    except (ValueError, TypeError):
        limit = 10

    prefix = f"{q}%"

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT GeneID, Symbol, description FROM t_gene_info WHERE Symbol LIKE %s LIMIT %s",
                (prefix, limit),
            )
            genes = cursor.fetchall()

    except Exception as exc:
        logger.exception("Error in autocomplete_genes: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query genes."}), 500

    results = [
        {"gene_id": row["GeneID"], "symbol": row["Symbol"], "description": row["description"]}
        for row in genes
    ]

    return jsonify({"data": results, "total": len(results)})


# ---------------------------------------------------------------------------
# GET /api/v1/genes/<symbol>/neighbors
# ---------------------------------------------------------------------------

_SORT_COLS = {"count", "score", "neighbor", "unique_pmids"}
_SORT_ORDERS = {"ASC", "DESC"}


@genes_bp.route("/genes/<symbol>/neighbors", methods=["GET"])
def gene_neighbors(symbol: str):
    """
    Return genes paired with <symbol> in t_gene_pairs.

    Query params:
      score     - minimum score threshold (float)
      has_vaccine - Y or N filter on has_vaccine column
      keywords  - full-text keyword filter on sentence
      page      - page number (default 1)
      per_page  - results per page (default 50, max 200)
      sort_by   - column to sort by (count, score, neighbor, unique_pmids)
      order     - ASC or DESC
    """
    clean_symbol = sanitize_gene_symbol(symbol)
    if not clean_symbol:
        return jsonify({"error": "InvalidInput", "message": "Invalid gene symbol."}), 400

    # Parse optional filters
    score_raw = request.args.get("score", "")
    has_vaccine_raw = request.args.get("has_vaccine", "").strip().upper()
    keywords_raw = request.args.get("keywords", "").strip()
    page, per_page = _parse_pagination(request.args)
    offset = (page - 1) * per_page

    sort_by_raw = request.args.get("sort_by", "count").strip()
    order_raw = request.args.get("order", "DESC").strip().upper()
    sort_col = sort_by_raw if sort_by_raw in _SORT_COLS else "count"
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
        vaccine_filter_sql = "AND has_vaccine = %s "
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

            # COUNT distinct neighbors using UNION
            count_sql = f"""
                SELECT COUNT(DISTINCT neighbor) AS total FROM (
                    (SELECT gene_symbol2 AS neighbor
                     FROM t_gene_pairs
                     WHERE gene_symbol1 = %s {filters})
                    UNION ALL
                    (SELECT gene_symbol1 AS neighbor
                     FROM t_gene_pairs
                     WHERE gene_symbol2 = %s {filters})
                ) AS combined
            """
            cursor.execute(count_sql, [clean_symbol] + filter_params + [clean_symbol] + filter_params)
            row = cursor.fetchone()
            total = int(row["total"]) if row else 0

            # Aggregated data query: one row per unique neighbor
            data_sql = f"""
                SELECT neighbor,
                       COUNT(*) AS count,
                       COUNT(DISTINCT pmid) AS unique_pmids,
                       MAX(score) AS score
                FROM (
                    (SELECT gene_symbol2 AS neighbor, score, has_vaccine, pmid, sentence_id
                     FROM t_gene_pairs
                     WHERE gene_symbol1 = %s {filters})
                    UNION ALL
                    (SELECT gene_symbol1 AS neighbor, score, has_vaccine, pmid, sentence_id
                     FROM t_gene_pairs
                     WHERE gene_symbol2 = %s {filters})
                ) AS combined
                GROUP BY neighbor
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
        "data": neighbors,
        "total": total,
        "page": page,
        "per_page": per_page,
    })


# ---------------------------------------------------------------------------
# GET /api/v1/genes/<symbol>/report
# ---------------------------------------------------------------------------


@genes_bp.route("/genes/<symbol>/report", methods=["GET"])
def gene_report(symbol: str):
    """
    Aggregated gene report card.

    Returns gene metadata, centrality scores, top neighbors,
    INO interaction type distribution, drug associations, and
    disease associations in a single response.
    """
    clean = sanitize_gene_symbol(symbol)
    if not clean:
        return jsonify({"error": "InvalidSymbol", "message": "Invalid gene symbol."}), 400

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # 1. Gene metadata from t_gene_info
            cursor.execute(
                "SELECT GeneID, Symbol, Synonyms, description, tax_id, type_of_gene, chromosome "
                "FROM t_gene_info WHERE Symbol = %s",
                (clean,),
            )
            gene_info = cursor.fetchone()

            # 2. Centrality scores from t_centrality_score_dignet
            # Fetch all scores for this gene across all query networks
            cursor.execute(
                "SELECT score_type, score, c_query_id FROM t_centrality_score_dignet WHERE genesymbol = %s",
                (clean,),
            )
            all_scores = cursor.fetchall()

            # Find the largest query network ID
            cursor.execute(
                "SELECT c_query_id FROM t_centrality_score_dignet GROUP BY c_query_id ORDER BY COUNT(*) DESC LIMIT 1"
            )
            largest_row = cursor.fetchone()
            largest_qid = largest_row["c_query_id"] if largest_row else None

            # Build three views
            # a) Largest network
            centrality_largest = {}
            for r in all_scores:
                if r["c_query_id"] == largest_qid:
                    centrality_largest[r["score_type"]] = float(r["score"]) if r["score"] else 0

            # b) Average and c) Max across all networks
            from collections import defaultdict
            scores_by_type = defaultdict(list)
            for r in all_scores:
                if r["score"] is not None:
                    scores_by_type[r["score_type"]].append(float(r["score"]))

            centrality_avg = {k: sum(v) / len(v) for k, v in scores_by_type.items()} if scores_by_type else {}
            centrality_max = {k: max(v) for k, v in scores_by_type.items()} if scores_by_type else {}

            centrality = {
                "largest": centrality_largest,
                "average": centrality_avg,
                "max": centrality_max,
            }

            # 2b. Raw interaction counts
            cursor.execute(
                """SELECT COUNT(DISTINCT neighbor) AS total_neighbors,
                          COUNT(DISTINCT pmid) AS total_pmids,
                          COUNT(*) AS total_sentences
                   FROM (
                       (SELECT gene_symbol2 AS neighbor, PMID
                        FROM t_gene_pairs WHERE gene_symbol1 = %s)
                       UNION ALL
                       (SELECT gene_symbol1 AS neighbor, PMID
                        FROM t_gene_pairs WHERE gene_symbol2 = %s)
                   ) AS combined""",
                (clean, clean),
            )
            raw_counts = cursor.fetchone() or {}

            # 3. Top 20 neighbors
            cursor.execute(
                """
                SELECT neighbor, COUNT(*) AS count, COUNT(DISTINCT pmid) AS unique_pmids
                FROM (
                    (SELECT gene_symbol2 AS neighbor, PMID
                     FROM t_gene_pairs WHERE gene_symbol1 = %s)
                    UNION ALL
                    (SELECT gene_symbol1 AS neighbor, PMID
                     FROM t_gene_pairs WHERE gene_symbol2 = %s)
                ) AS combined
                GROUP BY neighbor ORDER BY count DESC LIMIT 20
                """,
                (clean, clean),
            )
            top_neighbors = cursor.fetchall()

            # 4. INO interaction type distribution
            cursor.execute(
                """
                SELECT ino.matching_phrase, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_ino ino ON ino.sentence_id = h.sentence_id
                WHERE h.gene_symbol1 = %s OR h.gene_symbol2 = %s
                GROUP BY ino.matching_phrase
                ORDER BY cnt DESC LIMIT 20
                """,
                (clean, clean),
            )
            ino_distribution = [
                {"term": r["matching_phrase"], "count": r["cnt"]}
                for r in cursor.fetchall()
            ]

            # 5. Drug associations from t_biosummary
            cursor.execute(
                """
                SELECT b.drug_term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE (h.gene_symbol1 = %s OR h.gene_symbol2 = %s)
                  AND b.drug_term IS NOT NULL AND b.drug_term != ''
                GROUP BY b.drug_term ORDER BY cnt DESC LIMIT 15
                """,
                (clean, clean),
            )
            drugs = [{"term": r["drug_term"], "count": r["cnt"]} for r in cursor.fetchall()]

            # 6. Disease associations from t_biosummary
            cursor.execute(
                """
                SELECT b.hdo_term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE (h.gene_symbol1 = %s OR h.gene_symbol2 = %s)
                  AND b.hdo_term IS NOT NULL AND b.hdo_term != ''
                GROUP BY b.hdo_term ORDER BY cnt DESC LIMIT 15
                """,
                (clean, clean),
            )
            diseases = [{"term": r["hdo_term"], "count": r["cnt"]} for r in cursor.fetchall()]

            cursor.close()

    except Exception as exc:
        logger.exception("Error in gene_report: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to build gene report."}), 500

    return jsonify({
        "gene_info": gene_info,
        "centrality": centrality,
        "raw_counts": {
            "neighbors": int(raw_counts.get("total_neighbors") or 0),
            "pmids": int(raw_counts.get("total_pmids") or 0),
            "sentences": int(raw_counts.get("total_sentences") or 0),
        },
        "top_neighbors": top_neighbors,
        "ino_distribution": ino_distribution,
        "drugs": drugs,
        "diseases": diseases,
    })
