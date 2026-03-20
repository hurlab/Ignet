"""INO (Interaction Network Ontology) browsing endpoints."""
import logging

from flask import Blueprint, jsonify, request

from db import db_connection

logger = logging.getLogger(__name__)
ino_bp = Blueprint("ino", __name__)


@ino_bp.route("/ino/terms", methods=["GET"])
def list_ino_terms():
    """List top INO terms with counts."""
    try:
        limit = min(int(request.args.get("limit", 50)), 100)
    except (ValueError, TypeError):
        return jsonify({"error": "BadRequest", "message": "Invalid limit parameter."}), 400
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT matching_phrase AS term, COUNT(*) AS count
                FROM ino_host25
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

    return jsonify({"data": terms, "total": len(terms)})


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
                SELECT COUNT(DISTINCT CONCAT(h.geneSymbol1, ':', h.geneSymbol2)) AS total
                FROM ino_host25 ino
                JOIN t_sentence_hit_gene2gene_Host h ON ino.sentence_id = h.sentenceID
                WHERE ino.matching_phrase = %s
                """,
                (term,),
            )
            total = cursor.fetchone()["total"]

            # Aggregated gene pairs
            cursor.execute(
                """
                SELECT h.geneSymbol1 AS gene1, h.geneSymbol2 AS gene2,
                       COUNT(*) AS evidence_count,
                       COUNT(DISTINCT h.PMID) AS unique_pmids
                FROM ino_host25 ino
                JOIN t_sentence_hit_gene2gene_Host h ON ino.sentence_id = h.sentenceID
                WHERE ino.matching_phrase = %s
                GROUP BY h.geneSymbol1, h.geneSymbol2
                ORDER BY evidence_count DESC
                LIMIT %s OFFSET %s
                """,
                (term, per_page, offset),
            )
            pairs = cursor.fetchall()

            # Example sentences
            cursor.execute(
                """
                SELECT h.geneSymbol1 AS gene1, h.geneSymbol2 AS gene2,
                       h.sentence, h.PMID
                FROM ino_host25 ino
                JOIN t_sentence_hit_gene2gene_Host h ON ino.sentence_id = h.sentenceID
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
