#!/bin/bash

# Test Email Watcher and CV Screening
# This script checks if the email watcher is running and processing CVs

echo "🔍 Checking Email Watcher Status..."
echo ""

# Check if backend is running
BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
echo "Backend URL: $BACKEND_URL"
echo ""

# Check email reader status
echo "📧 Email Reader Status:"
curl -s "$BACKEND_URL/health/email-reader" | jq '.' || echo "❌ Backend not running or endpoint unavailable"
echo ""

# Check recent applications (if any CVs were processed)
echo "📋 Recent Applications (last 10):"
curl -s "$BACKEND_URL/api/admin/applications?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null | \
  jq '.applications[] | {id: .application_id, candidate: .candidate_name, email: .email, job: .job_title, score: .ai_score, status: .ai_status, created: .created_at}' || \
  echo "⚠️  Need admin token: export ADMIN_TOKEN=<your-admin-token>"
echo ""

# Check email logs (if emails were sent)
echo "📧 Recent Email Logs (last 10):"
curl -s "$BACKEND_URL/api/admin/emails?limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null | \
  jq '.emails[] | {id: .email_id, to: .recipient_email, subject: .subject, status: .status, type: .email_type, sent: .sent_at}' || \
  echo "⚠️  Need admin token: export ADMIN_TOKEN=<your-admin-token>"
echo ""

echo "✅ Test complete!"
echo ""
echo "To test CV screening:"
echo "1. Ensure email watcher is running (check status above)"
echo "2. Send an email to the IMAP inbox with:"
echo "   - Subject: 'Job Title at Company Name' (matching an active job)"
echo "   - Attachment: CV (PDF or DOCX)"
echo "3. Check logs: pm2 logs optiohire-backend"
echo "4. Check applications: Visit /admin/applications"
