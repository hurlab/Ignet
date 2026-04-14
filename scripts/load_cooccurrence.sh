#!/usr/bin/env bash
################################################################################
# load_cooccurrence.sh — Load entity co-occurrence pair files into ignet DB
#
# Usage:
#   bash scripts/load_cooccurrence.sh [DATA_DIR] [DATE_TAG]
#
# Examples:
#   bash scripts/load_cooccurrence.sh                                    # defaults
#   bash scripts/load_cooccurrence.sh /home/juhur/tmp/ignet_transfer_2026 260317
#   bash scripts/load_cooccurrence.sh /path/to/new/data 260501
#
# Expects 6 files in DATA_DIR:
#   CoOccurrence-VO_Gene_{TAG}.txt     CoOccurrence-Drug_Gene_{TAG}.txt
#   CoOccurrence-VO_Drug_{TAG}.txt     CoOccurrence-Drug_HDO_{TAG}.txt
#   CoOccurrence-VO_HDO_{TAG}.txt      CoOccurrence-HDO_Gene_{TAG}.txt
#
# Tables cleared and reloaded:
#   t_cooccurrence_vo_gene, t_cooccurrence_vo_drug, t_cooccurrence_vo_hdo
#   t_cooccurrence_drug_gene, t_cooccurrence_drug_hdo, t_cooccurrence_hdo_gene
#   t_vo_has_gene_data (rebuilt from t_cooccurrence_vo_gene)
################################################################################
set -euo pipefail

DATA_DIR="${1:-/home/juhur/tmp/ignet_transfer_2026}"
DATE_TAG="${2:-260317}"
DB_USER="ignet"
DB_NAME="ignet"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $1"; }

log "=== Co-occurrence Data Load ==="
log "Data directory: $DATA_DIR"
log "Date tag: $DATE_TAG"

# Define file-to-table mapping
declare -A FILES COLUMNS
FILES[t_cooccurrence_vo_gene]="CoOccurrence-VO_Gene_${DATE_TAG}.txt"
FILES[t_cooccurrence_vo_drug]="CoOccurrence-VO_Drug_${DATE_TAG}.txt"
FILES[t_cooccurrence_vo_hdo]="CoOccurrence-VO_HDO_${DATE_TAG}.txt"
FILES[t_cooccurrence_drug_gene]="CoOccurrence-Drug_Gene_${DATE_TAG}.txt"
FILES[t_cooccurrence_drug_hdo]="CoOccurrence-Drug_HDO_${DATE_TAG}.txt"
FILES[t_cooccurrence_hdo_gene]="CoOccurrence-HDO_Gene_${DATE_TAG}.txt"

COLUMNS[t_cooccurrence_vo_gene]="vo_id=@c1, gene_symbol=@c2, shared_pmids=@c3, vo_term=@c4, gene_term=@c5"
COLUMNS[t_cooccurrence_vo_drug]="vo_id=@c1, drugbank_id=@c2, shared_pmids=@c3, vo_term=@c4, drug_term=@c5"
COLUMNS[t_cooccurrence_vo_hdo]="vo_id=@c1, hdo_id=@c2, shared_pmids=@c3, vo_term=@c4, hdo_term=@c5"
COLUMNS[t_cooccurrence_drug_gene]="drugbank_id=@c1, gene_symbol=@c2, shared_pmids=@c3, drug_term=@c4, gene_term=@c5"
COLUMNS[t_cooccurrence_drug_hdo]="drugbank_id=@c1, hdo_id=@c2, shared_pmids=@c3, drug_term=@c4, hdo_term=@c5"
COLUMNS[t_cooccurrence_hdo_gene]="hdo_id=@c1, gene_symbol=@c2, shared_pmids=@c3, hdo_term=@c4, gene_term=@c5"

TABLES=(t_cooccurrence_vo_gene t_cooccurrence_vo_drug t_cooccurrence_vo_hdo t_cooccurrence_drug_gene t_cooccurrence_drug_hdo t_cooccurrence_hdo_gene)

# Verify all files exist
missing=0
for tbl in "${TABLES[@]}"; do
    f="$DATA_DIR/${FILES[$tbl]}"
    if [[ ! -f "$f" ]]; then
        log "MISSING: ${FILES[$tbl]}"
        missing=1
    fi
done
if [[ "$missing" -eq 1 ]]; then
    log "ERROR: Missing source files. Aborting."
    exit 1
fi
log "All 6 files present"

# Clear and load each table
for tbl in "${TABLES[@]}"; do
    f="$DATA_DIR/${FILES[$tbl]}"
    rows=$(($(wc -l < "$f") - 1))
    log "Loading ${tbl} from ${FILES[$tbl]} (${rows} rows)..."

    mysql -u "$DB_USER" "$DB_NAME" -e "DELETE FROM ${tbl} WHERE 1=1;" 2>&1
    mysql -u "$DB_USER" "$DB_NAME" --local-infile=1 -e "
LOAD DATA LOCAL INFILE '${f}'
INTO TABLE ${tbl}
FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS
(@c1, @c2, @c3, @c4, @c5)
SET ${COLUMNS[$tbl]};
" 2>&1

    loaded=$(mysql -u "$DB_USER" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM ${tbl};" 2>/dev/null)
    log "  Loaded: ${loaded} rows"
done

# Rebuild t_vo_has_gene_data
log ""
log "Rebuilding t_vo_has_gene_data (all co-occurrence types + ancestors)..."
mysql -u "$DB_USER" "$DB_NAME" -e "
DELETE FROM t_vo_has_gene_data WHERE 1=1;
INSERT INTO t_vo_has_gene_data (vo_id)
SELECT DISTINCT vo_id FROM (
    SELECT vo_id FROM t_cooccurrence_vo_gene
    UNION
    SELECT vo_id FROM t_cooccurrence_vo_drug
    UNION
    SELECT vo_id FROM t_cooccurrence_vo_hdo
) all_vos;
" 2>&1
# Propagate to ancestor VOs so parent nodes are clickable in the hierarchy tree
mysql -u "$DB_USER" "$DB_NAME" -e "
INSERT IGNORE INTO t_vo_has_gene_data (vo_id)
WITH RECURSIVE ancestors AS (
    SELECT DISTINCT parent_vo_id AS vo_id
    FROM t_vo_hierarchy
    WHERE vo_id IN (SELECT vo_id FROM t_vo_has_gene_data)
    AND parent_vo_id IS NOT NULL
    UNION ALL
    SELECT h.parent_vo_id
    FROM t_vo_hierarchy h
    INNER JOIN ancestors a ON h.vo_id = a.vo_id
    WHERE h.parent_vo_id IS NOT NULL
)
SELECT DISTINCT vo_id FROM ancestors
WHERE vo_id NOT IN (SELECT vo_id FROM t_vo_has_gene_data);
" 2>&1
vo_count=$(mysql -u "$DB_USER" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM t_vo_has_gene_data;" 2>/dev/null)
log "  t_vo_has_gene_data: ${vo_count} VO IDs with gene data"

# Summary
log ""
log "=== LOAD COMPLETE ==="
for tbl in "${TABLES[@]}"; do
    cnt=$(mysql -u "$DB_USER" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM ${tbl};" 2>/dev/null)
    log "  ${tbl}: ${cnt}"
done

log ""
log "Next: restart API to pick up changes"
log "  kill \$(lsof -t -i :9637) && sleep 2 && nohup api/venv/bin/python api/run.py &"
