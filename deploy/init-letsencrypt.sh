#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# init-letsencrypt.sh
# Run ONCE on the Oracle VM BEFORE starting docker-compose.prod.yml
# Prerequisite:
#   - Port 80 open in Oracle Cloud Security List + OS firewall
#   - DuckDNS CNAME / A record pointing to this VM's public IP
#   - .env.prod exists with APP_DOMAIN and CERTBOT_EMAIL set
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env.prod"

# Load .env.prod
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "ERROR: .env.prod not found at $ENV_FILE"
  echo "  Copy .env.prod.example to .env.prod and fill in the values."
  exit 1
fi

# Validate required vars
if [ -z "${APP_DOMAIN:-}" ]; then
  echo "ERROR: APP_DOMAIN is not set in .env.prod"
  exit 1
fi
if [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "ERROR: CERTBOT_EMAIL is not set in .env.prod"
  exit 1
fi

echo "==> Installing certbot..."
sudo apt-get update -qq
sudo apt-get install -y certbot

echo ""
echo "==> Requesting Let's Encrypt certificate"
echo "    Domain : $APP_DOMAIN"
echo "    Email  : $CERTBOT_EMAIL"
echo ""
echo "    IMPORTANT: Port 80 must be free (no service running on it yet)."
echo ""

# Standalone mode: certbot temporarily binds to port 80 for the challenge
sudo certbot certonly \
  --standalone \
  --email "$CERTBOT_EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$APP_DOMAIN"

# Create webroot directory used by Nginx for future webroot renewals
sudo mkdir -p /var/www/certbot

echo ""
echo "✓ Certificate obtained successfully!"
echo "  Cert : /etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem"
echo "  Key  : /etc/letsencrypt/live/$APP_DOMAIN/privkey.pem"
echo ""
echo "==> Next steps:"
echo "  1. Start the stack:"
echo "       docker compose -f docker-compose.prod.yml --env-file .env.prod up -d"
echo ""
echo "  2. Set up auto-renewal cron (run as root):"
echo "       crontab -e"
echo "       Add: 0 3 * * * $SCRIPT_DIR/renew-cert.sh >> /var/log/certbot-renew.log 2>&1"
