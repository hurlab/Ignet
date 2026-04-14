#!/usr/bin/env bash
# Production build script for Ignet React SPA.
# Ensures clean builds with no stale asset mismatches.
#
# Usage: bash scripts/build.sh
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DIST_DIR="$PROJECT_DIR/dist-react"
ASSETS_DIR="$DIST_DIR/assets"
NPM="$(command -v npm || echo "/home/juhur/miniconda3/envs/openai/bin/npm")"

echo "=== Ignet SPA Build ==="

# Step 1: Build to dist-react (Vite won't empty it, we handle that)
echo "[1/4] Building..."
export PATH="/home/juhur/miniconda3/envs/openai/bin:$PATH"
cd "$FRONTEND_DIR"
$NPM run build --silent 2>&1 | tail -5

# Step 2: Remove ALL assets except those referenced by the new build
echo "[2/4] Cleaning stale assets..."
cd "$ASSETS_DIR"
NEW_INDEX_HTML="$DIST_DIR/index.html"
NEW_MAIN_JS=$(grep -oP 'src="/ignet/assets/\K[^"]+' "$NEW_INDEX_HTML" | head -1)
NEW_CSS=$(grep -oP 'href="/ignet/assets/\K[^"]+' "$NEW_INDEX_HTML" | head -1)
NEW_PRELOAD=$(grep -oP 'href="/ignet/assets/\K[^"]+' "$NEW_INDEX_HTML" | tail -1)

# Get all chunks referenced by the main bundle
REFERENCED="$NEW_MAIN_JS
$NEW_CSS
$NEW_PRELOAD"
if [ -f "$ASSETS_DIR/$NEW_MAIN_JS" ]; then
  CHUNKS=$(grep -oP '[A-Za-z]+-[A-Za-z0-9_-]+\.(js|css)' "$ASSETS_DIR/$NEW_MAIN_JS" 2>/dev/null || true)
  REFERENCED="$REFERENCED
$CHUNKS"
fi

REMOVED=0
shopt -s nullglob
for f in *.js *.css; do
  if ! echo "$REFERENCED" | grep -qF "$f"; then
    rm -f "$f"
    REMOVED=$((REMOVED + 1))
  fi
done
shopt -u nullglob
echo "  Removed $REMOVED stale files"

# Step 3: Verify all referenced assets exist
echo "[3/4] Verifying assets..."
ERRORS=0
for asset in $NEW_MAIN_JS $NEW_CSS $NEW_PRELOAD; do
  if [ ! -f "$ASSETS_DIR/$asset" ]; then
    echo "  ERROR: Missing $asset"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ "$ERRORS" -gt 0 ]; then
  echo "FAILED: $ERRORS missing assets. Build is broken!"
  exit 1
fi

# Step 4: Verify via HTTP if curl is available and site is reachable
echo "[4/4] HTTP verification..."
if command -v curl &>/dev/null; then
  JS_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://ignet.org/ignet/assets/$NEW_MAIN_JS" 2>/dev/null || echo "000")
  CSS_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://ignet.org/ignet/assets/$NEW_CSS" 2>/dev/null || echo "000")
  PAGE_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://ignet.org/ignet/" 2>/dev/null || echo "000")

  if [ "$JS_STATUS" = "200" ] && [ "$CSS_STATUS" = "200" ] && [ "$PAGE_STATUS" = "200" ]; then
    echo "  JS=$JS_STATUS CSS=$CSS_STATUS Page=$PAGE_STATUS — All OK"
  else
    echo "  WARNING: JS=$JS_STATUS CSS=$CSS_STATUS Page=$PAGE_STATUS"
    echo "  Assets may not be served correctly. Check Apache/symlink."
  fi
else
  echo "  curl not found, skipping HTTP check"
fi

TOTAL=$(ls "$ASSETS_DIR"/*.js "$ASSETS_DIR"/*.css 2>/dev/null | wc -l)
echo ""
echo "=== Build complete: $TOTAL assets in $ASSETS_DIR ==="
