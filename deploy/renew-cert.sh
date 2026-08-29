#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# renew-cert.sh
# Renews the Let's Encrypt certificate using Nginx webroot.
# Nginx must be running (serves /.well-known/acme-challenge/).
#
# Add to root crontab (runs at 03:00 every day):
#   0 3 * * * /path/to/deploy/renew-cert.sh >> /var/log/certbot-renew.log 2>&1
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running certbot renewal check..."

# Renew using webroot — Nginx serves the challenge without any downtime.
# --deploy-hook only runs when cert is actually renewed.
certbot renew \
  --webroot -w /var/www/certbot \
  --deploy-hook "docker exec golearn-nginx-prod nginx -s reload" \
  --quiet

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Renewal check complete."
