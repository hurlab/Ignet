#!/bin/bash
# Load pubmed26n data into ignet database (full replacement)
# Usage: bash scripts/03_load_pubmed26n.sh
#
# Prerequisites:
#   1. Full backup verified at /home/juhur/tmp/ignet_backup_20260325/
#   2. Tables renamed + columns cleaned (01_rename_tables.sql executed)
#   3. API code updated (02_update_api_table_names.sh executed)
#   4. Transfer files present in DATA_DIR

set -euo pipefail

DATA_DIR="/home/juhur/tmp/ignet_transfer_2026"
DATE_TAG="260317"
DB_NAME="ignet"
MYSQL_OPTS="--local-infile=1"
LOG_FILE="/home/juhur/tmp/ignet_load_$(date +%Y%m%d_%H%M%S).log"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

log "Starting pubmed26n data load"
log "Data directory: $DATA_DIR"
log "Log file: $LOG_FILE"

# Verify files exist
REQUIRED_FILES=(
    "SciMiner-Host_${DATE_TAG}-BioBERT_Scores.txt"
    "SciMiner-Host_${DATE_TAG}-TwoOrMorePerSentence_Sentences.txt"
    "SciMiner-DrugBank_${DATE_TAG}-PMID2DrugBank-Detail.txt"
    "SciMiner-HDO_${DATE_TAG}-PMID2HDO-Detail.txt"
)

for f in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$DATA_DIR/$f" ]]; then
        log "ERROR: Missing file: $f"
        exit 1
    fi
done
log "All required files present"

# Check optional files
for f in "SciMiner-INO_${DATE_TAG}-Details.txt" "SciMiner-VO_${DATE_TAG}-Details.txt"; do
    if [[ -f "$DATA_DIR/$f" ]]; then
        log "Optional file present: $f ($(wc -l < "$DATA_DIR/$f") lines)"
    else
        log "WARNING: Optional file missing: $f"
    fi
done

# Show file → table mapping
log ""
log "=== File → Table Mapping ==="
log "  BioBERT_Scores.txt        → t_gene_pairs  (sentence_id, pmid, gene_symbol1, gene_symbol2, gene_match1, gene_match2, score)"
log "  TwoOrMore_Sentences.txt   → t_sentences    (sentence_id, pmid, sentence)"
log "  INO_Details.txt           → t_ino          (sentence_id, pmid, ino_id, matching_phrase)"
log "  VO_Details.txt            → t_vo           (sentence_id, pmid, vo_id, matching_phrase)"
log "  DrugBank_Detail.txt       → t_drug         (pmid, drugbank_id, drug_term)"
log "  HDO_Detail.txt            → t_hdo          (pmid, hdo_id, hdo_term)"

# Record before counts
log ""
log "Recording pre-load counts..."
mysql -u ignet $DB_NAME -sN -e "
    SELECT 't_gene_pairs', COUNT(*) FROM t_gene_pairs
    UNION ALL SELECT 't_sentences', COUNT(*) FROM t_sentences
    UNION ALL SELECT 't_ino', COUNT(*) FROM t_ino
    UNION ALL SELECT 't_vo', COUNT(*) FROM t_vo
    UNION ALL SELECT 't_drug', COUNT(*) FROM t_drug
    UNION ALL SELECT 't_hdo', COUNT(*) FROM t_hdo;
" 2>/dev/null | while read tbl cnt; do log "  BEFORE $tbl: $cnt"; done

# Confirm before proceeding
echo ""
echo "This will DELETE ALL existing data from 6 core tables and load pubmed26n data."
echo "Backup location: /home/juhur/tmp/ignet_backup_20260325/"
read -p "Continue? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    log "Aborted by user"
    exit 0
fi

# Step 1: Clear tables
log "Step 1/4: Clearing 6 tables..."
mysql -u ignet $DB_NAME -e "
    TRUNCATE TABLE t_gene_pairs;
    TRUNCATE TABLE t_sentences;
    TRUNCATE TABLE t_ino;
    TRUNCATE TABLE t_vo;
    TRUNCATE TABLE t_drug;
    TRUNCATE TABLE t_hdo;
