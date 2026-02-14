# Deploy OptioHire to DigitalOcean (PM2 + NGINX + SSL)

**Droplet IP:** 165.22.128.141  
**Domain:** www.optiohire.com, optiohire.com, api.optiohire.com  

## 1. Push latest code (from your machine)

```bash
cd /path/to/optiohire
git push origin main
```

## 2. SSH into the droplet

Use keepalive so the connection does not drop during long runs:

```bash
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=5 -o PreferredAuthentications=password -o PubkeyAuthentication=no root@165.22.128.141
# Password: Manage@1Optiohire
```

## 3. Run the deploy script on the server

```bash
# If not already there, copy the script first (from your machine):
# scp -o PreferredAuthentications=password -o PubkeyAuthentication=no deploy/digitalocean-deploy.sh root@165.22.128.141:/root/

# On the droplet:
chmod +x /root/digitalocean-deploy.sh
bash /root/digitalocean-deploy.sh
```

The script will:

- Install **Node 20** (required for Next.js 16 and backend)
- Install **PostgreSQL**, create DB `optiohire` and user `optiohire_user` (password: `optiohire_pass_2024`)
- **Clone** from GitHub: https://github.com/cresdynamics-lang/optiohire.git
- Create **backend/.env** and **frontend/.env** with production URLs
- **Build** backend and frontend
- Start **PM2**: `optiohire-backend` (port 3001), `optiohire-frontend` (port 3000)
- Configure **UFW** (ssh, http, https)
- Configure **NGINX** (optiohire.com + www → 3000, api.optiohire.com → 3001)

## 4. Add SSL (Let's Encrypt)

On the droplet, after DNS for **optiohire.com**, **www.optiohire.com**, and **api.optiohire.com** points to **165.22.128.141**:

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d optiohire.com -d www.optiohire.com -d api.optiohire.com --non-interactive --agree-tos -m your@email.com
```

Test renewal:

```bash
certbot renew --dry-run
```

## 5. DNS (DigitalOcean / your registrar)

- **A** record: `@` → 165.22.128.141  
- **A** record: `www` → 165.22.128.141  
- **A** record: `api` → 165.22.128.141  

## 6. After first deploy: add secrets

On the droplet, edit env files and add your keys:

```bash
nano /var/www/optiohire/backend/.env
# Add: RESEND_API_KEY=..., SMTP_PASS=..., GROQ_API_KEY=..., etc.

nano /var/www/optiohire/frontend/.env.local
# Add DATABASE_URL if needed (same as backend), JWT_SECRET, etc.
```

Then restart PM2:

```bash
pm2 restart optiohire-backend optiohire-frontend
pm2 save
```

## 7. Useful commands on the server

```bash
pm2 status
pm2 logs
pm2 restart optiohire-backend
pm2 restart optiohire-frontend
nginx -t && systemctl reload nginx
```

## 8. Make app live / update after push

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
SERVER=root@165.22.128.141 ./deploy/prebuild-and-deploy-frontend.sh
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
