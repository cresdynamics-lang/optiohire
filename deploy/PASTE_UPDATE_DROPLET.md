# Update app on DigitalOcean (console)

Run this **on the droplet** (SSH in, or use DigitalOcean Console).

## One-time: ensure app path

If your app lives in `/opt/optiohire`:

```bash
cd /opt/optiohire && bash deploy/update-on-droplet.sh
```

If it lives in `/var/www/optiohire`:

```bash
cd /var/www/optiohire && bash deploy/update-on-droplet.sh
```

## What the script does

1. **Backs up** `backend/.env` and `frontend/.env.local` (timestamped).
2. **Merges env**: uses `deploy/env.backend.template` and `deploy/env.frontend.template`. **Existing values are kept**; only missing keys are added from the template (so your real secrets and URLs stay).
3. **Ensures frontend JWT**: if no frontend template is used, copies `JWT_SECRET` from backend into `frontend/.env.local` so Google sign-in works.
4. **Git pull** (main).
5. **Backend**: `npm install`, `npm run build`.
6. **Frontend**: `npm install`, `npm run build`.
7. **PM2**: restart via `deploy/ecosystem.config.js` and save.

## Single block to paste in droplet console

```bash
cd /opt/optiohire || cd /var/www/optiohire
bash deploy/update-on-droplet.sh
```

After the first deploy, you can update anytime with:

```bash
cd /opt/optiohire && git pull && bash deploy/update-on-droplet.sh
```

(or use `/var/www/optiohire` if that’s where your app is).
