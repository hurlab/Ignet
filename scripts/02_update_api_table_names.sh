#!/bin/bash
# Update all API route files to use new table + column names
# Run from project root: bash scripts/02_update_api_table_names.sh

set -euo pipefail

API_DIR="/data/var/www/html/ignet/api/routes"
SCRIPTS_DIR="/data/var/www/html/ignet/scripts"
PIPELINE_DIR="/home/juhur/IgnetSciMiner/automation_scripts/lib"

echo "=== Phase 1: Automated sed replacements ==="

for f in "$API_DIR"/*.py; do
    echo "  Processing: $(basename "$f")"

    # Table names
    sed -i 's/t_sentence_hit_gene2gene_Host/t_gene_pairs/g' "$f"
    sed -i 's/sentences25_genepair/t_sentences/g' "$f"
    sed -i 's/sentences25_Host/t_sentences_host_legacy/g' "$f"
    sed -i 's/ino_host25/t_ino/g' "$f"
    sed -i 's/vo_host25/t_vo/g' "$f"

    # Column names: camelCase → snake_case
    sed -i 's/sentenceID/sentence_id/g' "$f"
    sed -i 's/geneSymbol1/gene_symbol1/g' "$f"
    sed -i 's/geneSymbol2/gene_symbol2/g' "$f"
    sed -i 's/geneMatch1/gene_match1/g' "$f"
    sed -i 's/geneMatch2/gene_match2/g' "$f"
    sed -i 's/hasVaccine/has_vaccine/g' "$f"

    # PMID → pmid: Only in SQL contexts (dotted references and SQL keywords)
    # Use targeted patterns to avoid breaking user-facing strings like "(PMID:12345678)"
    sed -i 's/\.PMID/.pmid/g' "$f"              # h.PMID, v.PMID, s.PMID, sp.PMID
    sed -i 's/SELECT PMID/SELECT pmid/g' "$f"    # SELECT PMID
    sed -i 's/DISTINCT PMID/DISTINCT pmid/g' "$f" # COUNT(DISTINCT PMID)
    sed -i 's/WHERE PMID/WHERE pmid/g' "$f"       # WHERE PMID =
    sed -i 's/AND PMID/AND pmid/g' "$f"           # AND PMID =
    sed -i 's/ON PMID/ON pmid/g' "$f"             # JOIN ON PMID
    sed -i 's/BY PMID/BY pmid/g' "$f"             # GROUP BY PMID, ORDER BY PMID
    sed -i "s/\"PMID\"/\"pmid\"/g" "$f"           # dict key "PMID" in Python
    sed -i "s/'PMID'/'pmid'/g" "$f"               # dict key 'PMID'
    sed -i 's/\[\"PMID\"\]/["pmid"]/g' "$f"       # row["PMID"]
    sed -i 's/SET PMID/SET pmid/g' "$f"            # SET PMID=
    sed -i 's/,PMID/,pmid/g' "$f"                 # column list: sentenceID,PMID
    sed -i 's/PMID,/pmid,/g' "$f"                 # column list: PMID,sentenceID
    sed -i 's/(PMID/(pmid/g' "$f"                 # (PMID in SQL
    sed -i 's/PMID)/pmid)/g' "$f"                 # PMID) in SQL
    # DO NOT apply blanket \bPMID\b — it breaks user-facing strings
done

echo "=== Phase 2: Fix t_ino.id → t_ino.ino_id references ==="

# pairs.py: ino.id AS ino_id → ino.ino_id AS ino_id
if [[ -f "$API_DIR/pairs.py" ]]; then
    sed -i 's/ino\.id AS ino_id/ino.ino_id AS ino_id/g' "$API_DIR/pairs.py"
    sed -i 's/ino\.id /ino.ino_id /g' "$API_DIR/pairs.py"
    echo "  Fixed pairs.py: ino.id → ino.ino_id"
fi

# ino.py: any references to the old 'id' column
if [[ -f "$API_DIR/ino.py" ]]; then
    # In t_ino context, 'id' column is now 'ino_id'
    sed -i 's/SELECT id,/SELECT ino_id,/g; s/SELECT id /SELECT ino_id /g' "$API_DIR/ino.py"
    sed -i 's/WHERE id /WHERE ino_id /g; s/WHERE id=/WHERE ino_id=/g' "$API_DIR/ino.py"
    sed -i 's/GROUP BY id/GROUP BY ino_id/g' "$API_DIR/ino.py"
    sed -i 's/\.id AS /\.ino_id AS /g' "$API_DIR/ino.py"
    echo "  Fixed ino.py: id → ino_id"
fi

echo "=== Phase 3: Fix t_vo.id → t_vo.vo_id references in vaccine.py ==="

if [[ -f "$API_DIR/vaccine.py" ]]; then
    # In t_vo context: SELECT id, WHERE id =, GROUP BY id → vo_id
    # These are in SQL strings querying t_vo specifically
    sed -i 's/SELECT id AS vo_id/SELECT vo_id AS vo_id/g' "$API_DIR/vaccine.py"
    sed -i 's/DISTINCT id)/DISTINCT vo_id)/g' "$API_DIR/vaccine.py"
    sed -i 's/DISTINCT id AS/DISTINCT vo_id AS/g' "$API_DIR/vaccine.py"
    sed -i 's/WHERE id = /WHERE vo_id = /g' "$API_DIR/vaccine.py"
    sed -i 's/WHERE id =/WHERE vo_id =/g' "$API_DIR/vaccine.py"
    sed -i 's/GROUP BY id/GROUP BY vo_id/g' "$API_DIR/vaccine.py"
    sed -i 's/FROM t_vo v$/FROM t_vo v/g' "$API_DIR/vaccine.py"
    echo "  Fixed vaccine.py: t_vo.id → t_vo.vo_id"
fi

echo "=== Phase 4: Update pipeline scripts ==="

if [[ -f "$SCRIPTS_DIR/populate_scores.sh" ]]; then
    sed -i 's/t_sentence_hit_gene2gene_Host/t_gene_pairs/g' "$SCRIPTS_DIR/populate_scores.sh"
    sed -i 's/sentences25_genepair/t_sentences/g' "$SCRIPTS_DIR/populate_scores.sh"
    sed -i 's/sentenceID/sentence_id/g' "$SCRIPTS_DIR/populate_scores.sh"
    sed -i 's/geneSymbol1/gene_symbol1/g' "$SCRIPTS_DIR/populate_scores.sh"
    sed -i 's/geneSymbol2/gene_symbol2/g' "$SCRIPTS_DIR/populate_scores.sh"
    echo "  Updated populate_scores.sh"
fi

if [[ -f "$PIPELINE_DIR/db_load.sh" ]]; then
    sed -i 's/t_sentence_hit_gene2gene_Host/t_gene_pairs/g' "$PIPELINE_DIR/db_load.sh"
    sed -i 's/sentences25_genepair/t_sentences/g' "$PIPELINE_DIR/db_load.sh"
    sed -i 's/sentences25_Host/t_sentences_host_legacy/g' "$PIPELINE_DIR/db_load.sh"
    sed -i 's/ino_host25/t_ino/g' "$PIPELINE_DIR/db_load.sh"
    sed -i 's/vo_host25/t_vo/g' "$PIPELINE_DIR/db_load.sh"
    echo "  Updated db_load.sh"
fi

echo "=== Phase 5: Clean __pycache__ ==="
rm -rf "$API_DIR/__pycache__"
echo "  Cleared"

echo "=== Phase 6: Verification ==="

echo "  Checking for old table names..."
OLD_TABLES=$(grep -rn "t_sentence_hit_gene2gene_Host\|sentences25_genepair\|ino_host25\|vo_host25" "$API_DIR"/*.py 2>/dev/null | grep -v "_2024\|_bak\|_legacy\|#" || true)
if [[ -n "$OLD_TABLES" ]]; then
    echo "  WARNING: Old table names still found:"
    echo "$OLD_TABLES"
else
    echo "  OK — no old table names"
fi

echo "  Checking for old column names..."
OLD_COLS=$(grep -rn "geneSymbol1\|geneSymbol2\|geneMatch1\|geneMatch2\|hasVaccine\b" "$API_DIR"/*.py 2>/dev/null | grep -v "#" || true)
if [[ -n "$OLD_COLS" ]]; then
    echo "  WARNING: Old column names still found:"
    echo "$OLD_COLS"
else
    echo "  OK — no old column names"
fi

echo "  Checking for broken ino.id / vo.id references..."
BAD_INO=$(grep -n "ino\.id[^_]" "$API_DIR"/*.py 2>/dev/null || true)
BAD_VO=$(grep -n "\.id AS vo_id\|WHERE id = %s\|WHERE id=" "$API_DIR/vaccine.py" 2>/dev/null | grep -v "vo_id\|ino_id\|drug\|hdo\|auto_increment\|sentence" || true)
if [[ -n "$BAD_INO" || -n "$BAD_VO" ]]; then
    echo "  WARNING: Possible broken id references:"
    [[ -n "$BAD_INO" ]] && echo "$BAD_INO"
    [[ -n "$BAD_VO" ]] && echo "$BAD_VO"
else
    echo "  OK — no broken id references"
fi

echo "  Syntax check..."
/data/var/www/html/ignet/api/venv/bin/python3 -c "
import py_compile, glob, sys
errors = []
for f in glob.glob('$API_DIR/*.py'):
    try:
        py_compile.compile(f, doraise=True)
    except py_compile.PyCompileError as e:
        errors.append(str(e))
if errors:
    print('  SYNTAX ERRORS:')
    for e in errors:
        print(f'    {e}')
    sys.exit(1)
else:
    print('  OK — all Python files compile')
"

echo ""
echo "=== MANUAL REVIEW REQUIRED ==="
echo "  1. Check vaccine.py: all t_vo queries use vo_id (not id)"
echo "  2. Check ino.py: all t_ino queries use ino_id (not id)"
echo "  3. Check pairs.py: ino join uses ino.ino_id"
echo "  4. Check enrichment.py: any INO/VO references"
echo "  5. Verify PMID in user-facing strings is still uppercase where needed"
echo "=== Done ==="
