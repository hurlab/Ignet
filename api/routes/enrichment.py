"""Gene Set Enrichment endpoints."""
import logging
from flask import Blueprint, jsonify, request
from db import db_connection
from utils import sanitize_gene_symbol

logger = logging.getLogger(__name__)
enrichment_bp = Blueprint("enrichment", __name__)


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

    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            placeholders = ",".join(["%s"] * len(genes))

            # 1. Find all pairwise interactions among the input genes
            cursor.execute(f"""
                SELECT gene_symbol1 AS gene1, gene_symbol2 AS gene2,
                       COUNT(*) AS evidence_count, COUNT(DISTINCT pmid) AS unique_pmids,
                       MAX(score) AS max_score
                FROM t_gene_pairs
                WHERE gene_symbol1 IN ({placeholders}) AND gene_symbol2 IN ({placeholders})
                GROUP BY gene_symbol1, gene_symbol2
            """, tuple(genes) + tuple(genes))
            interactions = cursor.fetchall()

            # 2. INO distribution for these interactions
            cursor.execute(f"""
                SELECT ino.matching_phrase AS term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_ino ino ON ino.sentence_id = h.sentence_id
                WHERE h.gene_symbol1 IN ({placeholders}) AND h.gene_symbol2 IN ({placeholders})
                GROUP BY ino.matching_phrase ORDER BY cnt DESC LIMIT 20
            """, tuple(genes) + tuple(genes))
            ino_distribution = [dict(r) for r in cursor.fetchall()]

            # 3. Drug associations
            cursor.execute(f"""
                SELECT b.drug_term AS term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE h.gene_symbol1 IN ({placeholders}) AND h.gene_symbol2 IN ({placeholders})
                  AND b.drug_term IS NOT NULL AND b.drug_term != ''
                GROUP BY b.drug_term ORDER BY cnt DESC LIMIT 20
            """, tuple(genes) + tuple(genes))
            drugs = [dict(r) for r in cursor.fetchall()]

            # 4. Disease associations
            cursor.execute(f"""
                SELECT b.hdo_term AS term, COUNT(*) AS cnt
                FROM t_gene_pairs h
                JOIN t_biosummary b ON b.pmid = h.pmid
                WHERE h.gene_symbol1 IN ({placeholders}) AND h.gene_symbol2 IN ({placeholders})
                  AND b.hdo_term IS NOT NULL AND b.hdo_term != ''
                GROUP BY b.hdo_term ORDER BY cnt DESC LIMIT 20
            """, tuple(genes) + tuple(genes))
            diseases = [dict(r) for r in cursor.fetchall()]

            cursor.close()
    except Exception as exc:
        logger.exception("Error in enrichment: %s", exc)
        return jsonify({"error": "DatabaseError"}), 500

    # Coverage stats
    found_genes = set()
    for i in interactions:
        found_genes.add(i["gene1"])
        found_genes.add(i["gene2"])

    return jsonify({
        "input_genes": genes,
        "coverage": len(found_genes),
        "coverage_pct": round(len(found_genes) / len(genes) * 100, 1) if genes else 0,
        "interactions": interactions,
        "total_interactions": len(interactions),
        "ino_distribution": ino_distribution,
        "drugs": drugs,
        "diseases": diseases,
    })