" 2>&1 | tee -a "$LOG_FILE"
log "Tables cleared"

# Step 2: Load gene pairs with BioBERT scores (single step)
# File columns: #SentID  PMID  geneSymbol1  geneSymbol2  geneMatch1  geneMatch2  score  label
# DB columns:   id(auto) pmid  sentence_id  gene_match1  gene_match2 gene_symbol1 gene_symbol2 score has_vaccine
log ""
log "Step 2/4: Loading gene pairs with BioBERT scores (5.1M rows)..."
mysql -u ignet $DB_NAME $MYSQL_OPTS -e "
LOAD DATA LOCAL INFILE '$DATA_DIR/SciMiner-Host_${DATE_TAG}-BioBERT_Scores.txt'
INTO TABLE t_gene_pairs
FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS
(@sent_id, @pmid, @gene_sym1, @gene_sym2, @gene_match1, @gene_match2, @score, @label)
SET sentence_id=@sent_id, pmid=@pmid,
    gene_symbol1=@gene_sym1, gene_symbol2=@gene_sym2,
    gene_match1=@gene_match1, gene_match2=@gene_match2,
    score=@score, has_vaccine=0;
" 2>&1 | tee -a "$LOG_FILE"
GP_COUNT=$(mysql -u ignet $DB_NAME -sN -e "SELECT COUNT(*) FROM t_gene_pairs;" 2>/dev/null)
SCORED=$(mysql -u ignet $DB_NAME -sN -e "SELECT COUNT(*) FROM t_gene_pairs WHERE score IS NOT NULL;" 2>/dev/null)
log "Gene pairs loaded: $GP_COUNT rows, $SCORED with scores"

# Step 3: Load sentences
# File columns: #SentID  PMID  Sentence
# DB columns:   sentence_id  pmid  sentence
log ""
log "Step 3/4: Loading sentences..."
mysql -u ignet $DB_NAME $MYSQL_OPTS -e "
LOAD DATA LOCAL INFILE '$DATA_DIR/SciMiner-Host_${DATE_TAG}-TwoOrMorePerSentence_Sentences.txt'
INTO TABLE t_sentences
FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS
(@sentence_id, @pmid, @sentence)
SET sentence_id=@sentence_id, pmid=@pmid, sentence=@sentence;
" 2>&1 | tee -a "$LOG_FILE"
SENT_COUNT=$(mysql -u ignet $DB_NAME -sN -e "SELECT COUNT(*) FROM t_sentences;" 2>/dev/null)
log "Sentences loaded: $SENT_COUNT rows"

# Step 4: Load entity tables (INO, VO, Drug, HDO)
log ""
log "Step 4/4: Loading entity tables..."

# INO
# File columns: #SentID  PMID  ID_Type  ID  MatchTerm  Sentence
# DB columns:   id(auto) sentence_id  pmid  ino_id  matching_phrase
INO_FILE="$DATA_DIR/SciMiner-INO_${DATE_TAG}-Details.txt"
if [[ -f "$INO_FILE" ]]; then
    mysql -u ignet $DB_NAME $MYSQL_OPTS -e "
    LOAD DATA LOCAL INFILE '$INO_FILE'
    INTO TABLE t_ino
    FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS
    (@sent_id, @pmid, @id_type, @ino_id, @match_term, @sentence)
    SET sentence_id=@sent_id, pmid=@pmid, ino_id=@ino_id, matching_phrase=@match_term;
    " 2>&1 | tee -a "$LOG_FILE"
    log "  INO: $(mysql -u ignet $DB_NAME -sN -e "SELECT COUNT(*) FROM t_ino;" 2>/dev/null) rows"
fi

# VO
# File columns: #SentID  PMID  ID_Type  ID  MatchTerm  Sentence
# DB columns:   id(auto) sentence_id  pmid  vo_id  matching_phrase
VO_FILE="$DATA_DIR/SciMiner-VO_${DATE_TAG}-Details.txt"
if [[ -f "$VO_FILE" ]]; then
    mysql -u ignet $DB_NAME $MYSQL_OPTS -e "
    LOAD DATA LOCAL INFILE '$VO_FILE'
    INTO TABLE t_vo
    FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS
    (@sent_id, @pmid, @id_type, @vo_id, @match_term, @sentence)
    SET sentence_id=@sent_id, pmid=@pmid, vo_id=@vo_id, matching_phrase=@match_term;
    " 2>&1 | tee -a "$LOG_FILE"
    log "  VO: $(mysql -u ignet $DB_NAME -sN -e "SELECT COUNT(*) FROM t_vo;" 2>/dev/null) rows"
