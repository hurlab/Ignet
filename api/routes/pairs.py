"""
Gene-pair interaction endpoints.

GET /api/v1/pairs/<sym1>/<sym2> - evidence sentences for a gene pair
"""

import logging

from flask import Blueprint, jsonify, request

from db import db_connection
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)

pairs_bp = Blueprint("pairs", __name__)


def _parse_pagination(args) -> tuple[int, int]:
    try:
        page = max(1, int(args.get("page", 1)))
    except (ValueError, TypeError):
        page = 1
    try:
        per_page = min(200, max(1, int(args.get("per_page", 50))))
    except (ValueError, TypeError):
        per_page = 50
    return page, per_page


_SORT_COLS = {"score", "hasVaccine", "PMID", "sentenceID", "geneSymbol1", "geneSymbol2"}
_SORT_ORDERS = {"ASC", "DESC"}

# ---------------------------------------------------------------------------
# GET /api/v1/pairs/<sym1>/<sym2>
# ---------------------------------------------------------------------------


@pairs_bp.route("/pairs/<sym1>/<sym2>", methods=["GET"])
def get_pair_interactions(sym1: str, sym2: str):
    """
    Return evidence sentences for the interaction between sym1 and sym2.

    Query params:
      score     - minimum score threshold (float)
      has_vaccine - Y or N
      keywords  - full-text search on sentence
      page      - page number (default 1)
      per_page  - results per page (default 50, max 200)
      sort_by   - sort column
      order     - ASC or DESC
    """
    clean1 = sanitize_gene_symbol(sym1)
    clean2 = sanitize_gene_symbol(sym2)
    if not clean1 or not clean2:
        return jsonify({"error": "InvalidInput", "message": "Invalid gene symbol(s)."}), 400

    # Optional filters
    score_raw = request.args.get("score", "")
    has_vaccine_raw = request.args.get("has_vaccine", "").strip().upper()
    keywords_raw = request.args.get("keywords", "").strip()
    page, per_page = _parse_pagination(request.args)
    offset = (page - 1) * per_page

    sort_by_raw = request.args.get("sort_by", "score").strip()
    order_raw = request.args.get("order", "DESC").strip().upper()
    sort_col = sort_by_raw if sort_by_raw in _SORT_COLS else "score"
    sort_order = order_raw if order_raw in _SORT_ORDERS else "DESC"

    # Filter fragments
    extra_sql = ""
    extra_params: list = []

    if score_raw:
        try:
            extra_sql += "AND h.score > %s "
            extra_params.append(float(score_raw))
        except ValueError:
            pass

    if has_vaccine_raw in ("Y", "N"):
        extra_sql += "AND h.hasVaccine = %s "
        extra_params.append(1 if has_vaccine_raw == "Y" else 0)

    if keywords_raw:
        ft_kw = re.sub(r"[+\-><()~*\"@]", " ", keywords_raw).strip()
        if ft_kw:
            extra_sql += "AND MATCH(h.sentence) AGAINST (%s IN BOOLEAN MODE) "
            extra_params.append(ft_kw)

    # Pair match: bidirectional
    pair_sql = (
        "((h.geneSymbol1 = %s AND h.geneSymbol2 = %s) "
        " OR (h.geneSymbol1 = %s AND h.geneSymbol2 = %s))"
    )
    pair_params = [clean1, clean2, clean2, clean1]

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # COUNT
            count_sql = f"""
                SELECT COUNT(*) AS total
                FROM t_sentence_hit_gene2gene_Host h
                WHERE {pair_sql} {extra_sql}
            """
            cursor.execute(count_sql, pair_params + extra_params)
            row = cursor.fetchone()
            total = int(row["total"]) if row else 0

            # Data with LEFT JOIN for sentence text and INO terms
            # ino_host25 uses sentence_id (int) and columns: id, matching_phrase
            data_sql = f"""
                SELECT
                    h.*,
                    sp.sentence AS sentence_text,
                    ino.id AS ino_id,
                    ino.matching_phrase AS ino_term
                FROM t_sentence_hit_gene2gene_Host h
                LEFT JOIN sentences25_genepair sp
                       ON h.sentenceID = sp.sentenceID
                LEFT JOIN ino_host25 ino
                       ON h.sentenceID = ino.sentence_id
                WHERE {pair_sql} {extra_sql}
                ORDER BY h.{sort_col} {sort_order}
                LIMIT %s OFFSET %s
            """
            cursor.execute(data_sql, pair_params + extra_params + [per_page, offset])
            interactions = cursor.fetchall()

    except Exception as exc:
        logger.exception("Error in get_pair_interactions: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query gene pair interactions."}), 500

    return jsonify({
        "gene1": clean1,
        "gene2": clean2,
        "interactions": interactions,
        "total": total,
        "page": page,
        "per_page": per_page,
    })
