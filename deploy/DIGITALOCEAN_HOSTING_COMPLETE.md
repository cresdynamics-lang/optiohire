# DigitalOcean hosting — “done” checklist

Use this after [DIGITALOCEAN_DEPLOY.md](./DIGITALOCEAN_DEPLOY.md). Hosting is **complete** when every item below passes.

---

## 1. Infrastructure

| Step | Action |
|------|--------|
| Droplet | Ubuntu 22.04/24.04, **≥2 GB RAM** recommended for on-server `next build` (or use [prebuild-and-deploy-frontend.sh](./prebuild-and-deploy-frontend.sh)). |
| Code | Repo cloned at `/var/www/optiohire` and `git pull origin main` works. |
| DNS | **A** records for `@`, `www`, and `api` point to the droplet’s **public IPv4**. |

Verify DNS from your PC (production droplet IP is **67.205.164.114** unless you change it):

```bash
nslookup optiohire.com
nslookup www.optiohire.com
nslookup api.optiohire.com
```

All should return your droplet IP.

---

## 2. Processes (PM2)

On the droplet:

```bash
pm2 status
```

Expect **online**: `optiohire-backend`, `optiohire-frontend`.

```bash
curl -sS http://127.0.0.1:3001/health | head
curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/
```

Expect HTTP **200** from the frontend root.

---

## 3. NGINX + TLS

```bash
sudo nginx -t && sudo systemctl is-active nginx
sudo certbot certificates
```

- `nginx -t` → **syntax is ok**
- Certbot should list certificates for `optiohire.com`, `www.optiohire.com`, `api.optiohire.com`

From your PC:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://optiohire.com/
curl -sS -o /dev/null -w "%{http_code}\n" https://api.optiohire.com/health
```

Expect **200** (or **301** then **200** if you redirect `www` ↔ apex — that is fine).

---

## 4. Environment & CORS

Edit `/var/www/optiohire/backend/.env` on the server:

- **`CORS_ORIGINS`** — comma-separated, **no spaces** after commas unless intentional. Must include every origin users use, e.g.  
  `https://www.optiohire.com,https://optiohire.com`  
  (The API does **not** read `CORS_ORIGIN`; it uses `CORS_ORIGINS` or `FRONTEND_URL`.)
- **`JWT_SECRET`** — long random string (not the template default).
- **`DATABASE_URL`** — matches the Postgres user/password you created.
- **Email / AI** — `RESEND_API_KEY` (and/or SMTP), `GROQ_API_KEY` if you use those features.

Then:

```bash
pm2 restart optiohire-backend --update-env && pm2 save
```

---

## 5. Database & admin (once)

```bash
cd /var/www/optiohire/backend
npx tsx scripts/ensure-admin-user.ts
```

Log in at `https://optiohire.com/admin/login` (or your `www` URL) with the credentials from that script / your chosen admin user.

---

## 6. You are **done** when

1. HTTPS works for site + API (no browser certificate warnings).  
2. `pm2 status` shows both apps **online** after reboot (`pm2 startup` already run).  
3. Sign-in / signup flows work from the **same host** you put in `CORS_ORIGINS`.  
4. `https://api.optiohire.com/health` returns JSON with database **connected**.

---

## Updates after `git push`

On the droplet:

```bash
cd /var/www/optiohire && git pull origin main && bash deploy/make-app-live-on-server.sh
```

Or in background: `bash deploy/run-update-in-background.sh` (see main deploy doc).

---

## If something fails

| Symptom | Check |
|--------|--------|
| CORS errors in browser | `CORS_ORIGINS` includes the exact `https://` origin (www vs apex). |
| API 502 | `pm2 logs optiohire-backend`, `curl http://127.0.0.1:3001/health` |
| Site 502 / blank | `pm2 logs optiohire-frontend`, frontend build completed without Bus error |
| SSL fails | DNS must resolve to droplet **before** certbot; open ports 80/443 |

For a full command sequence, keep [DIGITALOCEAN_DEPLOY.md](./DIGITALOCEAN_DEPLOY.md) open side-by-side with this checklist.
