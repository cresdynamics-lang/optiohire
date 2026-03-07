#!/bin/bash
# Run this ON the server first (before build). Adds only MISSING env vars; never overwrites.
# Usage: cd /var/www/optiohire && bash deploy/ensure-env-on-server.sh

set -e
APP_DIR="${1:-/var/www/optiohire}"
[ -d "$APP_DIR/backend" ] || { echo "Usage: bash deploy/ensure-env-on-server.sh [APP_DIR]"; exit 1; }

BACKEND_ENV="$APP_DIR/backend/.env"
FRONTEND_ENV="$APP_DIR/frontend/.env.local"

# Defaults (replace with your server IP/domain if different)
DEFAULT_JWT_SECRET="a6869b3fb2a7b56cb33c58d07cf69548ee1ccbe9f6ec2aa54ce13d1a1bafeedae2d88ee36ed7d92f0e29d573d68c2335fe187eb7cf3890be9b7d4bf216cfd568"
DEFAULT_DATABASE_URL="postgresql://optiohire_user:optiohire_pass_2024@localhost:5432/optiohire"
# Use droplet IP or domain - detect from hostname or use 165.227.56.148
SERVER_URL="${SERVER_URL:-http://165.227.56.148}"
BACKEND_URL="${BACKEND_URL:-$SERVER_URL:3001}"
FRONTEND_URL="${FRONTEND_URL:-$SERVER_URL:3000}"

add_if_missing() {
  local file="$1"
  local key="$2"
  local value="$3"
  mkdir -p "$(dirname "$file")"
  touch "$file"
  grep -q "^${key}=" "$file" 2>/dev/null || echo "${key}=${value}" >> "$file"
}

echo "========== Ensuring backend .env (missing keys only) =========="
add_if_missing "$BACKEND_ENV" "NODE_ENV" "production"
add_if_missing "$BACKEND_ENV" "PORT" "3001"
add_if_missing "$BACKEND_ENV" "JWT_SECRET" "$DEFAULT_JWT_SECRET"
add_if_missing "$BACKEND_ENV" "DATABASE_URL" "$DEFAULT_DATABASE_URL"
add_if_missing "$BACKEND_ENV" "DB_SSL" "false"
add_if_missing "$BACKEND_ENV" "NEXT_PUBLIC_BACKEND_URL" "$BACKEND_URL"
add_if_missing "$BACKEND_ENV" "NEXTAUTH_URL" "$FRONTEND_URL"
add_if_missing "$BACKEND_ENV" "NEXT_PUBLIC_APP_URL" "$SERVER_URL"
# Email: applications inbox (nelsonochieng was deleted)
add_if_missing "$BACKEND_ENV" "MAIL_FROM" "applicationsoptiohire@gmail.com"
add_if_missing "$BACKEND_ENV" "RESEND_FROM_EMAIL" "applicationsoptiohire@gmail.com"
add_if_missing "$BACKEND_ENV" "SMTP_USER" "applicationsoptiohire@gmail.com"
add_if_missing "$BACKEND_ENV" "MAIL_USER" "applicationsoptiohire@gmail.com"
add_if_missing "$BACKEND_ENV" "IMAP_USER" "applicationsoptiohire@gmail.com"
echo "  Backend: $BACKEND_ENV"

echo "========== Ensuring frontend .env.local (missing keys only) =========="
# JWT_SECRET must match backend for Google sign-in
JWT_VAL=$(grep -E '^JWT_SECRET=' "$BACKEND_ENV" 2>/dev/null | sed 's/^JWT_SECRET=//' | head -1)
[ -z "$JWT_VAL" ] && JWT_VAL="$DEFAULT_JWT_SECRET"
add_if_missing "$FRONTEND_ENV" "JWT_SECRET" "$JWT_VAL"
add_if_missing "$FRONTEND_ENV" "NODE_ENV" "production"
add_if_missing "$FRONTEND_ENV" "DATABASE_URL" "$DEFAULT_DATABASE_URL"
add_if_missing "$FRONTEND_ENV" "DB_SSL" "false"
add_if_missing "$FRONTEND_ENV" "NEXT_PUBLIC_BACKEND_URL" "$BACKEND_URL"
add_if_missing "$FRONTEND_ENV" "NEXTAUTH_URL" "$FRONTEND_URL"
add_if_missing "$FRONTEND_ENV" "NEXT_PUBLIC_APP_URL" "$SERVER_URL"
echo "  Frontend: $FRONTEND_ENV"

echo "========== Done. Existing values were NOT changed. =========="
