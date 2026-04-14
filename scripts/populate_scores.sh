#!/usr/bin/env bash
# Populate BioBERT scores in t_gene_pairs from scored tables.
# Run in tmux: tmux new -s scores && bash scripts/populate_scores.sh
set -euo pipefail

echo "=== Populating BioBERT scores ==="
echo "Source 1: t_gene_pairs_2024 (4.3M scored rows)"
echo "Source 2: t_sentence_hit_gene2gene (573K scored rows)"
echo ""

# Step 1: Update from Host_2024 (larger, more recent)
echo "[1/3] Updating from t_gene_pairs_2024 (matching by PMID + gene pair)..."
echo "This may take 10-30 minutes on 15.8M rows..."
mysql -u ignet ignet << 'SQL'
UPDATE t_gene_pairs h
JOIN t_gene_pairs_2024 s
  ON h.PMID = s.PMID
  AND h.gene_symbol1 = s.gene_symbol1
  AND h.gene_symbol2 = s.gene_symbol2
  AND h.sentence_id = s.sentence_id
SET h.score = s.score
WHERE h.score IS NULL AND s.score IS NOT NULL;
SQL
echo "Step 1 done."

# Check progress
mysql -u ignet ignet -e "SELECT COUNT(score) AS scored_after_step1 FROM t_gene_pairs WHERE score IS NOT NULL"

# Step 2: Fill remaining from the older scored table
echo "[2/3] Updating remaining NULLs from t_sentence_hit_gene2gene..."
mysql -u ignet ignet << 'SQL'
UPDATE t_gene_pairs h
JOIN t_sentence_hit_gene2gene s
  ON h.PMID = s.PMID
  AND h.gene_symbol1 = s.gene_symbol1
  AND h.gene_symbol2 = s.gene_symbol2
SET h.score = s.score
WHERE h.score IS NULL AND s.score IS NOT NULL;
SQL
echo "Step 2 done."

# Final count
echo "[3/3] Final score coverage:"
mysql -u ignet ignet -e "
SELECT
  COUNT(*) AS total_rows,
  COUNT(score) AS scored_rows,
  ROUND(COUNT(score) / COUNT(*) * 100, 1) AS coverage_pct,
  ROUND(AVG(score), 4) AS avg_score,
  ROUND(MIN(score), 4) AS min_score,
  ROUND(MAX(score), 4) AS max_score
FROM t_gene_pairs"

echo ""
echo "=== Done ==="
