# OptioHire — Watcher Engine Platform

> **AI-powered hiring management for HR professionals.**  
> Post a role. The Watcher Engine does the rest.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey)](LICENSE)

---

## Table of Contents

- [What is OptioHire?](#what-is-optiohire)
- [The Watcher Engine](#the-watcher-engine)
- [Application Channels](#application-channels)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Services](#running-the-services)
- [API Reference](#api-reference)
- [Email Ingestion](#email-ingestion)
- [Architecture Overview](#architecture-overview)
- [Deployment](#deployment)
- [Phase 2 Roadmap](#phase-2-roadmap)

---

## What is OptioHire?

OptioHire is a **B2B HR-technology SaaS platform** built for hiring managers and HR professionals across Kenya and East Africa. It transforms hiring by eliminating manual CV screening entirely.

HR teams post a role. Candidates apply — via the platform, a shareable link, or a direct email. The **Watcher Engine** automatically extracts structured candidate profiles using AI, scores every applicant against the job requirements, and delivers a ranked, explainable shortlist to the HR's inbox and dashboard — all without the HR needing to read a single CV manually.

**The core problem it solves:**

| Before OptioHire | With OptioHire |
|---|---|
| 200–400 CVs per role to read manually | Zero manual CV reading |
| 3–5 days to produce a shortlist | Shortlist ready in under 5 minutes |
| Inconsistent scoring across team members | Every candidate scored identically by AI |
| No audit trail for rejected candidates | Full decision transparency per candidate |
| No passive application processing | Applications processed 24/7, even offline |

---

## The Watcher Engine

The Watcher Engine is the intelligent core of OptioHire. It is a standalone **Node.js worker process** backed by a **Redis + BullMQ** queue that runs continuously and processes applications the moment they arrive.

Every application — regardless of which channel it came from — passes through three sequential jobs:

### Job 1 — Extract Applicant
Reads the uploaded CV from cloud storage, extracts raw text from PDF/DOCX files, and sends it to an LLM (GPT-4 primary, Groq fallback). The AI returns a fully structured candidate profile:

- Full name, email, phone, location
- Skills with proficiency levels
- Work history with dates and descriptions
- Education history
- Years of experience
- A **confidence score** (0–1) for the extraction

A **1536-dimensional vector embedding** of the full resume text is generated and stored in PostgreSQL via `pgvector`. If extraction confidence falls below `0.7`, the candidate is flagged as `requires_review` for manual audit.

### Job 2 — Match to Job
Runs a two-stage scoring process against the open role:

**Stage 1 — Rule-based checks:**
- Required skills present / missing
- Years of experience vs requirement
- Education level satisfied

**Stage 2 — Semantic similarity:**
- Cosine similarity between the candidate's resume embedding and the job description embedding
- Captures relevance beyond keyword matching

Both stages combine into a **final match score (0–1)**. A plain-English **match reason** is generated explaining exactly why the candidate scored the way they did. Candidates meeting or exceeding the job's shortlisting threshold (default `0.75`) are flagged `shortlisted`; all others go to the **Talent Pool** as `pool_available`.

### Job 3 — Notify HR
When the shortlisted candidate count for a job reaches the configured notification threshold (default: 5), a rich HTML email is sent to the HR containing:

- Candidate names, match scores, key matched skills, and years of experience
- A direct link to their dashboard shortlist view

Any candidate scoring above `0.90` triggers an **immediate** HR notification regardless of threshold.

### Nightly Reconciliation — 2:00 AM EAT
A cron job runs every night to:
- Re-process any applications that failed due to transient errors
- Re-score candidates if a job's requirements were updated
- Scan the Talent Pool against all jobs posted in the last 24 hours
- Notify relevant HRs of Talent Pool matches

---

## Application Channels

OptioHire accepts applications through three distinct channels. All three produce identical records in the database — the Watcher Engine pipeline is channel-agnostic.

### Channel A — Web Form (Platform)
Candidate discovers a role on [optiohire.com](https://optiohire.com), fills in the application form, uploads their CV, and submits. A confirmation email is sent immediately.

### Channel B — Shareable Job Link
Each job posting generates a unique shareable URL:
```
https://optiohire.com/apply/{job-id}?ref=share
```
HRs share this link anywhere — LinkedIn, WhatsApp, Twitter, email. Candidates land directly on the pre-loaded apply form.

### Channel C — Inbound Email
HRs share the following instruction with their networks:

> Send your CV and cover letter to **jobs@optiohire.com**  
> Subject line: `[Job Title] — [Company Name]`

| Email Field | Required Format |
|---|---|
| **To** | `jobs@optiohire.com` |
| **Subject** | `Senior Backend Engineer — Cres Dynamics` |
| **Body** | Candidate introduction / cover letter |
| **Attachments** | CV (PDF or DOCX, required) + Cover Letter (optional) |

Resend receives the email and fires a webhook to `/api/webhooks/email`. The backend fuzzy-matches the subject line to an open job, creates an application record, stores attachments in cloud storage, and enqueues the application. Emails that cannot be matched are flagged for admin review — HRs are never exposed to unprocessed mail.

An **IMAP polling fallback** runs every 5 minutes to catch any emails missed by the webhook.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14, React, TailwindCSS | Public interface & HR dashboard (SSR) |
| Backend API | Node.js 18+, Express | REST API, file handling, email ingestion |
| Watcher Engine | Node.js Worker, BullMQ | AI extraction, scoring, notification pipeline |
| Database | PostgreSQL 14+ with pgvector | Application data + vector embeddings |
| Queue | Redis + BullMQ | Persistent, event-driven job queue |
| File Storage | AWS S3 / MinIO (dev) | CV and document storage |
| AI / LLM | OpenAI GPT-4 + Groq (fallback) | Resume extraction & embedding generation |
| Email | Resend | Inbound webhook + transactional sending |
| Deployment | Docker Compose (dev) / Kubernetes (prod) | Service orchestration |

---

## Project Structure

```
optiohire/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic (jobs, applications, email)
│   │   ├── middleware/        # Auth, multi-tenancy, rate limiting
│   │   ├── db/               # Migrations and query helpers
│   │   └── app.ts            # Express entry point
│   └── .env                  # Backend environment variables
│
├── frontend/                 # Next.js 14 app
│   ├── app/                  # App router pages
│   │   ├── (public)/         # Homepage, jobs listing, apply form
│   │   └── dashboard/        # HR portal (protected)
│   ├── components/           # Shared UI component library
│   └── .env.local            # Frontend environment variables
│
├── watcher/                  # Watcher Engine worker
│   ├── src/
│   │   ├── workers/
│   │   │   ├── extractApplicant.ts    # Job 1 — AI extraction
│   │   │   ├── matchJob.ts            # Job 2 — Scoring & shortlisting
│   │   │   └── notifyHR.ts            # Job 3 — HR notification
│   │   ├── services/
│   │   │   ├── llm.ts                 # GPT-4 + Groq integration
│   │   │   ├── embeddings.ts          # OpenAI vector embeddings
│   │   │   └── fileExtractor.ts       # PDF/DOCX text extraction
│   │   └── cron/
│   │       └── nightly.ts             # 2 AM EAT reconciliation job
│   └── Dockerfile
│
├── docker-compose.yml        # Local dev orchestration
├── .env.example              # All required variables documented
└── README.md
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose)
- [Node.js 18+](https://nodejs.org) and `npm`
- An [OpenAI API key](https://platform.openai.com/api-keys) (GPT-4 + embeddings)
- A [Groq API key](https://console.groq.com) (LLM fallback)
- A [Resend account](https://resend.com) with `jobs@optiohire.com` configured for inbound

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/optiohire.git
cd optiohire
```

### 2. Configure environment variables

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Then open each file and fill in the values listed in the [Environment Variables](#environment-variables) section below. At minimum, you need the database, Redis, and OpenAI keys to run the Watcher Engine locally.

### 3. Boot all services

```bash
docker compose up --build
```

This starts: PostgreSQL, Redis, MinIO (S3-compatible), the backend API, the Watcher Engine worker, and the Next.js frontend.

### 4. Run database migrations

```bash
docker compose exec backend npm run db:migrate
```

This creates all tables and enables the `pgvector` extension for embedding storage.

### 5. Open the app

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| MinIO Console | http://localhost:9001 |
| BullMQ Dashboard | http://localhost:3001/admin/queues |

---

## Environment Variables

All variables are documented in `.env.example`. The tables below summarise what is needed and why.

### Backend (`backend/.env`)

#### Database & Cache
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `DB_SSL` | ✅ | Enable SSL for DB connection (`true` / `false`) |
| `REDIS_ENABLED` | ✅ | Toggle Redis caching |
| `REDIS_URL` | ✅ | Redis connection string |

#### Security & Auth
| Variable | Required | Description |
|---|---|---|
| `PORT` | ✅ | API port (default: `3001`) |
| `NODE_ENV` | ⚠️ | Must be `production` on live server |
| `JWT_SECRET` | ⚠️ | Strong random secret — encrypts all API tokens |
| `ADMIN_PASSWORD` | ✅ | Admin dashboard access password |
| `CRON_SECRET` | ⚠️ | Secures background cron endpoint |

#### Connections
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | ⚠️ | Must point to live API URL (not localhost) in production |
| `NEXT_PUBLIC_APP_URL` | ✅ | Live domain (`https://optiohire.com`) |

#### Email
| Variable | Required | Description |
|---|---|---|
| `USE_RESEND` | ✅ | Toggle Resend email API |
| `RESEND_API_KEY` | ⚠️ | Resend API key — required for all outbound email |
| `IMAP_USER` / `IMAP_PASS` | ✅ | Inbox credentials for IMAP polling fallback |
| `SMTP_USER` / `SMTP_PASS` | ✅ | Fallback SMTP credentials |

#### AI
| Variable | Required | Description |
|---|---|---|
| `AI_PROVIDER` | ✅ | Active AI model (e.g. `groq`) |
| `GROQ_API_KEY` | ⚠️ | Groq API key — required for resume parsing |
| `GEMINI_API_KEY` | ⚠️ | Fallback AI key |
| `AI_CV_ANALYSIS_ENABLED` | ✅ | Toggle AI resume analysis |

#### Integrations & Storage
| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth — Sign In With Google |
| `LINKEDIN_*` / `INDEED_*` | ❌ | Job board credentials (Phase 2) |
| `N8N_WEBHOOK_URL` | ❌ | Automation/Slack alerts (optional) |
| `FILE_STORAGE_DIR` | ✅ | Local CV storage path (`./storage`) |
| `S3_ACCESS_KEY` / `S3_BUCKET` | ❌ | External cloud storage (production recommended) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | ⚠️ | Must be `https://optiohire.com` in production |
| `NEXTAUTH_URL` | ⚠️ | Must be `https://optiohire.com` in production |
| `NEXTAUTH_SECRET` | ⚠️ | Strong random secret — encrypts session cookies |
| `JWT_SECRET` | ⚠️ | Must exactly match the backend `JWT_SECRET` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ | Google SSO public client ID |

> ⚠️ **Before going to production:** change all `localhost` URLs, replace dummy API keys with real ones, and generate strong unique values for `JWT_SECRET`, `NEXTAUTH_SECRET`, and `CRON_SECRET`.

---

## Running the Services

### Start everything (recommended)
```bash
docker compose up
```

### Run services individually
```bash
# Backend API only
cd backend && npm run dev

# Watcher Engine only
cd watcher && npm run dev

# Frontend only
cd frontend && npm run dev
```

### Useful commands
```bash
# Run database migrations
docker compose exec backend npm run db:migrate

# Roll back last migration
docker compose exec backend npm run db:rollback

# View Watcher Engine logs
docker compose logs -f watcher

# Flush the job queue (dev only)
docker compose exec backend npm run queue:flush

# Run the full test suite
npm run test --workspaces

# Trigger a manual Talent Pool scan
docker compose exec watcher npm run cron:talent-pool
```

---

## API Reference

Base URL: `https://optiohire.com/api` (production) or `http://localhost:3001/api` (local)

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register HR account with company |
| `POST` | `/auth/signin` | Login and receive JWT |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/reset-password` | Trigger password reset email |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/jobs` | Public paginated job listing |
| `GET` | `/jobs/:id` | Job detail (public) |
| `POST` | `/job-postings` | Create new job posting (HR) |
| `PATCH` | `/job-postings/:id` | Update job (HR) |
| `GET` | `/job-postings/:id/stats` | Applications, shortlisted count, avg score |

### Applications
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/applications/apply/:jobId` | Submit application (web form) |
| `GET` | `/jobs/:id/shortlist` | Get ranked shortlist for a job (HR) |
| `PATCH` | `/applications/:id` | Update application status (HR) |

### HR & Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hr/:applicationId/status` | Get application status |
| `PATCH` | `/hr/:applicationId/status` | Update status (`SHORTLISTED`, `REJECTED`, etc.) |
| `POST` | `/schedule` | Schedule interview for candidate |
| `GET` | `/admin/candidate-decisions` | All decisions (admin only) |

### Webhooks
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/webhooks/email` | Resend inbound email webhook |

---

## Email Ingestion

OptioHire processes inbound candidate emails automatically. Here is the complete flow:

```
Candidate sends email
        ↓
jobs@optiohire.com  (Resend inbound)
        ↓
Resend fires POST to /api/webhooks/email
        ↓
Backend verifies Resend webhook signature
        ↓
Parses subject line: "Senior Engineer — Cres Dynamics"
        ↓
Fuzzy-matches to open job in database
        ↓
Creates Application record (source: EMAIL)
        ↓
Uploads CV attachment to S3/MinIO
        ↓
Enqueues 'extract-applicant' job in BullMQ
        ↓
Watcher Engine processes identically to a web form submission
```

**IMAP fallback:** If the Resend webhook is unavailable, a cron job polls `jobs@optiohire.com` via IMAP every 5 minutes and processes all unread emails. Emails that cannot be matched to an open role are flagged for admin review and never silently dropped.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — PUBLIC INTERFACE                                     │
│  Homepage · All Jobs · Job Detail · Apply Form                  │
│  Channels: (A) Platform  (B) Shareable Link  (C) Email         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  LAYER 2 — APPLICATION PIPELINE                                 │
│  Web Form → Validate → S3 Upload → DB Record → Queue           │
│  Inbound Email → Resend Webhook → Parse → Match → Queue        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│  LAYER 3 — WATCHER ENGINE  (BullMQ Worker)                      │
│  Job 1: Extract  →  GPT-4 → Structured Profile + Embedding     │
│  Job 2: Match    →  Rules + Cosine Similarity → Score + Reason │
│  Job 3: Notify   →  Shortlist Email → HR Inbox                 │
│  Cron:  2 AM EAT →  Reconcile + Talent Pool Scan               │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
┌──────────────▼──────────┐  ┌────────────▼────────────────────── ┐
│  LAYER 4 — REPOSITORY   │  │  TALENT POOL                       │
│  shortlisted candidates │  │  pool_available candidates         │
│  Ranked by match score  │  │  Re-matched on every new job post  │
└──────────────┬──────────┘  └───────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│  LAYER 5 — HR DASHBOARD                                         │
│  Shortlist View · AI Transparency · Interview Scheduling        │
│  Candidate Cards · Score % · Match Reason · Action Buttons     │
└─────────────────────────────────────────────────────────────────┘
```

### Candidate Status Lifecycle

```
submitted → [Watcher processes] → shortlisted ──→ interview_scheduled ──→ hired
                                ↘ pool_available ──→ re-matched on new job
                                ↘ requires_review ──→ manual HR/admin audit
```

---

## Deployment

### Docker Compose (Production)

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d

# Run migrations on fresh instance
docker compose exec backend npm run db:migrate

# Verify all services are healthy
docker compose ps
```

### Production Checklist

Before going live, verify all of the following:

- [ ] `NODE_ENV=production` set in backend
- [ ] All `localhost` URLs replaced with `https://optiohire.com`
- [ ] `JWT_SECRET`, `NEXTAUTH_SECRET`, and `CRON_SECRET` set to strong unique values
- [ ] `RESEND_API_KEY` is a real production key (not a test key)
- [ ] `GROQ_API_KEY` values are real production keys
- [ ] Resend inbound webhook registered at `/api/webhooks/email`
- [ ] Resend webhook signature verification enabled
- [ ] SSL/TLS active on `optiohire.com`
- [ ] DNS MX records configured for `jobs@optiohire.com`
- [ ] S3 bucket created with correct IAM permissions
- [ ] `app.set('trust proxy', 1)` set in `app.ts` (required for rate limiting behind proxy)
- [ ] CI/CD pipeline (GitHub Actions) passing: test → build → push → deploy

### CI/CD

The GitHub Actions pipeline (`.github/workflows/deploy.yml`) runs on every push to `main`:

1. Run full test suite
2. Build Docker images
3. Push to container registry
4. Deploy to DigitalOcean VPS

---

## Phase 2 Roadmap

**Short-Term (1–2 months)**
- Video interview recording and playback
- Advanced analytics dashboard (funnel, source performance, time-to-hire)
- Bulk candidate import via CSV
- LinkedIn and Indeed ATS integrations

**Medium-Term (3–6 months)**
- White-labelled job portals with custom domains per company
- SSO integrations (SAML, OIDC)
- ML-driven recommendations learning from HR shortlist feedback
- Multi-HR permission model with approval workflows

**Long-Term (6–12 months)**
- Full HRMS suite: onboarding and performance management
- Candidate-facing portal with application status tracking
- Skill-based talent marketplace
- Regional expansion: multi-currency and multi-language support

---

## Estimated Running Costs

| Service | Purpose | Monthly |
|---|---|---|
| DigitalOcean VPS (4GB RAM) | Hosts all services | $24.00 |
| Resend (50k emails/mo) | Transactional email | $20.00 |
| Domain (optiohire.com) | DNS + registration | ~$1.25 |
| **Total** | | **~$45.25 / month** |

All other services (PostgreSQL, Redis, File Storage, N8N) are self-hosted on the VPS within the base cost. Groq AI is free-tier with pay-as-you-go at roughly < $5/month at scale.

---

## Contributing

This is a proprietary internal codebase. For access and onboarding, contact the engineering lead.

---

## License

Proprietary — Internal Use Only. © OptioHire 2026.

---

*Platform: [optiohire.com](https://optiohire.com) · Inbound Email: jobs@optiohire.com · Version 2.0 · May 2026*
