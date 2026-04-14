"""
Gene-pair interaction endpoints.

GET  /api/v1/pairs/<sym1>/<sym2>          - evidence sentences for a gene pair
POST /api/v1/pairs/<sym1>/<sym2>/predict  - run BioBERT prediction on unscored sentences
"""

import logging
import re

import requests as http_requests
from flask import Blueprint, jsonify, request

from config import BIOBERT_URL as _BIOBERT_BASE
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


_SORT_COLS = {"score", "has_vaccine", "pmid", "sentence_id", "gene_symbol1", "gene_symbol2"}
# NOTE: "score" is a valid sort column for confidence-based ordering of evidence.
BIOBERT_URL = f"{_BIOBERT_BASE}/biobert/"
_SORT_ORDERS = {"ASC", "DESC"}

# ---------------------------------------------------------------------------
# GET /api/v1/pairs/<sym1>/<sym2>
# ---------------------------------------------------------------------------


@pairs_bp.route("/pairs/<sym1>/<sym2>", methods=["GET"])
def get_pair_interactions(sym1: str, sym2: str):
    """
    Return evidence sentences for the interaction between sym1 and sym2.

    Query params:
      score           - minimum score threshold (float)
      has_vaccine     - Y or N
      keywords        - full-text search on sentence
      page            - page number (default 1)
      per_page        - results per page (default 50, max 200)
      sort_by         - sort column (supports 'score' for confidence ordering)
      order           - ASC or DESC
      include_summary - when 'true', include BioBERT prediction_summary aggregate
    """
    clean1 = sanitize_gene_symbol(sym1)
    clean2 = sanitize_gene_symbol(sym2)
    if not clean1 or not clean2:
        return jsonify({"error": "InvalidInput", "message": "Invalid gene symbol(s)."}), 400

    # Optional filters
    score_raw = request.args.get("score", "")
    has_vaccine_raw = request.args.get("has_vaccine", "").strip().upper()
    keywords_raw = request.args.get("keywords", "").strip()
    include_summary = request.args.get("include_summary", "").strip().lower() == "true"
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
        extra_sql += "AND h.has_vaccine = %s "
        extra_params.append(1 if has_vaccine_raw == "Y" else 0)

    # Keyword filter disabled: t_gene_pairs has no sentence column.
    # Sentence text is in t_sentences, would require a JOIN + LIKE which is too slow for 5M rows.
    # TODO: re-enable with FULLTEXT index on t_sentences if keyword filtering is needed.

    # Pair match: bidirectional
    pair_sql = (
        "((h.gene_symbol1 = %s AND h.gene_symbol2 = %s) "
        " OR (h.gene_symbol1 = %s AND h.gene_symbol2 = %s))"
    )
    pair_params = [clean1, clean2, clean2, clean1]

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # COUNT
            count_sql = f"""
                SELECT COUNT(*) AS total
                FROM t_gene_pairs h
                WHERE {pair_sql} {extra_sql}
            """
            cursor.execute(count_sql, pair_params + extra_params)
            row = cursor.fetchone()
            total = int(row["total"]) if row else 0

            # Data with LEFT JOIN for sentence text and INO terms
            # t_ino uses sentence_id (int) and columns: id, matching_phrase
            data_sql = f"""
                SELECT
                    h.*,
                    sp.sentence AS sentence_text,
                    ino.ino_id AS ino_id,
                    ino.matching_phrase AS matching_phrase
                FROM t_gene_pairs h
                LEFT JOIN t_sentences sp
                       ON h.sentence_id = sp.sentence_id
                LEFT JOIN t_ino ino
                       ON h.sentence_id = ino.sentence_id
                WHERE {pair_sql} {extra_sql}
                ORDER BY h.{sort_col} {sort_order}
                LIMIT %s OFFSET %s
            """
            cursor.execute(data_sql, pair_params + extra_params + [per_page, offset])
            interactions = cursor.fetchall()

            # Optional BioBERT prediction summary aggregate
            prediction_summary = None
            if include_summary:
                # Bidirectional pair params (4 positional values)
                summary_pair_params = [clean1, clean2, clean2, clean1]
                summary_sql = """
                    SELECT
                        COUNT(*) AS total_sentences,
                        COUNT(score) AS scored_sentences,
                        AVG(score) AS avg_confidence,
                        SUM(CASE WHEN score > 0.8 THEN 1 ELSE 0 END) AS high_confidence_count
                    FROM t_gene_pairs
                    WHERE (gene_symbol1 = %s AND gene_symbol2 = %s)
                       OR (gene_symbol1 = %s AND gene_symbol2 = %s)
                """
                cursor.execute(summary_sql, summary_pair_params)
                summary_row = cursor.fetchone()
                if summary_row:
                    prediction_summary = {
                        "total_sentences": int(summary_row["total_sentences"] or 0),
                        "scored_sentences": int(summary_row["scored_sentences"] or 0),
                        "avg_confidence": float(summary_row["avg_confidence"]) if summary_row["avg_confidence"] is not None else None,
                        "high_confidence_count": int(summary_row["high_confidence_count"] or 0),
                    }

            cursor.close()

    except Exception as exc:
        logger.exception("Error in get_pair_interactions: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to query gene pair interactions."}), 500

    response: dict = {
        "data": {
            "gene1": clean1,
            "gene2": clean2,
            "page": page,
            "per_page": per_page,
        },
        "interactions": interactions,
        "total": total,
    }
    if prediction_summary is not None:
        response["prediction_summary"] = prediction_summary

    return jsonify(response)


