#!/bin/bash

# Watch for emails matching Sales position at Cres Dynamics
# This script monitors backend logs for email processing

LOG_FILE="/Users/airm1/.cursor/projects/Users-airm1-Projects-optiohire/terminals/921963.txt"
BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}

echo "📧 Monitoring Emails for Sales Position at Cres Dynamics"
echo "========================================================="
echo ""
echo "Job Details:"
echo "  Position: Sales"
echo "  Company: Cres Dynamics"
echo "  Status: ACTIVE"
echo ""
echo "Email Watcher Status:"
curl -s "$BACKEND_URL/health/email-reader" | jq -r '.emailReader | "  ✅ Enabled: \(.enabled)\n  ✅ Running: \(.running)\n  📅 Last Check: \(.lastProcessedAt)"'
echo ""

echo "🔍 Watching for emails matching 'Sales' or 'Cres Dynamics'..."
echo "Press Ctrl+C to stop"
echo ""

# Monitor logs in real-time
tail -f "$LOG_FILE" 2>/dev/null | grep --line-buffered -E "Sales|Cres Dynamics|Processing email|MATCH|CV extracted|Scoring|email sent" -i | while read line; do
  timestamp=$(date '+%H:%M:%S')
  echo "[$timestamp] $line"
done
