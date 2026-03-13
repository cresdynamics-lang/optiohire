#!/bin/bash

# Check CV Extraction, Ranking, and Email Status
# This script checks if CVs were extracted, scored, and emails sent

BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
LOG_FILE="/Users/airm1/.cursor/projects/Users-airm1-Projects-optiohire/terminals/921963.txt"

echo "🔍 Checking CV Processing Status..."
echo "===================================="
echo ""

# Check if we need admin token
echo "📋 To check applications and emails, you need to:"
echo "   1. Login to admin: http://localhost:3000/admin/login"
echo "   2. Go to: http://localhost:3000/admin/applications"
echo "   3. Check each application for:"
echo "      - CV attached (resume_url)"
echo "      - AI score (0-100)"
echo "      - AI status (SHORTLIST/FLAG/REJECT)"
echo "      - Reasoning text"
echo ""

# Check backend logs for CV processing
echo "📧 Checking Backend Logs for CV Processing..."
echo ""

# Look for CV extraction
CV_EXTRACTED=$(tail -1000 "$LOG_FILE" 2>/dev/null | grep -c "CV extracted" || echo "0")
echo "   CVs Extracted: $CV_EXTRACTED"

# Look for scoring
SCORING=$(tail -1000 "$LOG_FILE" 2>/dev/null | grep -c "Scoring successful" || echo "0")
echo "   CVs Scored: $SCORING"

# Look for shortlist emails
SHORTLIST=$(tail -1000 "$LOG_FILE" 2>/dev/null | grep -c "Shortlist email sent" || echo "0")
echo "   Shortlist Emails Sent: $SHORTLIST"

# Look for rejection emails
REJECTION=$(tail -1000 "$LOG_FILE" 2>/dev/null | grep -c "Rejection email sent" || echo "0")
echo "   Rejection Emails Sent: $REJECTION"

echo ""
echo "📋 Recent CV Processing Activity:"
echo ""

# Show recent CV processing
tail -1000 "$LOG_FILE" 2>/dev/null | grep -E "CV extracted|Scoring successful|Shortlist email|Rejection email|Successfully processed" | tail -10 || echo "   No recent CV processing found in logs"

echo ""
echo "📧 Email Watcher Status:"
curl -s "$BACKEND_URL/health/email-reader" | jq -r '.emailReader | "   Enabled: \(.enabled)\n   Running: \(.running)\n   Last Processed: \(.lastProcessedAt // "never")\n   Last Error: \(.lastError // "none")"'

echo ""
echo "💡 To view detailed information:"
echo "   1. Admin Dashboard → Applications: http://localhost:3000/admin/applications"
echo "   2. Admin Dashboard → Emails: http://localhost:3000/admin/emails"
echo "   3. Backend Logs: tail -f $LOG_FILE"