# ---------------------------------------------------------------------------
# POST /api/v1/pairs/<sym1>/<sym2>/predict
# ---------------------------------------------------------------------------


@pairs_bp.route("/pairs/<sym1>/<sym2>/predict", methods=["POST"])
def predict_pair(sym1: str, sym2: str):
    """
    Run BioBERT prediction on unscored sentences for this gene pair.

    Fetches up to 100 sentences where score IS NULL, sends them to the
    BioBERT service at http://localhost:9635/biobert/, stores the returned
    scores, and returns a summary of the operation.
    """
    clean1 = sanitize_gene_symbol(sym1)
    clean2 = sanitize_gene_symbol(sym2)
    if not clean1 or not clean2:
        return jsonify({"error": "InvalidInput", "message": "Invalid gene symbol(s)."}), 400

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Fetch unscored sentences for this pair (bidirectional), limit 100
            fetch_sql = """
                SELECT h.sentence_id, sp.sentence
                FROM t_gene_pairs h
                LEFT JOIN t_sentences sp ON h.sentence_id = sp.sentence_id
                WHERE ((h.gene_symbol1 = %s AND h.gene_symbol2 = %s)
                    OR (h.gene_symbol1 = %s AND h.gene_symbol2 = %s))
                  AND h.score IS NULL
                  AND sp.sentence IS NOT NULL
                LIMIT 100
            """
            cursor.execute(fetch_sql, [clean1, clean2, clean2, clean1])
            unscored = cursor.fetchall()

            if not unscored:
                cursor.close()
                return jsonify({
                    "scored_count": 0,
                    "avg_confidence": None,
                    "message": "No unscored sentences found for this gene pair.",
                })

            # Build payload for BioBERT service
            biobert_payload = [
                {
                    "Sentence": row["sentence"],
                    "ID": row["sentence_id"],
                    "MatchTerm": clean1,
                }
                for row in unscored
            ]

            # Call BioBERT microservice
            try:
                biobert_resp = http_requests.post(
                    BIOBERT_URL,
                    json=biobert_payload,
                    timeout=60,
                )
                biobert_resp.raise_for_status()
                scored_results = biobert_resp.json()
            except http_requests.exceptions.RequestException as exc:
                logger.error("BioBERT service error: %s", exc)
                return jsonify({
                    "error": "BioBERTError",
                    "message": f"BioBERT service unavailable: {exc}",
                }), 502

            # Store scores back into the database
            update_cursor = conn.cursor()
            scored_count = 0
            total_score = 0.0

            for result in scored_results:
                sentence_id = result.get("ID") or result.get("sentence_id")
                score_val = result.get("score") or result.get("Score")
                if sentence_id is not None and score_val is not None:
                    try:
                        score_float = float(score_val)
                        update_cursor.execute(
                            "UPDATE t_gene_pairs SET score = %s WHERE sentence_id = %s",
                            [score_float, sentence_id],
                        )
                        scored_count += 1
                        total_score += score_float
                    except (ValueError, TypeError) as exc:
                        logger.warning("Invalid score value for sentence_id %s: %s", sentence_id, exc)

            conn.commit()
            cursor.close()
            update_cursor.close()

            avg_confidence = (total_score / scored_count) if scored_count > 0 else None

            return jsonify({
                "scored_count": scored_count,
                "avg_confidence": avg_confidence,
                "message": f"Scored {scored_count} sentences for {clean1}-{clean2}.",
            })

    except Exception as exc:
        logger.exception("Error in predict_pair: %s", exc)
        return jsonify({"error": "DatabaseError", "message": "Failed to run prediction."}), 500
