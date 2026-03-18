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

# 2. Reload Apache
systemctl reload httpd
echo "[DONE] Apache reloaded"

# 3. Register ignet-api as a systemd service (in case it was killed and not restarted)
systemctl restart ignet-api
echo "[DONE] ignet-api restarted"

# 4. Verify all services are running
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
