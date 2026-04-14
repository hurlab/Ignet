#!/usr/bin/env bash
# Generate persistent JWT_SECRET and FERNET_KEY for the Ignet API.
#
# Usage:
#   bash scripts/generate_secrets.sh                    # print to stdout
#   bash scripts/generate_secrets.sh >> biosummarAI/.env  # append to .env
#
# These keys MUST remain stable across restarts:
#   - JWT_SECRET: signs auth tokens. Rotating logs out all users.
#   - FERNET_KEY: encrypts BYOK API keys at rest. Rotating makes
#     stored keys permanently unreadable.
#
# Run ONCE per deployment. Back up your .env after running.

set -euo pipefail

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required" >&2
  exit 1
fi

JWT_SECRET="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
FERNET_KEY="$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"

cat <<EOF
JWT_SECRET=${JWT_SECRET}
FERNET_KEY=${FERNET_KEY}
EOF
