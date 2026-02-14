#!/bin/bash
# Run this ON the droplet after SSH. Ensures Node 20, builds app, restarts PM2.
# Usage: cd /var/www/optiohire && bash deploy/make-app-live-on-server.sh

set -e
APP_DIR="${APP_DIR:-/var/www/optiohire}"
cd "$APP_DIR"

echo "========== Ensure Node 20 =========="
ensure_node20() {
  if command -v node &>/dev/null && [ "$(node -v | cut -d. -f1 | tr -d 'v')" -ge 20 ]; then
    echo "Node $(node -v) OK"
    return 0
  fi
  export NVM_DIR="${NVM_DIR:-/root/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    echo "Node $(node -v) via nvm"
    return 0
  fi
  echo "Installing nvm and Node 20..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="/root/.nvm"
  . "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
  echo "Node $(node -v)"
}
ensure_node20

echo "========== Git pull =========="
git pull origin main

echo "========== Backend install + build =========="
cd "$APP_DIR/backend"
npm install
npm run build

echo "========== Frontend install + build =========="
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps
NODE_OPTIONS='--max-old-space-size=2048' npm run build

echo "========== PM2 restart =========="
# Ensure frontend runs with Node 20 (PM2 may use system node otherwise)
NVM_DIR="${NVM_DIR:-/root/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use 20 2>/dev/null || true
  WRAPPER="$APP_DIR/frontend/start-with-node20.sh"
  cat > "$WRAPPER" << 'WRAP'
#!/bin/bash
export NVM_DIR="${NVM_DIR:-/root/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 2>/dev/null || true
cd "$(dirname "$0")"
exec npm start
WRAP
  chmod +x "$WRAPPER"
  pm2 delete optiohire-frontend 2>/dev/null || true
  pm2 start "$WRAPPER" --name optiohire-frontend --cwd "$APP_DIR/frontend"
  pm2 restart optiohire-backend
else
  pm2 restart optiohire-backend optiohire-frontend
fi
pm2 save

echo "========== PM2 status =========="
pm2 status

echo "========== App should be live =========="
