#!/bin/bash
# Ignet sudo setup script
# Run as: sudo bash scripts/sudo_setup.sh

set -e

echo "=== Ignet sudo setup ==="

# 1. Add ProxyPass to Apache config (if not already present)
if grep -q "ProxyPass /api/v1/" /etc/httpd/conf.d/ignet.conf; then
  echo "[SKIP] ProxyPass already in ignet.conf"
else
  sed -i '/Header always set Strict-Transport-Security/i\    # REST API proxy\n    ProxyPass \/api\/v1\/ http:\/\/localhost:9637\/api\/v1\/\n    ProxyPassReverse \/api\/v1\/ http:\/\/localhost:9637\/api\/v1\/\n' \
    /etc/httpd/conf.d/ignet.conf
  echo "[DONE] ProxyPass added to ignet.conf"
fi

# 2. Add missing database index for ino_host25.sentence_id (speeds up /pairs JOIN)
echo ""
echo "=== Database index ==="
MYSQL_CMD="mysql -u root ignet"
if $MYSQL_CMD -e "SHOW INDEX FROM ino_host25 WHERE Column_name = 'sentence_id'" 2>/dev/null | grep -q sentence_id; then
  echo "[SKIP] idx_ino_sentence_id already exists"
else
  echo "Creating index idx_ino_sentence_id on ino_host25(sentence_id) — this may take a few minutes on 7.3M rows..."
  $MYSQL_CMD -e "CREATE INDEX idx_ino_sentence_id ON ino_host25(sentence_id)" 2>&1
  echo "[DONE] idx_ino_sentence_id created"
fi

# 3. Add username column to users table (if not exists)
echo ""
echo "=== Users table username column ==="
if $MYSQL_CMD -e "SHOW COLUMNS FROM users LIKE 'username'" 2>/dev/null | grep -q username; then
  echo "[SKIP] username column already exists"
else
  $MYSQL_CMD -e "ALTER TABLE users ADD COLUMN username VARCHAR(100) DEFAULT NULL AFTER id" 2>&1
  echo "[DONE] username column added to users table"
fi

# 4. Reload Apache
systemctl reload httpd
echo "[DONE] Apache reloaded"

# 5. Restart ignet-api systemd service
systemctl restart ignet-api
echo "[DONE] ignet-api restarted"

# 6. Verify all services are running
echo ""
echo "=== Service status ==="
systemctl is-active ignet-biobert ignet-biosummarai ignet-api redis mariadb httpd | \
  paste - - - - - - | \
  awk 'BEGIN{split("ignet-biobert ignet-biosummarai ignet-api redis mariadb httpd",s)} \
       {for(i=1;i<=NF;i++) printf "  %-22s %s\n", s[i], $i}'

echo ""
echo "=== Verification ==="
sleep 2
curl -s http://localhost:9637/api/v1/health && echo " <- API health OK" || echo " <- API health FAILED"
curl -sk https://localhost/api/v1/health && echo " <- HTTPS proxy OK" || echo " <- HTTPS proxy FAILED"

echo ""
echo "=== Done ==="
