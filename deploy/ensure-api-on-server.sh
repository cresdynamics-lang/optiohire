#!/bin/bash
# Run ON the server. Ensures the API (api.optiohire.com → port 3001) is configured and running.
# Use when the API was missing or needs to be added/updated.

set -e
APP_DIR="${APP_DIR:-/var/www/optiohire}"
NGINX_SITE="/etc/nginx/sites-available/optiohire"

echo "========== 1. Ensure backend is built and running =========="
cd "$APP_DIR"
[ -d backend ] || { echo "Error: $APP_DIR/backend not found"; exit 1; }
cd backend
npm install --no-audit --no-fund 2>/dev/null || true
npm run build
cd ..
pm2 restart optiohire-backend 2>/dev/null || pm2 start "$APP_DIR/backend/dist/server.js" --name optiohire-backend --cwd "$APP_DIR/backend"
pm2 save

echo "========== 2. Ensure NGINX serves api.optiohire.com → 3001 =========="
if [ ! -f "$NGINX_SITE" ]; then
  echo "Creating $NGINX_SITE with frontend + API server blocks..."
  mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
  cat > "$NGINX_SITE" << 'NGINX'
# Frontend - optiohire.com & www.optiohire.com
server {
    listen 80;
    listen [::]:80;
    server_name optiohire.com www.optiohire.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - api.optiohire.com
server {
    listen 80;
    listen [::]:80;
    server_name api.optiohire.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
  ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
elif ! grep -q 'server_name api.optiohire.com' "$NGINX_SITE"; then
  echo "Adding API server block to $NGINX_SITE..."
  # Append API block before the last closing (or use a marker)
  cat >> "$NGINX_SITE" << 'NGINX'

# Backend API - api.optiohire.com
server {
    listen 80;
    listen [::]:80;
    server_name api.optiohire.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
fi
nginx -t && systemctl reload nginx

echo "========== 3. Quick health check =========="
curl -s -o /dev/null -w "Backend (localhost:3001): %{http_code}\n" http://127.0.0.1:3001/health || true
pm2 status | head -5

echo "========== Done. API should be at https://api.optiohire.com (after SSL) or http://api.optiohire.com =========="
