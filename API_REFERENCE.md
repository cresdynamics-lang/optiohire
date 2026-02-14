# OptioHire Backend API Reference

Base URL (production): `https://api.optiohire.com`  
Local: `http://localhost:3001`

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Full health (DB, Redis, uptime) |
| GET | `/health/email-reader` | No | Email reader status |
| GET | `/health/db` | No | Database connectivity |

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Register |
| POST | `/auth/signin` | No | Login |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/verify-reset-token` | No | Verify reset token |
| POST | `/auth/verify-reset-code` | No | Verify reset code |
| POST | `/auth/reset-password` | No | Set new password |
| POST | `/auth/send-signup-verification-email` | No | Resend signup verification |
| POST | `/auth/verify-email` | No | Verify email |
| GET | `/auth/health` | No | Auth health check |

---

## User & preferences

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/me` | Yes | Current user |
| PUT | `/api/user/company` | Yes | Update user company |
| GET | `/api/user/preferences` | Yes | Get preferences |
| PUT | `/api/user/preferences` | Yes | Update preferences |

---

## Job postings & jobs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/job-postings` | Yes | List job postings |
| POST | `/api/job-postings` | Yes | Create job posting |
| POST | `/api/job/create` | Yes | Create job (legacy) |
| GET | `/jobs/:id/applicants` | No | Applicants for job |
| POST | `/companies` | No | Create company |
| GET | `/companies/:id/report` | No | Company report |

---

## HR candidates & reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hr/candidates` | Yes | Candidates by job (`?jobId=`) |
| GET | `/api/hr/candidates/:id` | Yes | Candidate by ID |
| POST | `/api/hr/reports/generate` | Yes | Generate report |
| GET | `/api/hr/reports/:jobId` | Yes | Get report for job |

---

## Applications & scoring

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/applications/parse-email` | No | Parse email applications |
| POST | `/applications/score` | No | Score application |
| POST | `/inbound/applications/:jobId` | No | Inbound application webhook |

---

## Reports (system / cron)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/system/reports/generate` | Yes | Generate report |
| GET | `/api/system/reports/:jobId` | Yes | Get report |
| POST | `/api/system/reports/auto-generate` | Yes | Auto-generate (cron) |

---

## Schedule & interviews

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/schedule-interview` | Yes | Schedule interview |
| GET | `/api/interviews` | Yes | List scheduled interviews |

---

## Contact & analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/contact` | No | Contact form submit |
| POST | `/api/analytics/track` | No | Track analytics event |

---

## Resend (email API)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/resend/domains` | Yes | List domains |
| GET | `/api/resend/domains/:domain` | Yes | Domain details |
| GET | `/api/resend/verify` | Yes | Verify Resend config |

---

## Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/stats` | Admin | System stats |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/users/:userId` | Admin | User by ID |
| GET | `/api/admin/users/:userId/stats` | Admin | User stats |
| GET | `/api/admin/users/:userId/activity` | Admin | User activity |
| PATCH | `/api/admin/users/:userId` | Admin | Update user |
| DELETE | `/api/admin/users/:userId` | Admin | Delete user |
| GET | `/api/admin/companies` | Admin | All companies |
| GET | `/api/admin/companies/:companyId` | Admin | Company details |
| PATCH | `/api/admin/companies/:companyId` | Admin | Update company |
| DELETE | `/api/admin/companies/:companyId` | Admin | Delete company |
| GET | `/api/admin/job-postings` | Admin | All job postings |
| DELETE | `/api/admin/job-postings/:jobId` | Admin | Delete job posting |
| GET | `/api/admin/applications` | Admin | All applications |
| DELETE | `/api/admin/applications/:applicationId` | Admin | Delete application |
| GET | `/api/admin/users/pending` | Admin | Pending signups |
| POST | `/api/admin/users/:userId/approve` | Admin | Approve signup |
| POST | `/api/admin/users/:userId/reject` | Admin | Reject signup |
| POST | `/api/admin/users/bulk-approve` | Admin | Bulk approve |
| POST | `/api/admin/users/bulk-reject` | Admin | Bulk reject |
| GET | `/api/admin/emails` | Admin | Email logs |
| GET | `/api/admin/emails/stats` | Admin | Email stats |
| POST | `/api/admin/emails/:emailId/resend` | Admin | Resend email |
| GET | `/api/admin/settings` | Admin | System settings |
| PATCH | `/api/admin/settings/:settingKey` | Admin | Update setting |
| GET | `/api/admin/settings/feature-flags` | Admin | Feature flags |
| PATCH | `/api/admin/settings/feature-flags/:flagKey` | Admin | Update flag |
| GET | `/api/admin/activity` | Admin | Activity logs |
| GET | `/api/admin/activity/:userId` | Admin | User activity |
| GET | `/api/admin/performance` | Admin | Performance metrics |
| GET | `/api/admin/workflows` | Admin | Workflows |
| PATCH | `/api/admin/workflows/:workflowId` | Admin | Update workflow |
| GET | `/api/admin/analytics/enhanced` | Admin | Enhanced analytics |
| GET | `/api/admin/analytics/timeseries` | Admin | Time series analytics |
| GET | `/api/admin/debug/query-logs` | Admin | Query logs |
| GET | `/api/admin/debug/diagnostics` | Admin | Diagnostics |
| GET | `/api/admin/debug/errors` | Admin | Error logs |
| GET | `/api/admin/debug/test-db` | Admin | Test DB |
| GET | `/api/admin/debug/test-redis` | Admin | Test Redis |
| POST | `/api/admin/debug/clear-cache` | Admin | Clear cache |

---

*Auth: Yes = requires `Authorization: Bearer <token>`; Admin = admin role.*
