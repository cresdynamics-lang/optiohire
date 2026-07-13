# Production Cutover — Next.js to Vite

Gradual traffic switch after all modules pass staging parity.

## Pre-Cutover Checklist

- [ ] All 95 routes mapped in `frontend-vite/src/routes.tsx`
- [ ] `npm run build` succeeds in `frontend-vite/` with zero type errors
- [ ] Backend `CORS_ORIGINS` includes production Vite host
- [ ] Nginx security headers replicated
- [ ] `robots.txt` and `sitemap.xml` served from `frontend/public`
- [ ] Subdomain routing tested: `console.`, `admin.`, `applications.`
- [ ] Admin guard + 59s session countdown verified
- [ ] Google OAuth redirect URIs updated if origin changes
- [ ] PM2/Docker health checks configured for Vite app

## Cutover Steps

### Phase 1 — Deploy Vite alongside Next (no traffic switch)

```bash
cd frontend-vite
npm ci
npm run build
pm2 start pm2-vite.config.js
```

Verify: `curl -I http://127.0.0.1:5173/`

### Phase 2 — Route traffic module by module

Update Nginx map (see `STAGING_DEPLOYMENT.md`) one module at a time:

1. Marketing pages (`/`, `/how-it-works`, `/jobs`, `/pricing`, etc.)
2. Auth flows
3. Candidate portal
4. HR portal
5. Institutions
6. Admin console (last)

Monitor for 24h after each module:
- Nginx access/error logs
- Backend API error rate
- PM2 process health

### Phase 3 — Full cutover

Point all frontend traffic to Vite:

```nginx
location / {
    proxy_pass http://127.0.0.1:5173;
    # ... proxy headers
}
```

Keep Next.js running for 7 days as rollback:

```bash
# Rollback: change proxy_pass back to :3000
sudo nginx -t && sudo systemctl reload nginx
```

### Phase 4 — Decommission Next.js

After 7+ days stable:

```bash
pm2 delete optiohire-frontend
# Archive frontend/ directory (do not delete until confident)
```

Remove obsolete pieces:
- `frontend/src/app/api/**` (107 proxy routes)
- `frontend/src/middleware.ts`
- Next-specific deps from root `package.json`

## Environment Variables (Production)

```env
# frontend-vite/.env.production
VITE_API_URL=https://api.optiohire.com
VITE_APP_URL=https://optiohire.com
VITE_GOOGLE_CLIENT_ID=<same as current>
```

Backend addition:
```env
CORS_ORIGINS=https://optiohire.com,https://www.optiohire.com,https://console.optiohire.com
```

## Monitoring Post-Cutover

- Watch 4xx/5xx rates on Nginx for 48h
- Verify JWT expiry + admin session countdown in production
- Check file uploads (`/api/upload`) and storage (`/storage/`)
- Confirm email flows (contact, institution applications, demos)
