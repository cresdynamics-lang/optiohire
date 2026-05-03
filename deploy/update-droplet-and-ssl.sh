#!/bin/bash
# Run on the droplet as root AFTER: DNS A records for @, www, api → this server IP.
# From your machine: ssh root@YOUR_DROPLET_IP
# On server:
#   export CERTBOT_EMAIL='you@yourdomain.com'
#   cd /var/www/optiohire && git pull origin main && bash deploy/update-droplet-and-ssl.sh
#
# Does: git pull, build + PM2 (make-app-live), reload nginx, optional Certbot for HTTPS.

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/optiohire}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

echo "========== OptioHire: update + SSL =========="
if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "ERROR: $APP_DIR is not a git clone. Clone the repo there first, then re-run."
  exit 1
fi

cd "$APP_DIR"
git pull origin main

echo "========== Build + PM2 =========="
bash deploy/make-app-live-on-server.sh

echo "========== NGINX =========="
if command -v nginx &>/dev/null; then
  nginx -t
  systemctl reload nginx || systemctl restart nginx
else
  echo "WARN: nginx not installed. Install and configure sites (see deploy/DIGITALOCEAN_DEPLOY.md)."
fi

echo "========== TLS (Certbot) =========="
if ! command -v certbot &>/dev/null; then
  apt-get update -qq
  apt-get install -y certbot python3-certbot-nginx
fi

if [[ -z "$CERTBOT_EMAIL" ]]; then
  echo "CERTBOT_EMAIL is not set. Skipping certbot."
  echo "When DNS points to this host, run:"
  echo "  export CERTBOT_EMAIL='you@yourdomain.com'"
  echo "  sudo certbot --nginx -d optiohire.com -d www.optiohire.com -d api.optiohire.com \\"
  echo "    --non-interactive --agree-tos -m \"\$CERTBOT_EMAIL\" --redirect"
  exit 0
fi

# Obtain/renew certs and patch nginx server blocks
certbot --nginx \
  -d optiohire.com -d www.optiohire.com -d api.optiohire.com \
  --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect \
  || {
    echo "Certbot failed. Typical causes: DNS not propagated, port 80 blocked, or nginx config missing server_name."
    exit 1
  }

certbot renew --dry-run

pm2 save 2>/dev/null || true
echo "========== Done. Test: curl -I https://optiohire.com  and  curl -sS https://api.optiohire.com/health =========="
