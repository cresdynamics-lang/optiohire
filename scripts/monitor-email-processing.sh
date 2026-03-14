#!/bin/bash

# Monitor email processing and email sending
# This script watches backend logs for email processing and sending

BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
LOG_FILE="${LOG_FILE:-/dev/stdout}"

echo "🔍 Monitoring Email Processing and Email Sending..."
echo "=================================================="
echo ""
echo "Email Watcher Status:"
curl -s "$BACKEND_URL/health/email-reader" 2>/dev/null | jq -r '.emailReader | "  ✅ Enabled: \(.enabled)\n  ✅ Running: \(.running)\n  📅 Last Check: \(.lastProcessedAt)\n  ⚠️  Last Error: \(.lastError // "none")"'
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Monitor for key events
tail -f "$LOG_FILE" 2>/dev/null | grep --line-buffered -E "\[EMAIL WATCHER\]|EMAIL WATCHER|Processing email|MATCH FOUND|CV extracted|Scoring|Sending.*email|email sent|Failed to send" -i | while read line; do
  timestamp=$(date '+%H:%M:%S')
  
  # Color code different events
  if echo "$line" | grep -qi "MATCH FOUND\|Successfully processed"; then
    echo -e "\033[0;32m[$timestamp] ✅ $line\033[0m"
  elif echo "$line" | grep -qi "Sending.*email\|email sent successfully"; then
    echo -e "\033[0;36m[$timestamp] 📧 $line\033[0m"
  elif echo "$line" | grep -qi "Failed to send\|Error\|❌"; then
    echo -e "\033[0;31m[$timestamp] ❌ $line\033[0m"
  elif echo "$line" | grep -qi "Processing email\|Found.*unread"; then
    echo -e "\033[0;33m[$timestamp] 📧 $line\033[0m"
  else
    echo "[$timestamp] $line"
  fi
done
