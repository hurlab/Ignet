"""INO (Interaction Network Ontology) browsing endpoints."""
import json
import logging

from flask import Blueprint, jsonify, request

from db import db_connection, get_redis

logger = logging.getLogger(__name__)
ino_bp = Blueprint("ino", __name__)

# The term listing GROUPs over the whole 54.7M-row t_ino table, which costs
# ~16 s cold — long enough to stall a live demo. The result only changes when
# the nightly loader adds rows, so cache it for a day.
_TERMS_CACHE_TTL = 24 * 60 * 60
_TERMS_CACHE_KEY = "ignet:ino:terms:limit:{limit}"


@ino_bp.route("/ino/terms", methods=["GET"])
def list_ino_terms():
    """List top INO terms with counts."""
    try:
        limit = min(int(request.args.get("limit", 50)), 100)
    except (ValueError, TypeError):
        return jsonify({"error": "BadRequest", "message": "Invalid limit parameter."}), 400

    cache_key = _TERMS_CACHE_KEY.format(limit=limit)
    redis_client = get_redis()
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return jsonify(json.loads(cached))
        except Exception:
            logger.warning("INO terms cache read failed", exc_info=True)

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT matching_phrase AS term, COUNT(*) AS count
                FROM t_ino
                WHERE matching_phrase IS NOT NULL AND matching_phrase != ''
                GROUP BY matching_phrase
                ORDER BY count DESC
                LIMIT %s
                """,
                (limit,),
            )
            terms = cursor.fetchall()
            cursor.close()
    except Exception as exc:
        logger.exception("Error listing INO terms: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    result = {"data": terms, "total": len(terms)}

    if redis_client:
        try:
            redis_client.set(cache_key, json.dumps(result), ex=_TERMS_CACHE_TTL)
        except Exception:
            logger.warning("INO terms cache write failed", exc_info=True)

    return jsonify(result)


@ino_bp.route("/ino/terms/<term>/genes", methods=["GET"])
def genes_by_ino_term(term: str):
    """Get gene pairs associated with a specific INO term."""
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(int(request.args.get("per_page", 50)), 200)
    except (ValueError, TypeError):
        return jsonify({"error": "BadRequest", "message": "Invalid pagination parameters."}), 400
    offset = (page - 1) * per_page

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Count distinct gene pairs
            cursor.execute(
                """
                SELECT COUNT(DISTINCT CONCAT(h.gene_symbol1, ':', h.gene_symbol2)) AS total
                FROM t_ino ino
                JOIN t_gene_pairs h ON ino.sentence_id = h.sentence_id
                WHERE ino.matching_phrase = %s
                """,
                (term,),
            )
            total = cursor.fetchone()["total"]

            # Aggregated gene pairs
            cursor.execute(
                """
                SELECT h.gene_symbol1 AS gene1, h.gene_symbol2 AS gene2,
                       COUNT(*) AS evidence_count,
                       COUNT(DISTINCT h.pmid) AS unique_pmids
                FROM t_ino ino
                JOIN t_gene_pairs h ON ino.sentence_id = h.sentence_id
                WHERE ino.matching_phrase = %s
                GROUP BY h.gene_symbol1, h.gene_symbol2
                ORDER BY evidence_count DESC
                LIMIT %s OFFSET %s
                """,
                (term, per_page, offset),
            )
            pairs = cursor.fetchall()

            # Example sentences
            cursor.execute(
                """
                SELECT h.gene_symbol1 AS gene1, h.gene_symbol2 AS gene2,
                       s.sentence, h.pmid
                FROM t_ino ino
                JOIN t_gene_pairs h ON ino.sentence_id = h.sentence_id
                LEFT JOIN t_sentences s ON h.sentence_id = s.sentence_id
                WHERE ino.matching_phrase = %s
                LIMIT 5
                """,
                (term,),
            )
            examples = cursor.fetchall()

            cursor.close()
    except Exception as exc:
        logger.exception("Error fetching genes by INO term: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    return jsonify({
        "term": term,
        "data": pairs,
        "examples": examples,
        "total": total,
        "page": page,
        "per_page": per_page,
    })
