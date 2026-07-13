# Canonical API Contract

Maps frontend `/api/*` calls to real Express backend endpoints. The Vite app calls these **directly** (with CORS + Bearer auth). Dev proxy in `frontend-vite/vite.config.ts` mirrors same-origin behavior.

## Base URL

| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:3001` |
| Production | `https://api.optiohire.com` |
| Vite env | `VITE_API_URL` |

## Auth Headers

```
Authorization: Bearer <jwt>
X-Admin-Email: <admin@email>   // admin routes only
Content-Type: application/json
```

## Auth Endpoints

| Frontend (Next proxy) | Backend (real) | Method |
|-----------------------|----------------|--------|
| `/api/auth/signin` | `/auth/signin` | POST |
| `/api/auth/signup` | `/auth/signup` | POST |
| `/api/auth/admin-signin` | `/auth/admin-signin` | POST |
| `/api/auth/forgot-password` | `/auth/forgot-password` | POST |
| `/api/auth/reset-password` | `/auth/reset-password` | POST |
| `/api/auth/verify-reset-code` | `/auth/verify-reset-code` | POST |
| `/api/hr/auth/signin` | `/auth/hr/signin` | POST |
| `/api/hr/auth/signup` | `/auth/hr/signup` | POST |
| `/api/candidate/auth/signin` | `/auth/candidate/signin` | POST |
| `/api/candidate/auth/signup` | `/auth/candidate/signup` | POST |
| `/api/admin/auth/signin` | `/auth/admin/signin` | POST |

## User

| Frontend | Backend | Method |
|----------|---------|--------|
| `/api/user/me` | `/api/user/me` | GET |
| `/api/user/me` (DELETE) | `/api/user/delete-account` | DELETE |
| `/api/user/company` | `/api/user/company` | GET/PUT |

## HR

| Frontend | Backend | Method |
|----------|---------|--------|
| `/api/hr/candidates` | `/api/hr/candidates` | GET |
| `/api/hr/candidates/:id` | `/api/hr/candidates/:id` | GET/PATCH |
| `/api/hr/candidates/:id/status` | `/api/hr/candidates/:id/status` | PATCH |
| `/api/hr/reports/:jobId` | `/api/hr/reports/:jobId` | GET |
| `/api/hr/reports/dashboard/stats` | `/api/hr/reports/dashboard/stats` | GET |
| `/api/hr/reports/generate` | `/api/hr/reports/generate` | POST |
| `/api/hr/messages` | `/api/hr/messages` | GET/POST |
| `/api/hr/messages/generate` | `/api/hr/messages/generate` | POST |
| `/api/hr/submit` | `/api/hr/submit` | POST |

## Candidate

| Frontend | Backend | Method |
|----------|---------|--------|
| `/api/candidate/dashboard` | `/api/candidate/dashboard` | GET |
| `/api/candidate/applications` | `/api/candidate/applications` | GET |
| `/api/candidate/jobs` | `/api/candidate/jobs` | GET |
| `/api/candidate/interviews` | `/api/candidate/interviews` | GET |
| `/api/candidate/leaderboard` | `/api/candidate/leaderboard` | GET |
| `/api/candidate/roadmap` | `/api/candidate/roadmap` | GET |
| `/api/candidate/certificate` | `/api/candidate/certificate` | GET |
| `/api/candidate/submit` | `/api/candidate/submit` | POST |

## Admin

| Frontend | Backend | Method |
|----------|---------|--------|
| `/api/admin/stats` | `/api/admin/stats` | GET |
| `/api/admin/users` | `/api/admin/users` | GET |
| `/api/admin/users/:id` | `/api/admin/users/:id` | GET/PATCH/DELETE |
| `/api/admin/users/:id/approve` | `/api/admin/users/:id/approve` | POST |
| `/api/admin/users/:id/reject` | `/api/admin/users/:id/reject` | POST |
| `/api/admin/companies` | `/api/admin/companies` | GET |
| `/api/admin/job-postings` | `/api/admin/job-postings` | GET/POST |
| `/api/admin/applications` | `/api/admin/applications` | GET |
| `/api/admin/emails` | `/api/admin/emails` | GET |
| `/api/admin/settings` | `/api/admin/settings` | GET/PUT |
| `/api/admin/ai-usage` | `/api/admin/ai-usage` | GET |
| `/api/admin/security-logs` | `/api/admin/security-logs` | GET |
| `/api/admin/certificates/pending` | `/api/admin/certificates/pending` | GET |
| `/api/admin/certificates/approve` | `/api/admin/certificates/approve` | POST |

## Public / Jobs

| Frontend | Backend | Method |
|----------|---------|--------|
| `/api/job-postings/public` | `/api/job-postings/public` | GET |
| `/api/job-postings/public/:id` | `/api/job-postings/public/:id` | GET |
| `/api/job-postings` | `/api/job-postings` | GET/POST |
| `/api/jobs` | `/jobs` | GET |
| `/api/jobs/:id` | `/jobs/:id` | GET |
| `/api/companies` | `/companies` | GET |
| `/api/contact` | `/contact` | POST |
| `/api/institution-applications` | `/institution-applications` | POST |
| `/api/demos` | `/api/demos` | POST |
| `/api/applications/public-submit` | `/applications/public-submit` | POST |
| `/api/upload/public-candidate-document` | `/api/upload/public-candidate-document` | POST |
| `/api/upload/company-logo` | `/api/upload/company-logo` | POST |
| `/storage/:path` | `/storage/:path` | GET |

## Path Remapping (Next rewrites only)

These frontend paths differ from backend paths:

| Frontend calls | Actual backend path |
|----------------|---------------------|
| `/api/applications/*` | `/applications/*` |
| `/api/contact` | `/contact` |
| `/api/institution-applications` | `/institution-applications` |

## Server-only routes (cannot move to browser)

| Route | Reason |
|-------|--------|
| `/api/report/[job_posting_id]` | Uses `JWT_SECRET` server-side verification |
| `/api/og/job` | Edge `ImageResponse` — needs separate OG service |

## CORS Requirements

Backend (`backend/src/server.ts`) allows:
- Origins in `CORS_ORIGINS` / `FRONTEND_URL`
- All `*.optiohire.com` subdomains
- Headers: `Content-Type`, `Authorization`, `X-Admin-Email`

Add Vite dev origin (`http://localhost:5173`) and production Vite host to `CORS_ORIGINS` when cutting over.

## Vite API Client Pattern

```typescript
// frontend-vite/src/lib/api-client.ts
const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function apiFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token')
  const headers = new Headers(init?.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(`${base}${path}`, { ...init, headers })
  return res
}
```

For backward compatibility during migration, Vite dev proxy also serves `/api/*` same-origin (see `vite.config.ts`).
