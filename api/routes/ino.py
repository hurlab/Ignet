"""INO (Interaction Network Ontology) browsing endpoints."""
import json
import logging
import re

from flask import Blueprint, jsonify, request

from db import db_connection, get_redis

logger = logging.getLogger(__name__)
ino_bp = Blueprint("ino", __name__)

# The term listing GROUPs over the whole 54.7M-row t_ino table, which costs
# ~16 s cold — long enough to stall a live demo. The result only changes when
# the nightly loader adds rows, so cache it for a day.
_TERMS_CACHE_TTL = 24 * 60 * 60
_TERMS_CACHE_KEY = "ignet:ino:terms:limit:{limit}"

# Ontology ids in t_ino span three namespaces: INO_0000157, MI_0914, GO_0006468
# (plus INO_T* template artifacts). Validate before use.
_INO_ID_RE = re.compile(r"[A-Za-z]+_[A-Za-z0-9]+")

# Per-class gene-pair pages. Keyed by selector + pagination.
# v2: pair grouping now canonicalises orientation, so unversioned entries hold
# the old split rows (A,B) and (B,A). The version segment retires them without
# a flush; bump it again if the pair aggregation changes shape.
_GENES_CACHE_TTL = 24 * 60 * 60
_GENES_CACHE_KEY = "ignet:ino:genes:v2:{sel}:{page}:{per_page}"


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
            try:
                # Group by ontology CLASS, not by the matched phrase. One class
                # covers many phrases (INO_0000157 "regulation" absorbs 69 of
                # them), so grouping on the raw phrase split a single interaction
                # type across many rows and ranked generic English words.
                # Counts come from t_ino_class_summary so this never rescans the
                # 54.7M-row t_ino. INO_T* rows are template artifacts, not
                # ontology classes, and are excluded by namespace.
                cursor.execute(
                    """
                    SELECT h.label AS term, h.ino_id, h.ontology,
                           s.n AS count, s.distinct_pmids,
                           h.parent_ino_id AS parent_id, p.label AS parent
                    FROM t_ino_class_summary s
                    JOIN t_ino_hierarchy h ON h.ino_id = s.ino_id
                    LEFT JOIN t_ino_hierarchy p ON p.ino_id = h.parent_ino_id
                    WHERE h.is_template = 0 AND h.label IS NOT NULL
                    ORDER BY s.n DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
                terms = cursor.fetchall()
            except Exception:
                # The ontology tables ship separately from this code (see
                # scripts/build_ino_hierarchy.py), so a deploy can land first.
                # Degrade to the legacy phrase listing rather than 500.
                logger.warning(
                    "INO ontology tables unavailable; falling back to phrase listing",
                    exc_info=True,
                )
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
    """Get gene pairs associated with a specific INO term.

    Accepts an optional ?ino_id= naming an ontology class. When given, evidence
    is selected by CLASS, which spans every phrase mapped to it -- selecting
    "regulation" then returns all 69 of INO_0000157's phrases rather than the
    single literal string. Without it, the legacy exact-phrase lookup is used so
    existing ?term= permalinks keep working.
    """
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(int(request.args.get("per_page", 50)), 200)
    except (ValueError, TypeError):
        return jsonify({"error": "BadRequest", "message": "Invalid pagination parameters."}), 400
    offset = (page - 1) * per_page

    ino_id = (request.args.get("ino_id") or "").strip()
    if ino_id:
        # Ontology ids are [A-Za-z]+_[A-Za-z0-9]+; reject anything else outright
        # rather than passing unvetted input toward the query layer.
        if not _INO_ID_RE.fullmatch(ino_id):
            return jsonify({"error": "BadRequest", "message": "Invalid ino_id."}), 400
        selector_sql = "ino.ino_id = %s"
        selector_val = ino_id
    else:
        selector_sql = "ino.matching_phrase = %s"
        selector_val = term

    # Even with idx_ino_id_sentence the class join spans millions of rows
    # (~19 s for a mid-size class, ~26 s for INO_0000157). Cache per selector +
    # page so a demo click is paid once; scripts/warm_ino_cache.sh pre-warms it.
    genes_cache_key = _GENES_CACHE_KEY.format(
        sel=ino_id or f"phrase:{term}", page=page, per_page=per_page
    )
    genes_redis = get_redis()
    if genes_redis:
        try:
            cached = genes_redis.get(genes_cache_key)
            if cached:
                return jsonify(json.loads(cached))
        except Exception:
            logger.warning("INO genes cache read failed", exc_info=True)

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Count distinct gene pairs
            cursor.execute(
                """
                SELECT COUNT(DISTINCT CONCAT(h.gene_symbol1, ':', h.gene_symbol2)) AS total
                FROM t_ino ino
                JOIN t_gene_pairs h ON ino.sentence_id = h.sentence_id
                WHERE {selector}
                """.format(selector=selector_sql),
                (selector_val,),
            )
            total = cursor.fetchone()["total"]

            # Aggregated gene pairs
            cursor.execute(
                """
                SELECT LEAST(h.gene_symbol1, h.gene_symbol2)    AS gene1,
                       GREATEST(h.gene_symbol1, h.gene_symbol2) AS gene2,
                       COUNT(*) AS evidence_count,
                       COUNT(DISTINCT h.pmid) AS unique_pmids
                FROM t_ino ino
                JOIN t_gene_pairs h ON ino.sentence_id = h.sentence_id
                WHERE {selector}
                GROUP BY gene1, gene2
                ORDER BY evidence_count DESC
                LIMIT %s OFFSET %s
                """.format(selector=selector_sql),
                (selector_val, per_page, offset),
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
                WHERE {selector}
                LIMIT 5
                """.format(selector=selector_sql),
                (selector_val,),
            )
            examples = cursor.fetchall()

            cursor.close()
    except Exception as exc:
        logger.exception("Error fetching genes by INO term: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    payload = {
        "term": term,
        "ino_id": ino_id or None,
        "data": pairs,
        "examples": examples,
        "total": total,
        "page": page,
        "per_page": per_page,
    }

    if genes_redis:
        try:
            genes_redis.set(genes_cache_key, json.dumps(payload), ex=_GENES_CACHE_TTL)
        except Exception:
            logger.warning("INO genes cache write failed", exc_info=True)

    return jsonify(payload)
