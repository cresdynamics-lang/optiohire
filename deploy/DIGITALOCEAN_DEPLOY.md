# Deploy OptioHire to DigitalOcean (PM2 + NGINX + SSL)

Host the OptioHire app (Next.js frontend + Express backend + PostgreSQL) on a DigitalOcean Droplet using PM2, NGINX, and Let's Encrypt SSL.

**Domain:** optiohire.com, www.optiohire.com, api.optiohire.com  
**API reference:** [API_REFERENCE.md](../API_REFERENCE.md) in the repo root.

---

## Quick start: host this app on Digital Ocean

1. **Create a Droplet** (see [Prerequisites](#0-prerequisites--create-a-droplet)); current IP **165.227.56.148**.
2. **Push code:** `git push origin main`
3. **SSH in:** `ssh -o ServerAliveInterval=60 root@165.227.56.148`
4. **Run the deploy script** or follow [All commands to run on the droplet console](#all-commands-to-run-on-the-droplet-console).
5. **Point DNS** for `@`, `www`, and `api` to **165.227.56.148**.
6. **Run Certbot** for SSL (see [§4](#4-add-ssl-lets-encrypt)).
7. **Add secrets** in `backend/.env` and restart PM2 (see [§6](#6-after-first-deploy-add-secrets)).

**Droplet IP:** **165.227.56.148**  
**Domain:** optiohire.com, www.optiohire.com, api.optiohire.com

---

## All commands to run on the droplet console

SSH in first: `ssh root@165.227.56.148` (or with keepalive: `ssh -o ServerAliveInterval=60 root@165.227.56.148`). Then run these in order. Replace `your@email.com` in the Certbot command with your real email.

---

### 1. Install Node 20 and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 2. Install PostgreSQL and create DB

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER optiohire_user WITH PASSWORD 'optiohire_pass_2024';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE optiohire OWNER optiohire_user;" 2>/dev/null || true
PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
if [ -n "$PG_HBA" ] && ! grep -q "optiohire_user" "$PG_HBA" 2>/dev/null; then
  echo "host    optiohire   optiohire_user   127.0.0.1/32   md5" | sudo tee -a "$PG_HBA"
  sudo systemctl restart postgresql
fi
```

*(If user/db already exist, the create commands may error; that’s OK.)*

### 3. Clone the project

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/cresdynamics-lang/optiohire.git
cd /var/www/optiohire
```

### 4. Create env files (backend)

```bash
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
```

*(Edit later to add RESEND_API_KEY, GROQ_API_KEY, etc.: `nano /var/www/optiohire/backend/.env`.)*

### 5. Create env files (frontend)

```bash
echo "NEXT_PUBLIC_BACKEND_URL=https://api.optiohire.com" > /var/www/optiohire/frontend/.env.local
echo "NEXTAUTH_URL=https://www.optiohire.com" >> /var/www/optiohire/frontend/.env.local
echo "NODE_ENV=production" >> /var/www/optiohire/frontend/.env.local
echo "DATABASE_URL=postgresql://optiohire_user:optiohire_pass_2024@localhost:5432/optiohire" >> /var/www/optiohire/frontend/.env.local
echo "DB_SSL=false" >> /var/www/optiohire/frontend/.env.local
```

### 6. Apply database schema

```bash
sudo -u postgres psql -d optiohire -f /var/www/optiohire/backend/src/db/complete_schema.sql
```

### 7. Install dependencies and build

```bash
cd /var/www/optiohire/backend
npm install
npm run build
```

```bash
cd /var/www/optiohire/frontend
npm install --legacy-peer-deps
NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

*(If the frontend build fails with “Bus error”, add swap [see §10 in this doc] or use `npm run build:low-memory` or `npm run build:server`.)*

### 8. Start app with PM2

```bash
sudo npm i -g pm2
cd /var/www/optiohire/backend
pm2 start dist/server.js --name optiohire-backend
cd /var/www/optiohire/frontend
pm2 start npm --name optiohire-frontend -- start
pm2 save
pm2 startup
```

*(Run the command `pm2 startup` prints so the app starts on reboot.)*

Check: `pm2 status` — both should be “online”. You can open http://165.227.56.148:3000 and http://165.227.56.148:3001 to test.

### 9. UFW firewall

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable
sudo ufw status
```

### 10. Install NGINX and configure reverse proxy

```bash
sudo apt install -y nginx
```

```bash
sudo tee /etc/nginx/sites-available/optiohire << 'EOF'
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
EOF
```

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/optiohire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 11. DNS (do this in DigitalOcean / your registrar)

- In **DigitalOcean** → Networking → Domains, add **optiohire.com**.
- Add **A** records pointing to **165.227.56.148**:
  - `@` → 165.227.56.148  
  - `www` → 165.227.56.148  
  - `api` → 165.227.56.148  

If the domain is at another registrar (e.g. Namecheap), set **custom nameservers** to:

- `ns1.digitalocean.com`
- `ns2.digitalocean.com`
- `ns3.digitalocean.com`

Wait for DNS to propagate, then continue.

### 12. SSL with Let’s Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d optiohire.com -d www.optiohire.com -d api.optiohire.com --non-interactive --agree-tos -m your@email.com
```

*(Replace `your@email.com` with your email.)*

Test renewal:

```bash
sudo certbot renew --dry-run
```

---

After this, open **https://optiohire.com** and **https://api.optiohire.com**. Add your real API keys in `/var/www/optiohire/backend/.env` and run `pm2 restart optiohire-backend optiohire-frontend && pm2 save`.

---

## 0. Prerequisites – Create a Droplet

If you don’t have a server yet:

1. **DigitalOcean** → Create → **Droplets**.
2. **Image:** Ubuntu 24.04 LTS (or 22.04).
3. **Plan:**  
   - **2 GB RAM / 1 vCPU** minimum if you build on the server (or add a 2 GB swap; see [§10](#10-make-app-live--update-after-push)).  
   - **1 GB** is enough if you use [prebuild-and-deploy](#if-frontend-build-fails-with-bus-error-core-dumped) from your machine.
4. **Datacenter:** Choose one close to your users.
5. **Authentication:** Add your SSH key (recommended) or use password and keep it safe.
6. **Hostname:** e.g. `optiohire-prod`.
7. Create the Droplet and note the **IP address**. Current production IP: **165.227.56.148**.

---

## 1. Push latest code (from your machine)

```bash
cd /path/to/optiohire
git push origin main
```

## 2. SSH into the droplet

Use keepalive so the connection does not drop during long runs:

```bash
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=5 root@165.227.56.148
```

If you use password auth instead of SSH keys:

```bash
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=5 -o PreferredAuthentications=password -o PubkeyAuthentication=no root@165.227.56.148
```

## 3. Run the deploy script on the server

**Option A – Script already on server** (e.g. after a previous clone):

```bash
cd /var/www/optiohire && git pull origin main && bash deploy/digitalocean-deploy.sh
```

**Option B – First time: copy script then run**

From your machine:

```bash
scp deploy/digitalocean-deploy.sh root@165.227.56.148:/root/
```

On the droplet:

```bash
chmod +x /root/digitalocean-deploy.sh
bash /root/digitalocean-deploy.sh
```

(The script will clone the repo to `/var/www/optiohire` if it’s not there yet.)

The script will:

- Install **Node 20** (required for Next.js 16 and backend)
- Install **PostgreSQL**, create DB `optiohire` and user `optiohire_user` (default password in script; change in production)
- **Clone** from GitHub: https://github.com/cresdynamics-lang/optiohire.git
- Create **backend/.env** and **frontend/.env.production** / **frontend/.env.local** with production URLs
- **Build** backend and frontend
- Start **PM2**: `optiohire-backend` (port 3001), `optiohire-frontend` (port 3000)
- Configure **UFW** (ssh, http, https)
- Configure **NGINX** (optiohire.com + www → 3000, api.optiohire.com → 3001)

## 4. Add SSL (Let's Encrypt)

On the droplet, after DNS for **optiohire.com**, **www.optiohire.com**, and **api.optiohire.com** points to your droplet IP:

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d optiohire.com -d www.optiohire.com -d api.optiohire.com --non-interactive --agree-tos -m your@email.com
```

Test renewal:

```bash
certbot renew --dry-run
```

## 5. DNS (DigitalOcean / your registrar)

Point all to **165.227.56.148** (or your droplet IP if different).

- **A** record: `@` (or optiohire.com) → **165.227.56.148**  
- **A** record: `www` → **165.227.56.148**  
- **A** record: `api` → **165.227.56.148**  

## 6. After first deploy: add secrets

On the droplet, edit env files and add your real keys and secrets (and change any default passwords):

```bash
nano /var/www/optiohire/backend/.env
# Add/update: RESEND_API_KEY=..., SMTP_PASS=..., GROQ_API_KEY=..., JWT_SECRET=..., etc.

nano /var/www/optiohire/frontend/.env.local
# Add DATABASE_URL if needed (same as backend), JWT_SECRET if used by frontend, etc.
```

Then restart PM2:

```bash
pm2 restart optiohire-backend optiohire-frontend
pm2 save
```

### Admin login and API access

Admin login at **https://optiohire.com/admin/login** now uses the backend: it signs in with the backend and stores a real JWT, so admin API calls (users, companies, jobs, etc.) work. Ensure the admin user exists in the database:

**On the droplet (once):**

```bash
cd /var/www/optiohire/backend
npx tsx scripts/ensure-admin-user.ts
```

Then log in with **admin@optiohire.com** / **OptioHire@Admin**. After logout, going to `/admin` will redirect to `/admin/login` (expected).

### OTP / verification emails for signup

Sign-up account creation sends a **6-digit verification code** to the user’s email. The frontend calls the backend `POST /auth/send-signup-verification-email`; the backend saves the code in `email_verification_codes` and sends the email via **Resend** (or SMTP). For codes to be sent in production, set in **backend/.env**:

- `USE_RESEND=true`
- `RESEND_API_KEY=re_...` (from Resend dashboard)
- `RESEND_FROM_EMAIL=noreply@optiohire.com` (or your verified domain)

If Resend is not set, the backend falls back to SMTP (`MAIL_HOST`, `MAIL_USER`, `MAIL_PASS`). Ensure one of these is configured.

**Ensure the table and permissions exist** (run once on the droplet):

```bash
# If you added email_verification_codes via a migration, grant access:
sudo -u postgres psql -d optiohire -c "
  CREATE TABLE IF NOT EXISTS email_verification_codes (
    code_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    email text NOT NULL,
    code text NOT NULL,
    expires_at timestamptz NOT NULL,
    used boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  GRANT SELECT, INSERT, UPDATE, DELETE ON email_verification_codes TO optiohire_user;
"
```

**Test that the 6-digit code is sent** (use an existing user’s email):

```bash
cd /var/www/optiohire/backend
npx tsx scripts/send-test-verification-code.ts user@example.com
```

Check the inbox for that email; the script also prints the code in the terminal. If the script fails, check backend logs (`pm2 logs optiohire-backend`) and that `RESEND_API_KEY` or SMTP is set in backend `.env`.

**If you see "optiohire.com domain is not verified" or "Found 0 verified domain(s)":**

- The API key(s) in `.env` must be from the **same Resend account** where you verified **optiohire.com** (https://resend.com/domains).
- On the server, use **one** key from that account. In `backend/.env` set:
  - `RESEND_API_KEY=re_...` (the key from the account that has optiohire.com verified)
  - `RESEND_FROM_EMAIL=noreply@optiohire.com`
  - Leave `RESEND_API_KEY_SECONDARY` and `RESEND_API_KEY_FALLBACK` **unset** if they are from other accounts (otherwise you get 403 then rate limit, and no fallback).
- Restart: `pm2 restart optiohire-backend && pm2 save`.

**If Resend still fails and fallback fails:** configure SMTP in `backend/.env` (e.g. `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` for Gmail App Password) so verification emails can send when Resend is unavailable.

## 7. Ensure API is on the server (if api.optiohire.com was missing)

If the API wasn’t set up or needs to be added/updated (backend + NGINX for api.optiohire.com):

```bash
cd /var/www/optiohire
git pull origin main
bash deploy/ensure-api-on-server.sh
```

This script will:

- Install backend deps, build backend, and start/restart `optiohire-backend` (port 3001)
- Create or update NGINX so **api.optiohire.com** proxies to port 3001
- Reload NGINX and run a quick health check

**DNS:** Ensure an **A** record for **api** (or **api.optiohire.com**) points to your droplet IP.  
**SSL:** After DNS is correct, run certbot for api.optiohire.com (see [§4](#4-add-ssl-lets-encrypt)).

## 8. Database schema (if "relation job_postings does not exist")

If the backend logs "relation \"job_postings\" does not exist", apply the schema once:

```bash
sudo -u postgres psql -d optiohire -f /var/www/optiohire/backend/src/db/complete_schema.sql
```

Then restart the backend: `pm2 restart optiohire-backend`.

## 9. Useful commands on the server

```bash
pm2 status
pm2 logs
pm2 restart optiohire-backend
pm2 restart optiohire-frontend
nginx -t && systemctl reload nginx
```

## 10. Make app live / update after push

**If your SSH console disconnects** during the update, use one of these:

**Option A – Run update in background** (survives disconnect):

```bash
cd /var/www/optiohire
git pull origin main
bash deploy/run-update-in-background.sh
# You can disconnect. Reconnect later and check: tail /var/www/optiohire/deploy-update.log
```

**Option B – Run in foreground** (use SSH keepalive in step 2 so the session stays up):

```bash
cd /var/www/optiohire
git pull origin main
bash deploy/make-app-live-on-server.sh
```

The script installs nvm + Node 20 if needed (avoids apt lock), builds both apps, and restarts PM2 so the frontend runs with Node 20.

**Manual update** (if you prefer):

```bash
cd /var/www/optiohire
git pull origin main
cd backend && npm install && npm run build
cd ../frontend && npm install --legacy-peer-deps && NODE_OPTIONS='--max-old-space-size=2048' npm run build
pm2 restart optiohire-backend optiohire-frontend
pm2 save
```

(Requires Node ≥20 for frontend; use nvm or upgrade system Node if needed.)

### If frontend build fails with "Bus error (core dumped)"

The droplet may not have enough RAM for `next build`. Use **pre-build locally and deploy**:

```bash
# On your machine (where build works):
cd /path/to/optiohire
SERVER=root@165.227.56.148 ./deploy/prebuild-and-deploy-frontend.sh
```

This builds the frontend locally, rsyncs `.next` to the server, and restarts PM2. Ensure the server has the latest backend (run `git pull` + backend build first if needed).

---

**Alternative** – if you prefer building on the server, try:

**1. Add 2GB swap** (on the droplet):

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Then retry the update (or only the frontend build):

```bash
cd /var/www/optiohire/frontend
npm run build:low-memory
# or if it still fails: npm run build:server
cd /var/www/optiohire
pm2 restart optiohire-backend optiohire-frontend
pm2 save
```

**2. Use the lowest-memory build** (no swap):

```bash
cd /var/www/optiohire/frontend
npm run build:server
# then from /var/www/optiohire: pm2 restart optiohire-backend optiohire-frontend && pm2 save
```

The package name for the Baseline warning is **`baseline-browser-mapping`** (with a hyphen). It is now in the repo; after `git pull` and `npm install --legacy-peer-deps` the warning should reduce or go away.

---

**Backend build fixes** (already in repo): logger import in auth, groq-sdk dependency, Zod/logger/redis/resend TypeScript fixes. After you `git push`, the deploy script will build successfully.
