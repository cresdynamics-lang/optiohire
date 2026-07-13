# Staging Deployment — Next.js + Vite Side-by-Side

Run both frontends simultaneously during module-by-module migration.

## Architecture

```
                    ┌─────────────┐
   optiohire.com ──►│   Nginx     │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │ Vite :5173  │ │ Next :3000  │ │ API :3001   │
    │ (migrated)  │ │ (legacy)    │ │ (Express)   │
    └─────────────┘ └─────────────┘ └─────────────┘
```

## Local Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Legacy Next (keep running)
cd frontend && npm run dev

# Terminal 3 — Vite (new)
cd frontend-vite && npm install && npm run dev
```

- Next.js: http://localhost:3000
- Vite: http://localhost:5173
- API: http://localhost:3001

Vite dev server proxies `/api/*` to the backend (mirrors Next rewrites).

## Staging Nginx Config

Save as `/etc/nginx/sites-available/optiohire-staging`:

```nginx
# Route migrated modules to Vite, everything else to Next
map $uri $frontend_upstream {
    default                    http://127.0.0.1:3000;  # Next.js legacy
    ~^/$                       http://127.0.0.1:5173;  # Vite: home
    ~^/how-it-works            http://127.0.0.1:5173;
    ~^/jobs                    http://127.0.0.1:5173;
    ~^/pricing                 http://127.0.0.1:5173;
    ~^/about                   http://127.0.0.1:5173;
    # Add more paths as modules are verified...
}

server {
    listen 443 ssl http2;
    server_name staging.optiohire.com;

    # Security headers (match Next config)
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy origin-when-cross-origin;

    location / {
        proxy_pass $frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API always goes to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /auth/ {
        proxy_pass http://127.0.0.1:3001;
    }

    location /storage/ {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

## PM2 Processes

```javascript
// pm2-vite.config.js
module.exports = {
  apps: [
    {
      name: 'optiohire-vite',
      cwd: '/var/www/optiohire/frontend-vite',
      script: 'npx',
      args: 'serve dist -l 5173',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'optiohire-frontend',  // keep legacy
      cwd: '/var/www/optiohire/frontend',
      script: 'node',
      args: '.next/standalone/server.js',
      env: { NODE_ENV: 'production', PORT: 3000 },
    },
  ],
}
```

## Parity Checklist (per module)

- [ ] All routes render without console errors
- [ ] API calls return expected data
- [ ] Auth login/logout/refresh works
- [ ] Forms submit successfully
- [ ] Responsive layout matches
- [ ] Animations respect prefers-reduced-motion
- [ ] No secrets in browser bundle (`npm run build` + inspect dist)

## Rollback

Change Nginx `$frontend_upstream` map entry back to `http://127.0.0.1:3000` for any module that fails parity. No database changes required.
