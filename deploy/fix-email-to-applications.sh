#!/bin/bash
# Run ON the server. Replaces nelsonochieng (deleted) with applications email and sets env.
# Usage: cd /var/www/optiohire && bash deploy/fix-email-to-applications.sh

set -e
APP_DIR="${1:-/var/www/optiohire}"
BACKEND_ENV="$APP_DIR/backend/.env"
FRONTEND_ENV="$APP_DIR/frontend/.env.local"

APPLICATIONS_EMAIL="applicationsoptiohire@gmail.com"

echo "========== Replacing nelsonochieng with applications email =========="
for f in "$BACKEND_ENV" "$FRONTEND_ENV"; do
  if [ -f "$f" ]; then
    if grep -q -i "nelsonochieng" "$f" 2>/dev/null; then
      sed -i "s/nelsonochieng@/applicationsoptiohire@/gi" "$f"
      sed -i "s/nelsonochieng/applicationsoptiohire/gi" "$f"
      echo "  Updated: $f"
    else
      echo "  No nelsonochieng in $f"
    fi
  fi
done

echo "========== Ensuring email env vars use applications address =========="
add_or_replace() {
  local file="$1"
  local key="$2"
  local value="$3"
  [ ! -f "$file" ] && touch "$file"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# Backend: all mail/IMAP/SMTP/Resend from = applications
add_or_replace "$BACKEND_ENV" "MAIL_FROM" "$APPLICATIONS_EMAIL"
add_or_replace "$BACKEND_ENV" "RESEND_FROM_EMAIL" "$APPLICATIONS_EMAIL"
add_or_replace "$BACKEND_ENV" "SMTP_USER" "$APPLICATIONS_EMAIL"
add_or_replace "$BACKEND_ENV" "MAIL_USER" "$APPLICATIONS_EMAIL"
add_or_replace "$BACKEND_ENV" "IMAP_USER" "$APPLICATIONS_EMAIL"

echo "  Backend email vars set to $APPLICATIONS_EMAIL"
echo "========== Done. Restart backend to apply: pm2 restart optiohire-backend =========="