fi

# DrugBank
# File columns: #PMID  DrugBankID  DrugTerm
# DB columns:   id(auto) pmid  drugbank_id  drug_term
DRUG_FILE="$DATA_DIR/SciMiner-DrugBank_${DATE_TAG}-PMID2DrugBank-Detail.txt"
if [[ -f "$DRUG_FILE" ]]; then
    mysql -u ignet $DB_NAME $MYSQL_OPTS -e "
    LOAD DATA LOCAL INFILE '$DRUG_FILE'
    INTO TABLE t_drug
    FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS
    (@pmid, @drugid, @term)
    SET pmid=@pmid, drugbank_id=@drugid, drug_term=@term;
    " 2>&1 | tee -a "$LOG_FILE"
    log "  Drug: $(mysql -u ignet $DB_NAME -sN -e "SELECT COUNT(*) FROM t_drug;" 2>/dev/null) rows"
fi

# HDO
# File columns: #PMID  HDOID  HDOTerm
# DB columns:   id(auto) pmid  hdo_id  hdo_term
HDO_FILE="$DATA_DIR/SciMiner-HDO_${DATE_TAG}-PMID2HDO-Detail.txt"
if [[ -f "$HDO_FILE" ]]; then
    mysql -u ignet $DB_NAME $MYSQL_OPTS -e "
    LOAD DATA LOCAL INFILE '$HDO_FILE'
    INTO TABLE t_hdo
    FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n' IGNORE 1 ROWS
    (@pmid, @hdoid, @term)
    SET pmid=@pmid, hdo_id=@hdoid, hdo_term=@term;
    " 2>&1 | tee -a "$LOG_FILE"
    log "  HDO: $(mysql -u ignet $DB_NAME -sN -e "SELECT COUNT(*) FROM t_hdo;" 2>/dev/null) rows"
fi

# Add missing indexes
log ""
log "Ensuring indexes..."
mysql -u ignet $DB_NAME -e "
    CREATE INDEX idx_pmid ON t_drug (pmid);
" 2>/dev/null && log "  Created t_drug(pmid) index" || log "  t_drug(pmid) index already exists"
mysql -u ignet $DB_NAME -e "
    CREATE INDEX idx_sentence_id ON t_vo (sentence_id);
" 2>/dev/null && log "  Created t_vo(sentence_id) index" || log "  t_vo(sentence_id) index already exists"

# Final summary
log ""
log "=== LOAD COMPLETE ==="
mysql -u ignet $DB_NAME -sN -e "
    SELECT 't_gene_pairs', COUNT(*) FROM t_gene_pairs
    UNION ALL SELECT 't_sentences', COUNT(*) FROM t_sentences
    UNION ALL SELECT 't_ino', COUNT(*) FROM t_ino
    UNION ALL SELECT 't_vo', COUNT(*) FROM t_vo
    UNION ALL SELECT 't_drug', COUNT(*) FROM t_drug
    UNION ALL SELECT 't_hdo', COUNT(*) FROM t_hdo;
" 2>/dev/null | while read tbl cnt; do log "  AFTER $tbl: $cnt"; done

SCORE_PCT=$(mysql -u ignet $DB_NAME -sN -e "
    SELECT ROUND(COUNT(score) * 100.0 / COUNT(*), 1) FROM t_gene_pairs;
" 2>/dev/null)
log "  BioBERT score coverage: ${SCORE_PCT}%"

log ""
log "Next steps:"
log "  1. Rebuild t_vo_has_gene_data: mysql -u ignet ignet < scripts/04_rebuild_vo_gene_data.sql"
log "  2. Restart API: kill \$(lsof -t -i :9637) && nohup api/venv/bin/python api/run.py &"
log "  3. Verify: curl http://localhost:9637/api/v1/health"
