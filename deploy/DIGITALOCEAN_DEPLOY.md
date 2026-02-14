# Deploy OptioHire to DigitalOcean (PM2 + NGINX + SSL)

**Droplet IP:** 165.22.128.141  
**Domain:** www.optiohire.com, optiohire.com, api.optiohire.com  

## 1. Push latest code (from your machine)

```bash
cd /path/to/optiohire
git push origin main
```

## 2. SSH into the droplet

```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@165.22.128.141
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

**One command on the server** (after SSH): pulls latest, ensures Node 20 via nvm, builds backend + frontend, restarts PM2.

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

---

**Backend build fixes** (already in repo): logger import in auth, groq-sdk dependency, Zod/logger/redis/resend TypeScript fixes. After you `git push`, the deploy script will build successfully.
