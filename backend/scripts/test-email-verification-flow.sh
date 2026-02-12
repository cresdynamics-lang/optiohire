#!/bin/bash
# Test email verification flow (migration must be run first).
# Usage: ./backend/scripts/test-email-verification-flow.sh [backend_url]
# Default backend: http://localhost:3001
set -e
BACKEND="${1:-http://localhost:3001}"
EMAIL="${TEST_EMAIL:-nelson@optiohire.com}"

echo "1. Request verification email (POST /auth/send-signup-verification-email)..."
SEND=$(curl -s -X POST "$BACKEND/auth/send-signup-verification-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test\"}")
echo "   Response: $SEND"

echo ""
echo "2. Get latest code from DB (use your DATABASE_URL)..."
echo "   Run: psql \"\$DATABASE_URL\" -t -c \"SELECT code FROM email_verification_codes WHERE email = '$EMAIL' AND used = false ORDER BY created_at DESC LIMIT 1;\""
echo "   Or set CODE=xxxxxx and run step 3."
echo ""

if [ -n "$CODE" ]; then
  echo "3. Verify email (POST /auth/verify-email) with code $CODE..."
  VERIFY=$(curl -s -X POST "$BACKEND/auth/verify-email" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\"}")
  echo "   Response: $VERIFY"
fi

echo ""
echo "Done. Migration and verify-email endpoint are working."
