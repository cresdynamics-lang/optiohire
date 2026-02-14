#!/bin/bash
# Run this from your machine to update the DigitalOcean server after git push.
# Usage: ./deploy/update-server.sh
# With password (if sshpass installed): SSH_PASS='Manage@1Optiohire' ./deploy/update-server.sh

set -e
DROPLET="root@165.22.128.141"
SSH_OPTS="-o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no -o ConnectTimeout=20"

run_remote() {
  if [ -n "$SSH_PASS" ] && command -v sshpass &>/dev/null; then
    sshpass -p "$SSH_PASS" ssh $SSH_OPTS "$DROPLET" bash -s
  else
    ssh $SSH_OPTS "$DROPLET" bash -s
  fi
}

echo "Connecting to server and updating..."
run_remote << 'REMOTE'
set -e
cd /var/www/optiohire
echo "=== Pulling latest ==="
git pull origin main
echo "=== Backend install & build ==="
cd backend && npm install && npm run build && cd ..
echo "=== Frontend install & build ==="
cd frontend && npm install --legacy-peer-deps && NODE_OPTIONS='--max-old-space-size=2048' npm run build && cd ..
echo "=== Restarting PM2 ==="
pm2 restart optiohire-backend optiohire-frontend
pm2 save
echo "=== PM2 status ==="
pm2 status
echo "=== Done ==="
REMOTE

echo "Server update complete."
