# Next.js Frontend Audit (Migration Baseline)

Generated for the React + Vite migration. The legacy Next.js app remains live at `frontend/`.

## Framework & Build

| Item | Value |
|------|-------|
| Framework | Next.js 16.1.6 App Router |
| React | 19.2.4 |
| TypeScript | 5.2.x |
| Styling | Tailwind 3.3, shadcn/Radix, Framer Motion |
| State | React Context (`use-auth`), React Query |
| Output | `standalone` (PM2/Docker on port 3000) |
| Build flags | `NEXT_IGNORE_LINT=true`, `NEXT_IGNORE_TYPES=true` |

## Page Routes (95 `page.tsx` files)

### Marketing / Public
`/`, `/how-it-works`, `/jobs`, `/jobs/[slug]`, `/pricing`, `/about`, `/features`, `/solutions`, `/security`, `/privacy`, `/trust-security`, `/why-optiohire`, `/use-cases`, `/contact`, `/demo`, `/blog`, `/customers`, `/compliance`, `/apply/[id]`, `/companies/[id]/jobs`

### Auth
`/auth/options`, `/auth/google/callback`, `/hr/auth/*`, `/candidate/auth/*`, `/console/auth/signin`, `/institutions/auth/signin`

### HR Portal
`/hr`, `/hr/jobs`, `/hr/jobs/new`, `/hr/jobs/[id]/edit`, `/hr/profile`, `/hr/reports`, `/hr/interviews`, `/hr/templates`, `/hr/leaderboard`, `/hr/help`, `/hr/job/[jobId]/*`

### Candidate Portal
`/candidate`, `/candidate/jobs`, `/candidate/profile`, `/candidate/settings`, `/candidate/interviews`, `/candidate/leaderboard`, `/candidate/help`

### Institutions
`/institutions/[institutionId]/*`, `/institutions/onboard/[token]`

### Admin (32 pages)
`/admin`, `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/companies`, `/admin/jobs`, `/admin/applications`, `/admin/candidates`, `/admin/analytics`, `/admin/ai-usage`, `/admin/settings`, `/admin/emails`, `/admin/institutions`, etc.

### Misc
`/dashboard`, `/company-setup`

## API Routes (107 `route.ts` handlers)

Most are **same-origin proxies** to the Express backend. Categories:

- **Auth**: `/api/auth/signin`, `/api/auth/signup`, `/api/auth/admin-signin`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/[path]`, portal-specific `/api/hr/auth/*`, `/api/candidate/auth/*`, `/api/admin/auth/*`
- **User**: `/api/user/me`, `/api/user/company`
- **HR**: `/api/hr/candidates`, `/api/hr/reports/*`, `/api/hr/messages`, `/api/hr/submit`
- **Candidate**: `/api/candidate/dashboard`, `/api/candidate/applications`, `/api/candidate/jobs`, `/api/candidate/interviews`, `/api/candidate/leaderboard`, `/api/candidate/roadmap`
- **Admin**: `/api/admin/*` (users, companies, jobs, emails, audit, settings, workflows, talent-pool, security-logs, etc.)
- **Public**: `/api/job-postings`, `/api/jobs`, `/api/companies`, `/api/contact`, `/api/demos`
- **Special**: `/api/report/[job_posting_id]` (JWT verification via `JWT_SECRET`), `/api/og/job` (edge OG image), `/api/analytics/track`

## Next.js Rewrites (`frontend/next.config.js`)

| Frontend path | Backend destination |
|---------------|---------------------|
| `/api/upload/:path*` | `{backend}/api/upload/:path*` |
| `/api/applications/:path*` | `{backend}/applications/:path*` |
| `/api/job-postings/public/:path*` | `{backend}/api/job-postings/public/:path*` |
| `/api/hr/:path*` | `{backend}/api/hr/:path*` |
| `/api/candidate/:path*` | `{backend}/api/candidate/:path*` |
| `/api/admin/:path*` | `{backend}/api/admin/:path*` |
| `/api/demos/:path*` | `{backend}/api/demos/:path*` |
| `/api/webhooks/:path*` | `{backend}/api/webhooks/:path*` |
| `/api/resend/:path*` | `{backend}/api/resend/:path*` |
| `/api/analytics/:path*` | `{backend}/api/analytics/:path*` |
| `/api/user/:path*` | `{backend}/api/user/:path*` |
| `/api/templates/:path*` | `{backend}/api/templates/:path*` |
| `/api/contact` | `{backend}/contact` |
| `/api/institution-applications` | `{backend}/institution-applications` |
| `/storage/:path*` | `{backend}/storage/:path*` |

## Subdomain Middleware (`frontend/src/middleware.ts`)

| Subdomain | Internal rewrite |
|-----------|------------------|
| `console.*` | `/admin` |
| `admin.*` | `/admin` |
| `applications.*` | `/candidate` |

Skipped for: `/_next`, `/api`, `/assets`, `/auth/options`, files with extensions.

## Security Headers (Next config)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: origin-when-cross-origin`
- Static assets: `Cache-Control: public, max-age=31536000, immutable`

## Redirects

- `/favicon.ico` → `/icon`

## Environment Variables (Frontend-relevant)

### Browser-safe (`NEXT_PUBLIC_*` → `VITE_*`)
- `NEXT_PUBLIC_BACKEND_URL` / `NEXT_PUBLIC_API_URL` — API base URL
- `NEXT_PUBLIC_APP_URL` — canonical app URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase (stub in app)

### Server-only (must NOT ship in Vite bundle)
- `BACKEND_URL`, `JWT_SECRET`, SMTP/IMAP keys, AI keys, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Next.js Import Surface (must shim for Vite)

| Module | Usage count | Vite replacement |
|--------|-------------|------------------|
| `next/navigation` | ~76 files | React Router hooks shim |
| `next/link` | ~56 files | React Router `Link` shim |
| `next/image` | ~8 files | `<img>` wrapper shim |
| `next/script` | layout | dynamic `<script>` shim |
| `next/dynamic` | few | `React.lazy` shim |

## Static Assets

- `frontend/public/` — logos, robots.txt, sitemap.xml, assets/
- OG/icon: `frontend/src/app/icon.tsx`, `frontend/src/app/api/og/job/route.tsx` (edge runtime — needs separate service in Vite)

## Migration Risk Summary

1. **107 API route handlers** — replace with direct backend calls + Vite dev proxy
2. **Subdomain routing** — move to Nginx/CDN or client-side portal router
3. **`JWT_SECRET` in frontend** — only used in 4 report routes; must stay server-side
4. **Build type/lint bypass** — Vite migration should enforce strict checks
5. **Mixed backend path prefixes** — canonical map in `API_CONTRACT.md`
