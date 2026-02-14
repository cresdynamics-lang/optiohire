#!/bin/bash
# Run the app update in background so SSH disconnect does not kill it.
# Usage on droplet: cd /var/www/optiohire && bash deploy/run-update-in-background.sh

set -e
APP_DIR="${APP_DIR:-/var/www/optiohire}"
LOG="$APP_DIR/deploy-update.log"
cd "$APP_DIR"

echo "Starting update in background. Log: $LOG"
echo "Watch live: tail -f $LOG"
echo "Check when done: tail $LOG"
nohup bash deploy/make-app-live-on-server.sh > "$LOG" 2>&1 &
echo "PID: $!"
echo "You can disconnect; update will continue. Reconnect and run: tail -f $LOG"
