#!/bin/bash

# Monitor for new applications being created
# This script watches the database for new applications

BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}

echo "🔍 Monitoring for new applications..."
echo "Email Watcher Status:"
curl -s "$BACKEND_URL/health/email-reader" | jq -r '.emailReader | "  ✅ Enabled: \(.enabled)\n  ✅ Running: \(.running)\n  📅 Last Check: \(.lastProcessedAt)"'
echo ""
echo "Press Ctrl+C to stop"
echo ""

LAST_COUNT=0
while true; do
    sleep 5
    
    # Check applications count
    COUNT=$(cd /Users/airm1/Projects/optiohire/backend && node -e "
    const { query, pool } = require('./src/db/index.js');
    (async () => {
      try {
        const { rows } = await query('SELECT COUNT(*) as count FROM applications WHERE created_at > NOW() - INTERVAL \"5 minutes\"');
        console.log(rows[0].count);
        await pool.end();
      } catch(e) {
        console.log('0');
        await pool.end();
      }
    })()
    " 2>/dev/null || echo "0")
    
    if [ "$COUNT" != "$LAST_COUNT" ] && [ "$COUNT" != "0" ]; then
        echo ""
        echo "✅ NEW APPLICATION DETECTED! Total in last 5 minutes: $COUNT"
        echo ""
        
        # Show recent applications
        cd /Users/airm1/Projects/optiohire/backend && npx tsx ../scripts/check-applications.ts 2>/dev/null | tail -20
        
        LAST_COUNT=$COUNT
    fi
    
    # Show email watcher status every 30 seconds
    if [ $(($(date +%S) % 30)) -eq 0 ]; then
        LAST_PROCESSED=$(curl -s "$BACKEND_URL/health/email-reader" 2>/dev/null | jq -r '.emailReader.lastProcessedAt // "never"')
        echo "[$(date '+%H:%M:%S')] Email watcher active. Last processed: $LAST_PROCESSED"
    fi
done
