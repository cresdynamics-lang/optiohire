#!/bin/bash
# Run each server update step one by one (separate SSH each time). Run from your machine.
# Usage: SSH_PASS='Manage@1Optiohire' ./deploy/update-server-step-by-step.sh
# Resume from step 5: START_FROM_STEP=5 SSH_PASS='...' ./deploy/update-server-step-by-step.sh

set -e
DROPLET="root@165.22.128.141"
SSH_OPTS="-o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no -o ConnectTimeout=25"
START_FROM_STEP="${START_FROM_STEP:-1}"

ssh_cmd() {
  if [ -n "$SSH_PASS" ] && command -v sshpass &>/dev/null; then
    sshpass -p "$SSH_PASS" ssh $SSH_OPTS "$DROPLET" "$@"
  else
    ssh $SSH_OPTS "$DROPLET" "$@"
  fi
}

[ "$START_FROM_STEP" -le 1 ] && { echo "========== Step 1: git pull =========="; ssh_cmd "cd /var/www/optiohire && git pull origin main"; echo ""; }
[ "$START_FROM_STEP" -le 2 ] && { echo "========== Step 2: backend npm install =========="; ssh_cmd "cd /var/www/optiohire/backend && npm install"; echo ""; }
[ "$START_FROM_STEP" -le 3 ] && { echo "========== Step 3: backend npm run build =========="; ssh_cmd "cd /var/www/optiohire/backend && npm run build"; echo ""; }
[ "$START_FROM_STEP" -le 4 ] && { echo "========== Step 4: frontend npm install =========="; ssh_cmd "cd /var/www/optiohire/frontend && npm install --legacy-peer-deps"; echo ""; }
[ "$START_FROM_STEP" -le 5 ] && { echo "========== Step 5: frontend npm run build =========="; ssh_cmd "cd /var/www/optiohire/frontend && NODE_OPTIONS='--max-old-space-size=2048' npm run build"; echo ""; }
[ "$START_FROM_STEP" -le 6 ] && { echo "========== Step 6: pm2 restart =========="; ssh_cmd "pm2 restart optiohire-backend optiohire-frontend"; echo ""; }
[ "$START_FROM_STEP" -le 7 ] && { echo "========== Step 7: pm2 save =========="; ssh_cmd "pm2 save"; echo ""; }
[ "$START_FROM_STEP" -le 8 ] && { echo "========== Step 8: pm2 status =========="; ssh_cmd "pm2 status"; echo ""; }

echo "========== All steps done =========="
