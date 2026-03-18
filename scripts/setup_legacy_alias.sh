#!/usr/bin/env bash
# Setup Apache Alias for /ignet_legacy/ and restart services.
# Run as: sudo bash scripts/setup_legacy_alias.sh
set -euo pipefail

echo "=== Step 1: Find Apache config ==="
CONF=$(grep -rl "ignet" /etc/httpd/conf.d/*.conf 2>/dev/null | head -1)
if [ -z "$CONF" ]; then
    echo "ERROR: No ignet config found in /etc/httpd/conf.d/"
    echo "Create one manually or adjust this script."
    exit 1
fi
echo "Found: $CONF"

echo ""
echo "=== Step 2: Add /ignet_legacy/ Alias ==="
if grep -q "ignet_legacy" "$CONF" 2>/dev/null; then
    echo "SKIP: /ignet_legacy/ Alias already exists in $CONF"
else
    cat >> "$CONF" << 'APACHE_EOF'

# Legacy PHP interface at /ignet_legacy/
# SPA .htaccess skips routing for this path via RewriteCond
Alias /ignet_legacy /data/var/www/html/ignet
APACHE_EOF
    echo "Added Alias /ignet_legacy to $CONF"
fi

echo ""
echo "=== Step 3: Test Apache config ==="
apachectl configtest

echo ""
echo "=== Step 4: Restart Apache ==="
systemctl restart httpd
echo "Apache restarted."

echo ""
echo "=== Step 5: Restart ignet-api ==="
systemctl restart ignet-api
echo "ignet-api restarted."

echo ""
echo "=== Step 6: Verify ==="
sleep 1
curl -s http://localhost:9637/api/v1/health && echo ""
echo ""
echo "Done. Test these URLs:"
echo "  https://ignet.org/ignet/          (React SPA)"
echo "  https://ignet.org/ignet_legacy/   (PHP legacy)"
echo "  https://ignet.org/api/v1/health   (REST API)"
