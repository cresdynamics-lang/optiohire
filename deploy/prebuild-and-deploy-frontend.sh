#!/bin/bash
# Build frontend on THIS machine (has enough RAM), then deploy .next to the server.
# Use when the droplet hits "Bus error" during npm run build.
#
# Usage:
#   SERVER=root@165.22.128.141 ./deploy/prebuild-and-deploy-frontend.sh
#   Or: ssh password will be prompted for rsync/scp
#
# Prereqs: Build succeeds locally. Server has /var/www/optiohire with git repo.

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="${SERVER:-root@165.22.128.141}"

echo "========== Build frontend locally =========="
cd "$REPO_ROOT/frontend"
npm run build

echo "========== Deploy .next to server =========="
rsync -avz --delete \
  "$REPO_ROOT/frontend/.next/" \
  "$SERVER:/var/www/optiohire/frontend/.next/"

echo "========== Restart frontend on server =========="
ssh "$SERVER" "cd /var/www/optiohire && pm2 restart optiohire-frontend && pm2 save && pm2 status"

echo "========== Done. Frontend is live. =========="
