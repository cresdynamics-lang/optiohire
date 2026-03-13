#!/bin/bash

# Monitor Email Watcher and CV Screening
# This script continuously monitors the email watcher and shows when CVs are processed

BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
LOG_FILE="/Users/airm1/.cursor/projects/Users-airm1-Projects-optiohire/terminals/921963.txt"

echo "🔍 Monitoring Email Watcher and CV Screening..."
echo "Backend: $BACKEND_URL"
echo "Press Ctrl+C to stop"
echo ""

# Function to check email watcher status
check_status() {
    local status=$(curl -s "$BACKEND_URL/health/email-reader" 2>/dev/null | jq -r '.emailReader.running // false')
    echo "$status"
}

# Function to get last processed time
get_last_processed() {
    curl -s "$BACKEND_URL/health/email-reader" 2>/dev/null | jq -r '.emailReader.lastProcessedAt // "never"'
}

# Function to check for new logs
check_logs() {
    tail -20 "$LOG_FILE" 2>/dev/null | grep -E "Processing email|MATCH FOUND|CV extracted|Scoring successful|Successfully processed" | tail -5
}

# Initial status
echo "📧 Email Watcher Status:"
curl -s "$BACKEND_URL/health/email-reader" | jq '.emailReader | {enabled, running, lastProcessedAt, lastError}'
echo ""

# Monitor loop
LAST_PROCESSED=$(get_last_processed)
echo "⏳ Waiting for emails... (Last processed: $LAST_PROCESSED)"
echo ""

while true; do
    sleep 5
    
    CURRENT_PROCESSED=$(get_last_processed)
    
    # Check if new email was processed
    if [ "$CURRENT_PROCESSED" != "$LAST_PROCESSED" ] && [ "$CURRENT_PROCESSED" != "never" ]; then
        echo ""
        echo "✅ NEW EMAIL PROCESSED at $CURRENT_PROCESSED"
        echo "📋 Recent logs:"
        check_logs
        echo ""
        LAST_PROCESSED=$CURRENT_PROCESSED
    fi
    
    # Check for errors
    ERROR=$(curl -s "$BACKEND_URL/health/email-reader" 2>/dev/null | jq -r '.emailReader.lastError // ""')
    if [ -n "$ERROR" ] && [ "$ERROR" != "null" ]; then
        echo "⚠️  Error detected: $ERROR"
    fi
    
    # Show status every 30 seconds
    if [ $(($(date +%S) % 30)) -eq 0 ]; then
        RUNNING=$(check_status)
        if [ "$RUNNING" = "true" ]; then
            echo -n "."
        else
            echo ""
            echo "❌ Email watcher stopped!"
            break
        fi
    fi
done
