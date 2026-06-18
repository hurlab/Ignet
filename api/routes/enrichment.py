"""Gene Set Enrichment endpoints."""
import hashlib
import json
import logging

from flask import Blueprint, jsonify, request

from db import db_connection, get_redis
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)
enrichment_bp = Blueprint("enrichment", __name__)

# Results are derived from co-occurrence data that refreshes at most daily, so a
# 24h cache is safe. The example gene set (and any repeated query) then returns
# instantly without touching the database.
_CACHE_TTL = 86400
_CACHE_VERSION = "v1"


def _cache_key(genes):
    """Content-addressed key: order-independent, deduplicated gene set."""
    norm = ",".join(sorted(set(genes)))
    digest = hashlib.sha1(norm.encode("utf-8")).hexdigest()
    return f"enrichment:{_CACHE_VERSION}:{digest}"


@enrichment_bp.route("/enrichment/analyze", methods=["POST"])
def analyze_gene_set():
    """
    Analyze a set of genes for pairwise interactions, INO distribution,
    drug associations, and disease associations.

    Request body:
      genes - list of gene symbols (2-500)
    """
    body = request.get_json(silent=True)
    if not body or "genes" not in body:
        return jsonify({"error": "MissingParameter", "message": "Provide 'genes' array."}), 400

    raw_genes = body["genes"]
    if not isinstance(raw_genes, list) or len(raw_genes) < 2:
        return jsonify({"error": "InvalidInput", "message": "Provide at least 2 genes."}), 400
    if len(raw_genes) > 500:
        return jsonify({"error": "InvalidInput", "message": "Maximum 500 genes."}), 400

    genes = [sanitize_gene_symbol(g) for g in raw_genes if g]
    genes = [g for g in genes if g]
    if len(genes) < 2:
        return jsonify({"error": "InvalidInput", "message": "At least 2 valid gene symbols required."}), 400

    # 1. Cache lookup — repeated queries (incl. the example set) skip the DB entirely.
    redis_client = get_redis()
    cache_key = _cache_key(genes)
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return jsonify(json.loads(cached))
        except Exception as exc:  # noqa: BLE001 - cache must never break the request
            logger.warning("Enrichment cache read failed: %s", exc)

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            placeholders = ",".join(["%s"] * len(genes))
            params = tuple(genes) + tuple(genes)

            # Materialize the matched gene-pair rows ONCE into a session-scoped
            # temporary table, then derive all four result sets from it. This
            # replaces four independent scans of the 5.4M-row t_gene_pairs table
            # with a single filtered scan. DROP IF EXISTS guards against a
            # leftover table on a reused pooled connection.
            cursor.execute("DROP TEMPORARY TABLE IF EXISTS tmp_enrich")
            cursor.execute(f"""
                CREATE TEMPORARY TABLE tmp_enrich (INDEX(pmid), INDEX(sentence_id)) AS
                SELECT pmid, sentence_id, gene_symbol1, gene_symbol2, score
                FROM t_gene_pairs
                WHERE gene_symbol1 IN ({placeholders}) AND gene_symbol2 IN ({placeholders})
            """, params)

            # 1. Pairwise interactions among the input genes
            cursor.execute("""
                SELECT gene_symbol1 AS gene1, gene_symbol2 AS gene2,
                       COUNT(*) AS evidence_count, COUNT(DISTINCT pmid) AS unique_pmids,
                       CAST(MAX(score) AS DOUBLE) AS max_score
                FROM tmp_enrich
                GROUP BY gene_symbol1, gene_symbol2
            """)
            interactions = cursor.fetchall()

            # 2. INO distribution for these interactions
            cursor.execute("""
                SELECT ino.matching_phrase AS term, COUNT(*) AS cnt
                FROM tmp_enrich h
                JOIN t_ino ino ON ino.sentence_id = h.sentence_id
                GROUP BY ino.matching_phrase ORDER BY cnt DESC LIMIT 20
            """)
            ino_distribution = [dict(r) for r in cursor.fetchall()]

            # 3. Drug associations
            cursor.execute("""
                SELECT b.drug_term AS term, COUNT(*) AS cnt
                FROM tmp_enrich h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE b.drug_term IS NOT NULL AND b.drug_term != ''
                GROUP BY b.drug_term ORDER BY cnt DESC LIMIT 20
            """)
            drugs = [dict(r) for r in cursor.fetchall()]

            # 4. Disease associations
            cursor.execute("""
                SELECT b.hdo_term AS term, COUNT(*) AS cnt
                FROM tmp_enrich h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE b.hdo_term IS NOT NULL AND b.hdo_term != ''
                GROUP BY b.hdo_term ORDER BY cnt DESC LIMIT 20
            """)
            diseases = [dict(r) for r in cursor.fetchall()]

            cursor.execute("DROP TEMPORARY TABLE IF EXISTS tmp_enrich")
            cursor.close()
    except Exception as exc:
        logger.exception("Error in enrichment: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    # Coverage stats
    found_genes = set()
    for i in interactions:
        found_genes.add(i["gene1"])
        found_genes.add(i["gene2"])

    result = {
        "input_genes": genes,
        "coverage": len(found_genes),
        "coverage_pct": round(len(found_genes) / len(genes) * 100, 1) if genes else 0,
        "interactions": interactions,
        "total_interactions": len(interactions),
        "ino_distribution": ino_distribution,
        "drugs": drugs,
        "diseases": diseases,
    }

    if redis_client:
        try:
            redis_client.set(cache_key, json.dumps(result), ex=_CACHE_TTL)
        except Exception as exc:  # noqa: BLE001 - cache write must never break the request
            logger.warning("Enrichment cache write failed: %s", exc)

    return jsonify(result)
