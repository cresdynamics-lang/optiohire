#!/bin/bash
# Run this ON the droplet after SSH. Ensures Node 20, builds app, restarts PM2.
# Usage: cd /var/www/optiohire && bash deploy/make-app-live-on-server.sh

set -e
APP_DIR="${APP_DIR:-/var/www/optiohire}"
cd "$APP_DIR"

# Node version: use .nvmrc if present, else 20
NODE_VER="20"
[ -f .nvmrc ] && NODE_VER="$(cat .nvmrc | tr -d '[:space:]')" || true
[ -z "$NODE_VER" ] && NODE_VER="20"

echo "========== Ensure Node $NODE_VER =========="
export NVM_DIR="${NVM_DIR:-/root/.nvm}"
ensure_node() {
  if command -v node &>/dev/null; then
    major=$(node -v | cut -d. -f1 | tr -d 'v')
    [ "$major" -ge 20 ] 2>/dev/null && echo "Node $(node -v) OK" && return 0
  fi
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
    nvm install "$NODE_VER" 2>/dev/null || true
    nvm use "$NODE_VER"
    echo "Node $(node -v) via nvm"
    return 0
  fi
  echo "Installing nvm and Node $NODE_VER..."
  export NVM_DIR="/root/.nvm"
  curl -sSf -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install "$NODE_VER"
  nvm use "$NODE_VER"
  echo "Node $(node -v)"
}
ensure_node

echo "========== Git pull =========="
git pull origin main

echo "========== Backend install + build =========="
cd "$APP_DIR/backend"
npm install
npm run build

echo "========== Frontend install + build =========="
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps
# Use low-memory build on server to avoid Bus error (core dumped) on small droplets
# Fallback to build:server (1024 MB) only — do not use 2048 on server
npm run build:low-memory || npm run build:server

echo "========== PM2 restart =========="
# Ensure frontend runs with Node 20 (PM2 may use system node otherwise)
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use "$NODE_VER" 2>/dev/null || true
  WRAPPER="$APP_DIR/frontend/start-with-node20.sh"
  # Use explicit path so wrapper works regardless of $0
  cat > "$WRAPPER" << WRAP
#!/bin/bash
export NVM_DIR="\${NVM_DIR:-/root/.nvm}"
[ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
nvm use $NODE_VER 2>/dev/null || true
cd "$APP_DIR/frontend"
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
