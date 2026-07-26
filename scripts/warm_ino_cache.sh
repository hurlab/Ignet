#!/usr/bin/env bash
# Pre-warm the INO Explorer caches.
#
# The class drill-down joins t_ino to t_gene_pairs across millions of rows
# (~19 s for a mid-size class, ~26 s for INO_0000157 "regulation") even with
# idx_ino_id_sentence. Responses are cached for 24 h, so the cost is paid once
# per class -- but the first click pays it, which is exactly the wrong moment
# during a live demo.
#
# Run this after an API restart, after the nightly load, or before presenting.
#
# Usage:
#   scripts/warm_ino_cache.sh              # top 15 classes against production
#   scripts/warm_ino_cache.sh 25           # top 25
#   BASE=https://ignet.org/api/v1 scripts/warm_ino_cache.sh
set -uo pipefail

BASE="${BASE:-https://ignet.org/api/v1}"
TOP="${1:-15}"

echo "==> Warming /ino/terms"
curl -s "$BASE/ino/terms?limit=100" -o /tmp/ino_terms_warm.json \
     --max-time 300 -w "    terms: HTTP:%{http_code} %{time_total}s\n"

# Warm the drill-down for the top N classes, in listing order, so the classes a
# demo is most likely to click are the ones already warm.
python3 - "$TOP" <<'PY' > /tmp/ino_warm_list.txt
import json, sys, urllib.parse
top = int(sys.argv[1])
try:
    data = json.load(open("/tmp/ino_terms_warm.json")).get("data", [])
except Exception as exc:
    print(f"# could not read term listing: {exc}", file=sys.stderr)
    raise SystemExit(1)
for row in data[:top]:
    ino_id, term = row.get("ino_id"), row.get("term")
    if ino_id and term:
        print(f"{ino_id}\t{urllib.parse.quote(term)}\t{term}")
PY

if [[ ! -s /tmp/ino_warm_list.txt ]]; then
  echo "!! no ontology classes returned -- is t_ino_hierarchy loaded?" >&2
  exit 1
fi

echo "==> Warming top $TOP class drill-downs (first pass is slow by design)"
while IFS=$'\t' read -r ino_id enc_term label; do
  printf '    %-28s ' "$label"
  curl -s "$BASE/ino/terms/$enc_term/genes?ino_id=$ino_id&per_page=50" \
       -o /dev/null --max-time 300 -w "HTTP:%{http_code} %{time_total}s\n"
done < /tmp/ino_warm_list.txt

echo "==> Done. Re-run any URL above to confirm it now returns in ~0.0Xs."
