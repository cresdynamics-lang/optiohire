#!/bin/bash
# Build frontend on THIS machine (has enough RAM), then deploy .next to the server.
# Use when the droplet hits "Bus error" during npm run build.
#
# Usage:
#   SERVER=root@165.22.128.141 ./deploy/prebuild-and-deploy-frontend.sh
#   Password will be prompted for rsync/ssh (or use sshpass with SSH_PASS).
#
# For password auth (avoids "Too many authentication failures" with many SSH keys):
#   SSHPASS='yourpass' ./deploy/prebuild-and-deploy-frontend.sh
#   (SSH_PASS also works as alias for SSHPASS)

set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER="${SERVER:-root@165.227.56.148}"
[ -n "$SSH_PASS" ] && [ -z "$SSHPASS" ] && export SSHPASS="$SSH_PASS"
# Avoid "Too many authentication failures" when using password auth with many keys
SSH_OPTS="-o IdentitiesOnly=yes -o PubkeyAuthentication=no -o PreferredAuthentications=password -o StrictHostKeyChecking=no"
[ -n "$SSHPASS" ] && command -v sshpass &>/dev/null && SSH_CMD="sshpass -e ssh" || SSH_CMD="ssh"

echo "========== Build frontend locally =========="
cd "$REPO_ROOT/frontend"
npm run build

echo "========== Deploy .next to server =========="
rsync -avz --delete -e "$SSH_CMD $SSH_OPTS" \
  "$REPO_ROOT/frontend/.next/" \
  "$SERVER:/var/www/optiohire/frontend/.next/"

echo "========== Restart frontend on server =========="
$SSH_CMD $SSH_OPTS "$SERVER" 'cd /var/www/optiohire && (
  pm2 restart optiohire-frontend 2>/dev/null || {
    echo "optiohire-frontend not in PM2, starting..."
    WRAP="/var/www/optiohire/frontend/start-with-node20.sh"
    if [ -f "$WRAP" ]; then
      pm2 start "$WRAP" --name optiohire-frontend --cwd /var/www/optiohire/frontend
    else
      pm2 start npm --name optiohire-frontend --cwd /var/www/optiohire/frontend -- start
    fi
  }
) && pm2 save && pm2 status'

echo "========== Done. Frontend is live. =========="
