#!/usr/bin/env bash
# Deploy the committed local main to the Ignet server.
#
# Flow: assert a clean tree -> push origin/main -> realign the server working
# tree to origin/main over SSH -> report the new HEAD and whether anything under
# api/ changed (which requires a manual `sudo systemctl restart ignet-api`,
# since the server has no passwordless sudo).
#
# Build + commit the frontend BEFORE running this (the server deploys the
# committed dist-react/). Use scripts/deploy.sh --build to build first; it will
# refuse to deploy if the build leaves dist-react/ uncommitted.
#
# Usage:
#   scripts/deploy.sh            # push + deploy what is already committed
#   scripts/deploy.sh --build    # npm run build first, then deploy
set -euo pipefail

SERVER="juhur@134.129.255.147"
SERVER_DIR="/data/var/www/html/ignet"
BRANCH="main"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ "${1:-}" == "--build" ]]; then
  echo "==> Building frontend"
  (cd frontend && npm run build)
fi

# Refuse to deploy a dirty tree — the server resets to origin/main, so anything
# uncommitted (including a fresh dist-react build) would NOT be deployed.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: uncommitted changes present. Commit (incl. dist-react/) before deploying." >&2
  git status --short >&2
  exit 1
fi

BR="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BR" != "$BRANCH" ]]; then
  echo "ERROR: on branch '$BR', expected '$BRANCH'." >&2
  exit 1
fi

echo "==> Pushing $BRANCH to origin"
git push origin "$BRANCH"

echo "==> Realigning server ($SERVER_DIR)"
# The remote prints API_CHANGED (if any api/ file changed) and the new short HEAD.
REMOTE_OUT="$(ssh -o ConnectTimeout=20 "$SERVER" "cd '$SERVER_DIR' && OLD=\$(git rev-parse HEAD) && git fetch origin -q && git reset --hard origin/$BRANCH -q && NEW=\$(git rev-parse --short HEAD) && { git diff --name-only \$OLD HEAD | grep -q '^api/' && echo API_CHANGED || true; } && echo HEAD=\$NEW")"

echo "$REMOTE_OUT"
SERVER_HEAD="$(echo "$REMOTE_OUT" | sed -n 's/^HEAD=//p')"
LOCAL_HEAD="$(git rev-parse --short HEAD)"

if [[ "$SERVER_HEAD" != "$LOCAL_HEAD" ]]; then
  echo "WARNING: server HEAD ($SERVER_HEAD) != local HEAD ($LOCAL_HEAD)." >&2
else
  echo "==> 3-way aligned at $LOCAL_HEAD (local = origin = server)"
fi

if echo "$REMOTE_OUT" | grep -q API_CHANGED; then
  echo ""
  echo "!! api/ changed — restart the API (needs your sudo password):"
  echo "   ssh $SERVER 'sudo systemctl restart ignet-api'"
else
  echo "==> No api/ changes; frontend is live immediately (no restart needed)."
fi
