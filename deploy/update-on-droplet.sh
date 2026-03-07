#!/bin/bash
# Run this ON the DigitalOcean droplet (console or after SSH).
# Updates the app: merges .env from previous + new defaults, git pull, build, PM2 restart.
# Usage: cd /opt/optiohire && bash deploy/update-on-droplet.sh
#    or: cd /var/www/optiohire && bash deploy/update-on-droplet.sh

set -e

# App directory: use current dir if we're inside the repo, else common locations
if [ -d "backend" ] && [ -d "frontend" ]; then
  APP_DIR="$(pwd)"
else
  APP_DIR="${APP_DIR:-/opt/optiohire}"
  [ ! -d "$APP_DIR/backend" ] && APP_DIR="/var/www/optiohire"
  cd "$APP_DIR" || { echo "App dir not found. Set APP_DIR= or run from repo root."; exit 1; }
fi

echo "========== App dir: $APP_DIR =========="

# Merge env: existing values win; template adds missing keys only.
# Usage: merge_env <current_file> <template_heredoc_or_file>
merge_env() {
  local current_file="$1"
  local template_file="$2"
  [ ! -f "$template_file" ] && { echo "Template not found: $template_file"; return 1; }
  mkdir -p "$(dirname "$current_file")"
  declare -A cur
  while IFS= read -r line; do
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      cur["${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
    fi
  done < "$current_file" 2>/dev/null || true
  local out=""
  while IFS= read -r line; do
    if [[ "$line" =~ ^# ]]; then
      out+="$line"$'\n'
      continue
    fi
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      k="${BASH_REMATCH[1]}"
      v="${BASH_REMATCH[2]}"
      if [[ -n "${cur[$k]+x}" ]]; then
        out+="$k=${cur[$k]}"$'\n'
      else
        out+="$line"$'\n'
      fi
      unset 'cur[$k]'
    else
      out+="$line"$'\n'
    fi
  done < "$template_file"
  for k in "${!cur[@]}"; do out+="$k=${cur[$k]}"$'\n'; done
  printf '%s' "$out" > "$current_file.new" && mv "$current_file.new" "$current_file"
}

# Ensure we have merge templates (create from defaults if missing)
BACKEND_ENV="$APP_DIR/backend/.env"
FRONTEND_ENV="$APP_DIR/frontend/.env.local"
DEPLOY_DIR="$APP_DIR/deploy"
BACKUP_SUFFIX=".bak.$(date +%Y%m%d%H%M%S)"

echo "========== Back up existing .env =========="
[ -f "$BACKEND_ENV" ]  && cp "$BACKEND_ENV"  "$BACKEND_ENV$BACKUP_SUFFIX"  && echo "  Backed up backend/.env"
[ -f "$FRONTEND_ENV" ] && cp "$FRONTEND_ENV" "$FRONTEND_ENV$BACKUP_SUFFIX" && echo "  Backed up frontend/.env.local"

# If merge templates exist in repo, merge; else leave .env as-is and only ensure frontend has JWT_SECRET
if [ -f "$DEPLOY_DIR/env.backend.template" ]; then
  echo "========== Merging backend .env (existing values preserved) =========="
  merge_env "$BACKEND_ENV" "$DEPLOY_DIR/env.backend.template"
else
  echo "========== No backend template; keeping existing backend/.env =========="
  [ ! -f "$BACKEND_ENV" ] && { echo "  WARNING: backend/.env missing. Create it from backend/.env.example"; }
fi

if [ -f "$DEPLOY_DIR/env.frontend.template" ]; then
  echo "========== Merging frontend .env.local (existing values preserved) =========="
  merge_env "$FRONTEND_ENV" "$DEPLOY_DIR/env.frontend.template"
else
  echo "========== Ensuring frontend has JWT_SECRET (must match backend for Google sign-in) =========="
  if [ -f "$BACKEND_ENV" ]; then
    JWT_FROM_BACKEND=$(grep -E '^JWT_SECRET=' "$BACKEND_ENV" | sed 's/^JWT_SECRET=//' | head -1)
    if [ -n "$JWT_FROM_BACKEND" ]; then
      if [ -f "$FRONTEND_ENV" ]; then
        if ! grep -q '^JWT_SECRET=' "$FRONTEND_ENV"; then
          echo "JWT_SECRET=$JWT_FROM_BACKEND" >> "$FRONTEND_ENV"
          echo "  Added JWT_SECRET to frontend/.env.local (from backend)"
        fi
      else
        mkdir -p "$(dirname "$FRONTEND_ENV")"
        echo "JWT_SECRET=$JWT_FROM_BACKEND" > "$FRONTEND_ENV"
        echo "NODE_ENV=production" >> "$FRONTEND_ENV"
        echo "  Created frontend/.env.local with JWT_SECRET"
      fi
    fi
  fi
fi

echo "========== Git pull =========="
git pull origin main || true

echo "========== Backend install + build =========="
cd "$APP_DIR/backend"
npm install --production=false
npm run build

echo "========== Frontend install + build =========="
cd "$APP_DIR/frontend"
npm install --production=false
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}" npm run build 2>/dev/null || npm run build

echo "========== PM2 restart =========="
cd "$APP_DIR"
if [ -f "deploy/ecosystem.config.js" ]; then
  pm2 restart deploy/ecosystem.config.js --update-env
elif [ -f "ecosystem.config.js" ]; then
  pm2 restart ecosystem.config.js --update-env
else
  pm2 restart optiohire-backend optiohire-frontend --update-env
fi
pm2 save

echo "========== PM2 status =========="
pm2 status

echo "========== Update complete =========="
