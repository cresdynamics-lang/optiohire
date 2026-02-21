# Paste once: build + env (with API URLs) + PM2

Use this **after** the repo is at `/var/www/optiohire`, Node 20 and PM2 are installed, and Postgres + NGINX are set up.  
**Droplet IP:** 165.227.56.148 | **Domain / API:** optiohire.com, www.optiohire.com, api.optiohire.com

---

## Single block to paste on the droplet

Copy everything below (from `# Backend env` to `pm2 status`) and paste into your SSH session. It sets env (including API URLs), builds backend and frontend, and starts PM2.

```bash
# Backend env (API URL = https://api.optiohire.com)
cat > /var/www/optiohire/backend/.env << 'EOF'
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
EOF

# Frontend env (site + API URLs)
echo "NEXT_PUBLIC_BACKEND_URL=https://api.optiohire.com" > /var/www/optiohire/frontend/.env.local
echo "NEXTAUTH_URL=https://www.optiohire.com" >> /var/www/optiohire/frontend/.env.local
echo "NODE_ENV=production" >> /var/www/optiohire/frontend/.env.local
echo "DATABASE_URL=postgresql://optiohire_user:optiohire_pass_2024@localhost:5432/optiohire" >> /var/www/optiohire/frontend/.env.local
echo "DB_SSL=false" >> /var/www/optiohire/frontend/.env.local

# Schema (if needed)
sudo -u postgres psql -d optiohire -f /var/www/optiohire/backend/src/db/complete_schema.sql 2>/dev/null || true

# Backend build + start
cd /var/www/optiohire/backend && npm install && npm run build
pm2 delete optiohire-backend 2>/dev/null; cd /var/www/optiohire/backend && pm2 start dist/server.js --name optiohire-backend

# Frontend build + start (2GB RAM; ignore baseline/autoprefixer warnings)
cd /var/www/optiohire/frontend && npm install --legacy-peer-deps && NODE_OPTIONS='--max-old-space-size=2048' npm run build
pm2 delete optiohire-frontend 2>/dev/null; cd /var/www/optiohire/frontend && pm2 start npm --name optiohire-frontend -- start

pm2 save
pm2 status
```

Then add your real keys: `nano /var/www/optiohire/backend/.env` (RESEND_API_KEY, GROQ_API_KEY, etc.) and run `pm2 restart optiohire-backend && pm2 save`.

---

**Build warnings you can ignore:**  
- `[baseline-browser-mapping] ... over two months old` — package updated to ^2.10.0 in the repo.  
- `autoprefixer: Gradient has outdated direction syntax` — comes from Tailwind’s compiled CSS; safe to ignore.  
- `102 vulnerabilities` — run `npm audit fix --legacy-peer-deps` if you want; use `--force` only if you accept possible breakage.
