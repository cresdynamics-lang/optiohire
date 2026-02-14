#!/bin/bash
# Deploy OptioHire to DigitalOcean: Node 18, PM2, NGINX, Let's Encrypt
# Domain: optiohire.com, www.optiohire.com, api.optiohire.com
# Run as root on droplet

set -e
APP_DIR="/var/www/optiohire"
REPO_URL="https://github.com/cresdynamics-lang/optiohire.git"
DOMAIN="optiohire.com"
API_DOMAIN="api.optiohire.com"
FRONTEND_PORT=3000
BACKEND_PORT=3001

echo "=== OptioHire DigitalOcean Deploy ==="

# 1. Install Node 20 (required for Next.js 16 and backend deps)
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
  echo "Installing Node 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

# 2. Install PostgreSQL
if ! command -v psql &>/dev/null; then
  echo "Installing PostgreSQL..."
  apt-get update
  apt-get install -y postgresql postgresql-contrib
  systemctl start postgresql
  systemctl enable postgresql
fi

# Create DB and user if not exists
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='optiohire_user'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER optiohire_user WITH PASSWORD 'optiohire_pass_2024';"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='optiohire'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE optiohire OWNER optiohire_user;"
sudo -u postgres psql -c "ALTER USER optiohire_user WITH PASSWORD 'optiohire_pass_2024';"
# Allow local connections (pg_hba.conf path varies by version)
PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
if [ -n "$PG_HBA" ] && ! grep -q "optiohire_user" "$PG_HBA" 2>/dev/null; then
  echo "host    optiohire   optiohire_user   127.0.0.1/32   md5" >> "$PG_HBA"
  systemctl restart postgresql
fi

# 3. Clone or pull repo
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull origin main && cd -
else
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# 4. Backend env
if [ ! -f "$APP_DIR/backend/.env" ]; then
  cat > "$APP_DIR/backend/.env" << 'ENVBACK'
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://optiohire_user:optiohire_pass_2024@localhost:5432/optiohire
DB_SSL=false
JWT_SECRET=optiohire_jwt_secret_change_in_production_2024
NEXT_PUBLIC_BACKEND_URL=https://api.optiohire.com
CORS_ORIGIN=https://www.optiohire.com
USE_RESEND=true
RESEND_FROM_EMAIL=noreply@optiohire.com
RESEND_FROM_NAME=OptioHire
ENABLE_EMAIL_READER=false
ENVBACK
  echo "Created backend/.env - add RESEND_API_KEY, SMTP, etc."
fi

# 5. Frontend env
if [ ! -f "$APP_DIR/frontend/.env.production" ]; then
  cat > "$APP_DIR/frontend/.env.production" << 'ENVFRONT'
NEXT_PUBLIC_BACKEND_URL=https://api.optiohire.com
NEXTAUTH_URL=https://www.optiohire.com
NODE_ENV=production
ENVFRONT
  echo "Created frontend/.env.production"
fi
# Frontend needs DATABASE_URL for API routes (signup/signin)
echo "NEXT_PUBLIC_BACKEND_URL=https://api.optiohire.com" > "$APP_DIR/frontend/.env.local"
echo "NEXTAUTH_URL=https://www.optiohire.com" >> "$APP_DIR/frontend/.env.local"
echo "NODE_ENV=production" >> "$APP_DIR/frontend/.env.local"
echo "DATABASE_URL=postgresql://optiohire_user:optiohire_pass_2024@localhost:5432/optiohire" >> "$APP_DIR/frontend/.env.local"
echo "DB_SSL=false" >> "$APP_DIR/frontend/.env.local"

# 5b. Apply database schema
if [ -f "$APP_DIR/backend/src/db/complete_schema.sql" ]; then
  echo "Applying database schema..."
  sudo -u postgres psql -d optiohire -f "$APP_DIR/backend/src/db/complete_schema.sql" 2>/dev/null || true
fi

# 6. Install dependencies and build
echo "Installing backend..."
cd "$APP_DIR/backend" && npm install && npm run build && cd "$APP_DIR"
echo "Installing frontend..."
cd "$APP_DIR/frontend" && npm install --legacy-peer-deps && NODE_OPTIONS='--max-old-space-size=2048' npm run build && cd "$APP_DIR"

# 7. PM2
npm install -g pm2 2>/dev/null || true
cd "$APP_DIR"
pm2 delete optiohire-backend 2>/dev/null || true
pm2 delete optiohire-frontend 2>/dev/null || true
cd "$APP_DIR/backend" && pm2 start dist/server.js --name optiohire-backend
cd "$APP_DIR/frontend" && pm2 start npm --name optiohire-frontend -- start
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# 8. UFW
ufw allow ssh
ufw allow http
ufw allow https
echo "y" | ufw enable 2>/dev/null || true
ufw status

# 9. NGINX
apt-get install -y nginx
cat > /etc/nginx/sites-available/optiohire << 'NGINXCONF'
# Frontend - optiohire.com & www.optiohire.com
server {
    listen 80;
    listen [::]:80;
    server_name optiohire.com www.optiohire.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - api.optiohire.com
server {
    listen 80;
    listen [::]:80;
    server_name api.optiohire.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/optiohire /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 10. SSL with Certbot
apt-get install -y certbot python3-certbot-nginx 2>/dev/null || true
# Certbot will prompt or use --non-interactive with email
echo "Run SSL manually: sudo certbot --nginx -d optiohire.com -d www.optiohire.com -d api.optiohire.com --non-interactive --agree-tos -m your@email.com"
echo "=== Deploy script done. App should be on http://$(curl -s ifconfig.me). ==="
echo "After DNS points to this server, run certbot for HTTPS."
