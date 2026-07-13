# Migration Verification Checklist

Run after each module migration in staging.

## Build Verification

```bash
cd frontend-vite
npm install --legacy-peer-deps
npm run build          # Must succeed
npm run preview        # Smoke test on :4173
```

## Route Parity (95 routes)

All routes are registered in `frontend-vite/src/routes.tsx`. Verify each loads:

### Marketing (priority 1)
- [ ] `/` — landing page, animated counters, institution apply dialog
- [ ] `/how-it-works` — dark theme, animations
- [ ] `/jobs` — job listings, search/filters
- [ ] `/jobs/:slug` — job detail
- [ ] `/pricing`, `/about`, `/features`, `/solutions`
- [ ] `/security`, `/privacy`, `/trust-security`
- [ ] `/contact`, `/demo`

### Auth (priority 2)
- [ ] `/auth/options` — portal selection
- [ ] `/hr/auth/signin`, `/hr/auth/signup`
- [ ] `/candidate/auth/signin`, `/candidate/auth/signup`
- [ ] `/admin/login` — neumorphism UI, admin guard
- [ ] Password reset + email verification flows
- [ ] Google OAuth callbacks

### Candidate Portal (priority 3)
- [ ] `/candidate` — dashboard
- [ ] `/candidate/jobs`, `/candidate/profile`, `/candidate/interviews`
- [ ] Subdomain: `applications.optiohire.com` → `/candidate`

### HR Portal (priority 4)
- [ ] `/hr` — dashboard
- [ ] `/hr/jobs`, `/hr/jobs/new`, `/hr/reports`
- [ ] `/hr/interviews`, `/hr/templates`

### Institutions (priority 5)
- [ ] `/institutions/auth/signin`
- [ ] `/institutions/:id/overview`, `/roster`, `/tracker`
- [ ] `/institutions/onboard/:token`

### Admin (priority 6 — last)
- [ ] `/admin` — users list
- [ ] `/admin/dashboard`, `/admin/analytics`, `/admin/ai-usage`
- [ ] AdminGuard: no shell before login
- [ ] 59-second inactivity countdown modal
- [ ] Fixed sidebar on desktop (no hamburger)
- [ ] Neumorphism UI
- [ ] Subdomain: `console.optiohire.com` → `/admin`

## API Parity

- [ ] Auth signin/signup returns JWT
- [ ] `/api/user/me` enriches profile
- [ ] HR candidate list loads
- [ ] Candidate dashboard loads
- [ ] Admin stats/users load
- [ ] Contact form submits
- [ ] Institution application submits
- [ ] File upload works

## Security

- [ ] No `JWT_SECRET` in Vite bundle (`grep -r JWT_SECRET dist/` → empty)
- [ ] No SMTP/database credentials in bundle
- [ ] Token expiry enforced (AdminGuard)
- [ ] CORS allows Vite origin on backend

## Subdomain Routing

- [ ] `console.localhost:5173` → admin (client-side rewrite)
- [ ] `applications.localhost:5173` → candidate

## Rollback Test

- [ ] Nginx map entry can switch module back to Next.js :3000
- [ ] No data loss on rollback
