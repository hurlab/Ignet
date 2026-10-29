#!/usr/bin/env bash
# Deploy origin/main ON the Ignet server (run it there, not from a laptop).
#
# Before running: build + commit the frontend locally (scripts/build.sh; the
# server serves the committed dist-react/ and has no node) and push to origin/main.
#
# On the server (as juhur, not root; sudo is asked for only if api/ changed):
#   bash ~/ignet_deploy.sh            # deploy
#   bash ~/ignet_deploy.sh --check    # show what would be deployed, change nothing
#
# Flow: refuse a server tree with modified tracked files -> fetch -> list incoming
# commits -> reset to origin/main -> if api/ changed, sudo restart ignet-api and
# poll its health -> verify the live page serves the new frontend bundle.
# Log: ~/ignet-deploy-<timestamp>.log
#
# The body is one function so bash reads it whole before running: the reset may
# rewrite this file when it is run from inside the repo.
main() {
  set -uo pipefail
  # IGNET_DIR overrides the tree only for rehearsing on a scratch clone.
  local SERVER_DIR="${IGNET_DIR:-/data/var/www/html/ignet}" BRANCH=main API=http://127.0.0.1:9637
  local MODE="${1:-deploy}" TS LOG OLD NEW FAIL=0
  TS="$(date +%Y%m%d-%H%M%S)"; LOG="$HOME/ignet-deploy-$TS.log"
  exec > >(tee "$LOG") 2>&1
  echo "== ignet deploy mode=$MODE $TS host=$(hostname) user=$(id -un)"
  [ "$EUID" -ne 0 ] || { echo "RESULT: FAILED (run as juhur, not root/sudo)"; return 1; }
  case "$MODE" in deploy|--check) ;; *) echo "RESULT: FAILED (unknown option $MODE)"; return 1 ;; esac
  cd "$SERVER_DIR" || { echo "RESULT: FAILED (no $SERVER_DIR)"; return 1; }

  # Untracked files (notes, docs) survive a reset; modified tracked files would be lost.
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "RESULT: FAILED (server has modified tracked files; inspect before deploying):"
    git status --short --untracked-files=no; return 1
  fi

  OLD="$(git rev-parse HEAD)"
  timeout 60 git fetch -q origin "$BRANCH" || { echo "RESULT: FAILED (git fetch)"; return 1; }
  echo "== server HEAD $(git rev-parse --short HEAD) -> origin/$BRANCH $(git rev-parse --short "origin/$BRANCH")"
  if [ "$OLD" = "$(git rev-parse "origin/$BRANCH")" ]; then echo "RESULT: SUCCESS (already up to date)"; return 0; fi
  # A reset would silently drop commits that exist only on the server.
  if [ -n "$(git rev-list HEAD --not "origin/$BRANCH")" ]; then
    echo "RESULT: FAILED (server has commits not on origin/$BRANCH; push or drop them first):"
    git log --oneline "origin/$BRANCH..HEAD" | sed 's/^/  /'; return 1
  fi
  echo "== incoming commits:"; git log --oneline "HEAD..origin/$BRANCH" | sed 's/^/  /'
  echo "== changed areas:"; git diff --name-only HEAD "origin/$BRANCH" | cut -d/ -f1 | sort | uniq -c | sed 's/^/ /'
  if [ "$MODE" = --check ]; then echo "RESULT: CHECK ONLY (nothing changed)"; return 0; fi

  git reset -q --hard "origin/$BRANCH" || { echo "RESULT: FAILED (git reset)"; return 1; }
  NEW="$(git rev-parse --short HEAD)"; echo "== server now at $NEW"

  # `git diff --quiet` instead of `| grep -q`: under pipefail a long file list makes
  # grep's early exit SIGPIPE git and read as "no change".
  if ! git diff --quiet "$OLD" HEAD -- api/requirements.txt; then
    echo "== api/requirements.txt changed: installing into api/venv before the restart"
    timeout 900 api/venv/bin/pip install -q -r api/requirements.txt || { echo "RESULT: FAILED (pip install; API not restarted, old code still running)"; return 1; }
  fi
  if ! git diff --quiet "$OLD" HEAD -- api/; then
    echo "== api/ changed: restarting ignet-api (sudo password prompt)"
    # The old process keeps answering health checks if the restart never happened,
    # so a restart counts only when the service start time moves.
    local T0 T1 H=000 i
    T0=$(systemctl show ignet-api -p ActiveEnterTimestamp --value)
    if sudo systemctl restart ignet-api && T1=$(systemctl show ignet-api -p ActiveEnterTimestamp --value) && [ "$T1" != "$T0" ]; then
      for i in $(seq 1 15); do
        sleep 2; H=$(curl -s -m 5 -o /dev/null -w '%{http_code}' "$API/api/v1/health")
        [ "$H" = 200 ] && { echo "  restarted at $T1, healthy after $((i*2)) s"; break; }
      done
      [ "$H" = 200 ] || { echo "  CHECK FAILED: health HTTP $H"; journalctl -u ignet-api -n 15 --no-pager 2>/dev/null; FAIL=1; }
    else
      echo "  CHECK FAILED: ignet-api was not restarted (still started at $T0); the old API code is still running"
      echo "  fix: sudo systemctl restart ignet-api"
      FAIL=1
    fi
  else
    echo "== no api/ changes: no restart needed"
  fi

  # The public hostname is not reachable from the server itself, so resolve it to localhost.
  local WANT GOT
  WANT=$(grep -o 'assets/index-[^"]*\.js' dist-react/index.html | head -1)
  GOT=$(curl -sk -m 10 --resolve ignet.org:443:127.0.0.1 https://ignet.org/ignet/ | grep -o 'assets/index-[^"]*\.js' | head -1)
  echo "== live page bundle: $GOT (committed: $WANT)"
  [ -n "$WANT" ] && [ "$GOT" = "$WANT" ] || { echo "  CHECK FAILED: live page does not serve the committed bundle"; FAIL=1; }

  [ "$FAIL" = 0 ] && echo "RESULT: SUCCESS ($NEW)" || echo "RESULT: FAILED"
  echo "log: $LOG"
  return "$FAIL"
}
main "$@"; exit
