# OptiOHire Platform – Complete Implementation Outline
## 5-Day Build Plan | Senior Product Engineering Specification

**Document Version:** 1.0  
**Target Delivery:** Thursday, May 29, 2026 (5 days from May 24, 2026)  
**Status:** Ready for Dev Audit  
**Prepared for:** Development Team & Stakeholders

---

## EXECUTIVE SUMMARY

OptiOHire is transitioning from a generic hiring platform to an **HR-centric, customizable job management and candidate matching system**. The core innovation is the **Watcher Engine** — an intelligent background system that automatically ingests applications (email or form), extracts structured candidate profiles using AI, matches candidates against job requirements, and notifies HRs with curated shortlists.

**Key Business Outcomes:**
- HR users can create jobs, share links, and passively receive qualified candidates.
- Candidates can apply via web form or email (no separate form required).
- AI-powered matching ensures HRs see only top-fit candidates.
- Full customization per company — white-labeled job portals.

**In-Scope Deliverables (5 days):**
1. Job creation, listing, and detail pages (frontend).
2. Application submission with file uploads (frontend + backend).
3. Shareable job links and email delivery (backend).
4. Email/webhook ingestion and applicant extraction (Watcher engine).
5. AI-powered candidate matching and scoring.
6. Admin shortlist UI and notification pipeline.
7. Deployment-ready stack (Docker Compose, scripts, docs).

**Out-of-Scope (Post-Launch):**
- Interview scheduling & video integration.
- Full HRMS feature set (payroll, onboarding, performance).
- Advanced analytics and reporting dashboard (Phase 2).
- Multi-language support.
- Advanced SSO integrations (SAML, OIDC).

---

## 1. SYSTEM ARCHITECTURE

### 1.1 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        OPTIOHIRE PLATFORM                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     EXTERNAL ACTORS                              │
├──────────────────────────────────────────────────────────────────┤
│  [Candidates] → Web Form / Email    [HR Users] → Web UI          │
│                        ↓                            ↓             │
│                   Inbound Emails            Job Management       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
├──────────────────────────────────────────────────────────────────┤
│  [Homepage]        [Jobs Listing]      [Job Detail]             │
│  - Job cards       - Search/filter     - Description            │
│  - "See all jobs"  - Pagination        - Requirements           │
│                                        - "Apply" button          │
│                                                                  │
│  [Apply Form]      [HR Dashboard]      [Admin Shortlist]       │
│  - File uploads    - Create job        - Candidate list         │
│  - Success msg     - View analytics    - Match scores           │
│  - Prefill (link)  - Share job link    - Interview flow         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   API GATEWAY / BACKEND (Node.js)                │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  REST API Endpoints                                        │ │
│  │  - /api/jobs (GET/POST)                                    │ │
│  │  - /api/jobs/:id (GET/PATCH)                               │ │
│  │  - /api/jobs/:id/apply (GET/POST)                          │ │
│  │  - /api/applications (GET/POST)                            │ │
│  │  - /api/webhooks/email (POST) [inbound]                    │ │
│  │  - /api/admin/shortlists (GET)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Core Services                                             │ │
│  │  - Job service         - Auth service                      │ │
│  │  - Application service - File upload service               │ │
│  │  - Email service       - Notification service              │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   WATCHER ENGINE (Node.js Worker)                │
├──────────────────────────────────────────────────────────────────┤
│  [Inbound Webhook Listener]     [IMAP Poller (fallback)]        │
│           ↓                              ↓                       │
│  [Email/App Receiver]  →  [Task Queue (Redis + BullMQ)]        │
│                                         ↓                        │
│              [Extract Applicant Job]                             │
│              - Parse attachments (PDF/DOCX)                      │
│              - Call AI extractor (LLM)                           │
│              - Generate embeddings                               │
│              - Store applicant profile                           │
│                                         ↓                        │
│              [Match Job Job]                                     │
│              - Rule-based checks (skills, experience)            │
│              - Embedding similarity (job description vs resume)  │
│              - Compute final score                               │
│              - Flag for shortlist                                │
│                                         ↓                        │
│              [Notify HR Job]                                     │
│              - Aggregate candidates (when threshold or N reached)│
│              - Generate summary email                            │
│              - Send via email provider                           │
│              - Track engagement (link clicks)                    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│              DATA LAYER & EXTERNAL INTEGRATIONS                  │
├──────────────────────────────────────────────────────────────────┤
│  [PostgreSQL]  [Redis/BullMQ]  [S3 / MinIO]   [Email Provider]  │
│  - Core DB     - Job queue      - Resumes      - Transactional  │
│  - Users       - Rate limiting  - Documents    - Inbound (webhook)
│  - Jobs        - Caching        - Attachments  - (Resend/SendGrid)
│  - Applications                                                  │
│  - Candidates                   [LLM Services]                  │
│  - Documents                    - OpenAI GPT   [Vector Store]   │
│  - Matches                       - Groq (ALT)  - Embeddings     │
│                                                                  │
│  [Monitoring & Logs]                                            │
│  - Winston / Pino (structured logging)                          │
│  - Sentry (error tracking)                                      │
│  - Prometheus metrics (TBD Phase 2)                             │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer              | Technology                   | Rationale                                    |
|--------------------|------------------------------|----------------------------------------------|
| **Frontend**       | Next.js 14, React, TailwindCSS | Existing stack; SSR; fast iteration         |
| **Backend API**    | Node.js 18+, Express/Fastify | Lightweight; existing ecosystem              |
| **Database**       | PostgreSQL 14+               | ACID, JSON support, strong typing            |
| **Cache / Queue**  | Redis + BullMQ               | Horizontal scaling; job persistence          |
| **File Storage**   | AWS S3 or MinIO              | Scalable; multi-file support; CDN-ready      |
| **Watcher Engine** | Node.js worker (Docker)      | Consistent with backend; event-driven        |
| **AI / LLM**       | OpenAI GPT-4 (primary) + Groq | Reliability + cost optimization             |
| **Email**          | Resend / SendGrid / Postmark | Webhooks; deliverability; templates          |
| **Logging**        | Winston / Pino + Sentry      | Structured logs; production error tracking   |
| **Testing**        | Jest, Supertest (API)        | Fast; familiar to team; good coverage        |
| **Deployment**     | Docker Compose, GitHub Actions | Dev → production consistency                |

### 1.3 Deployment & Infra Architecture

```
Development:
  - Docker Compose (local): frontend, backend, watcher, postgres, redis, minio

Staging / Production:
  - Kubernetes (EKS/GKE/AKS) OR Docker Swarm OR Managed services (Vercel + Railway/Render)
  - Separate services: frontend (CDN), backend API (autoscaling), watcher workers (queue-driven)
  - Database: RDS PostgreSQL (managed)
  - Cache: ElastiCache Redis (managed)
  - Storage: S3 (AWS) or equivalent
  - Email: Resend inbound webhooks + transactional API
  - Secrets: AWS Secrets Manager / Azure Key Vault / GitHub Secrets
  - Monitoring: CloudWatch / Datadog / New Relic (Phase 2)
```

---

## 2. DATA MODEL & DATABASE SCHEMA

### 2.1 Entity-Relationship Diagram (Logical)

```
┌─────────────────┐         ┌─────────────────┐
│     USERS       │         │   COMPANIES     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │────┐    │ id (PK)         │
│ email (UNIQUE)  │    │    │ name            │
│ password_hash   │    │    │ industry        │
│ role            │    │    │ logo_url        │
│ created_at      │    │    │ created_at      │
└─────────────────┘    │    └─────────────────┘
                       │           ↑
                       │           │ (company_id)
                       └───────────┤
                                   │
┌─────────────────┐         ┌─────────────────┐
│      JOBS       │         │  APPLICATIONS   │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────┐   │ id (PK)         │
│ company_id (FK) │    │   │ job_id (FK)     │
│ title           │    │   │ applicant_id(FK)│
│ description     │    │   │ source          │
│ requirements    │    │   │ status          │
│ location        │    │   │ created_at      │
│ salary_range    │    │   │ updated_at      │
│ public_url      │    │   └─────────────────┘
│ status          │    │
│ created_by      │    │   ┌─────────────────┐
│ created_at      │    │   │  APPLICANTS     │
└─────────────────┘    │   ├─────────────────┤
                       │   │ id (PK)         │
                       │   │ name            │
                       │   │ email           │
                       │   │ phone           │
                       │   │ summary         │
                       │   │ experience_yrs  │
                       │   │ skills (JSON)   │
                       │   │ embedding (vec) │
                       │   │ score (float)   │
                       │   │ extracted_data  │
                       │   │ created_at      │
                       │   └─────────────────┘
                       │
┌─────────────────┐    │   ┌─────────────────┐
│   DOCUMENTS     │────┘   │     MATCHES     │
├─────────────────┤        ├─────────────────┤
│ id (PK)         │        │ id (PK)         │
│ applicant_id(FK)│        │ application_id  │
│ application_id  │        │ job_id (FK)     │
│ url (S3)        │        │ score (float)   │
│ type (resume)   │        │ rule_checks(JSON)
│ file_hash       │        │ reason (text)   │
│ uploaded_at     │        │ created_at      │
└─────────────────┘        └─────────────────┘
```

### 2.2 Core Database Tables (Schema DDL)

#### 2.2.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role ENUM('admin', 'hr', 'recruiter', 'candidate') DEFAULT 'hr',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_token_expires_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
```

#### 2.2.2 Companies Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50), -- 'startup', '10-50', '50-200', etc.
  logo_url VARCHAR(500),
  primary_color VARCHAR(7), -- for white-labeling
  secondary_color VARCHAR(7),
  custom_domain VARCHAR(255) UNIQUE, -- for white-labeled portals
  config JSONB DEFAULT '{}', -- customization options
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_custom_domain ON companies(custom_domain);
```

#### 2.2.3 Jobs Table
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB, -- {skills: [...], min_experience_years: N, education: [...]}
  location VARCHAR(255),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  job_type ENUM('full-time', 'part-time', 'contract', 'temp') DEFAULT 'full-time',
  public_url VARCHAR(500) UNIQUE DEFAULT (gen_random_uuid()), -- shareable slug
  status ENUM('draft', 'published', 'closed', 'archived') DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES users(id),
  shortlisting_threshold FLOAT DEFAULT 0.75, -- AI score threshold
  max_shortlist_count INT DEFAULT 10, -- notify after N candidates
  notify_count INT DEFAULT 0, -- running counter
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_public_url ON jobs(public_url);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
```

#### 2.2.4 Applications Table
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  source ENUM('web-form', 'email', 'direct-link', 'referral') DEFAULT 'web-form',
  source_email VARCHAR(255), -- if from email, raw sender address
  status ENUM('submitted', 'shortlisted', 'rejected', 'scheduled', 'hired') DEFAULT 'submitted',
  notes TEXT,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_source ON applications(source);
CREATE INDEX idx_applications_status ON applications(status);
```

#### 2.2.5 Applicants Table
```sql
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  summary TEXT, -- short bio or parsed from resume
  experience_years INT DEFAULT 0,
  skills JSONB DEFAULT '[]', -- [{skill: 'Python', level: 'expert'}, ...]
  education JSONB DEFAULT '[]', -- [{degree: 'BS', field: 'CS', school: '...', year: 2020}, ...]
  location VARCHAR(255),
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  -- AI Extraction & Matching Fields
  extracted_data JSONB, -- full parsed data from resume/email
  embedding VECTOR(1536), -- OpenAI embedding of resume/profile
  profile_score FLOAT DEFAULT 0.0, -- aggregated match score
  ai_confidence FLOAT DEFAULT 0.0, -- confidence in extraction
  requires_review BOOLEAN DEFAULT false, -- flag low-confidence extractions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_name ON applicants(name);
CREATE INDEX idx_applicants_skills ON applicants USING gin(skills);
-- Note: embedding index typically handled by pgvector extension
```

#### 2.2.6 Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  document_type ENUM('resume', 'cover_letter', 'transcript', 'portfolio', 'other') DEFAULT 'resume',
  original_filename VARCHAR(255),
  s3_key VARCHAR(500) NOT NULL UNIQUE, -- path in bucket
  s3_url VARCHAR(1000), -- public or signed URL
  file_size_bytes INT,
  file_hash VARCHAR(64), -- SHA-256 for dedup
  mime_type VARCHAR(100),
  extracted_text TEXT, -- OCR / text extraction output
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- for sensitive data retention policy
  deleted_at TIMESTAMP
);

CREATE INDEX idx_documents_applicant_id ON documents(applicant_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_s3_key ON documents(s3_key);
```

#### 2.2.7 Matches Table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  score FLOAT NOT NULL, -- 0-1, final match score
  rule_checks JSONB, -- {required_skills_met: bool, min_exp_met: bool, ...}
  matching_reason TEXT, -- human-readable summary
  embedding_similarity FLOAT, -- cosine sim between job & resume embeddings
  is_shortlisted BOOLEAN DEFAULT false,
  shortlist_reason VARCHAR(255), -- why flagged for shortlist
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_application_id ON matches(application_id);
CREATE INDEX idx_matches_job_id ON matches(job_id);
CREATE INDEX idx_matches_score ON matches(score DESC);
CREATE INDEX idx_matches_shortlisted ON matches(is_shortlisted);
```

#### 2.2.8 Email Events Table (for audit & engagement tracking)
```sql
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  application_id UUID REFERENCES applications(id),
  recipient_email VARCHAR(255) NOT NULL,
  email_type ENUM('application-confirmation', 'shortlist-notification', 'reject', 'offer') DEFAULT 'application-confirmation',
  subject VARCHAR(255),
  status ENUM('sent', 'failed', 'opened', 'clicked', 'bounced') DEFAULT 'sent',
  metadata JSONB, -- tracking pixels, link clicks, etc.
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP
);

CREATE INDEX idx_email_events_recipient ON email_events(recipient_email);
CREATE INDEX idx_email_events_job_id ON email_events(job_id);
```

### 2.3 Migrations Strategy

**Migration Tool:** Knex.js or TypeORM with strict migration tracking.

**Migration Files (examples):**
```
migrations/
  ├── 001_create_companies_table.ts
  ├── 002_create_users_table.ts
  ├── 003_create_jobs_table.ts
  ├── 004_create_applicants_table.ts
  ├── 005_create_applications_table.ts
  ├── 006_create_documents_table.ts
  ├── 007_create_matches_table.ts
  ├── 008_create_email_events_table.ts
  ├── 009_add_embeddings_support.ts (pgvector)
  └── 010_add_indices_and_constraints.ts
```

**Rollout:**
- Dev environment: auto-run on startup.
- Staging / Prod: run before deployment, with approval gate.
- Backup strategy: pre-migration snapshot of primary DB.

---

## 3. API SPECIFICATION

### 3.1 Authentication & Authorization

**Scheme:** JWT (access + refresh tokens)

```
POST /api/auth/register
  - Body: { email, password, company_name, first_name, last_name }
  - Response: { user: {...}, access_token, refresh_token }

POST /api/auth/login
  - Body: { email, password }
  - Response: { access_token, refresh_token, user: {...} }

POST /api/auth/refresh
  - Body: { refresh_token }
  - Response: { access_token, refresh_token }

POST /api/auth/logout
  - Header: Authorization: Bearer <token>
  - Response: { success: true }

POST /api/auth/verify-email
  - Body: { verification_token }
  - Response: { success: true, message: "Email verified" }

POST /api/auth/request-password-reset
  - Body: { email }
  - Response: { success: true, message: "Reset link sent" }

POST /api/auth/reset-password
  - Body: { token, new_password }
  - Response: { success: true }
```

**Middleware:**
- `authenticate()` — verify JWT, attach user to request.
- `authorize(role)` — check user role (admin, hr, recruiter, candidate).
- `companyScope()` — ensure user only accesses own company data (multi-tenancy).

### 3.2 Job Management Endpoints

#### 3.2.1 Get All Jobs (Public or by Company)
```
GET /api/jobs
Query Params:
  - company_id (optional, filter by company)
  - search (text search in title/description)
  - location (filter)
  - job_type (full-time, part-time, etc.)
  - salary_min, salary_max (range filter)
  - limit=20, offset=0 (pagination)

Response:
{
  data: [
    {
      id, title, description, location, salary_range,
      company: {id, name, logo_url},
      job_type, created_at, apply_url
    },
    ...
  ],
  total: 150,
  limit: 20,
  offset: 0
}
```

#### 3.2.2 Get Job Details
```
GET /api/jobs/:job_id

Response:
{
  id, title, description, requirements,
  location, salary_min, salary_max, currency,
  job_type, status,
  company: {id, name, logo_url, industry},
  created_by: {id, name, email},
  created_at, updated_at,
  apply_url: "/jobs/{job_id}/apply"
}
```

#### 3.2.3 Create Job (HR/Admin only)
```
POST /api/jobs
Auth: Required (role: hr, admin)

Body:
{
  title: "Senior Backend Engineer",
  description: "We are looking for...",
  requirements: {
    required_skills: ["Node.js", "PostgreSQL"],
    nice_to_have_skills: ["Docker", "Kubernetes"],
    min_experience_years: 3,
    education: ["Bachelor's in CS or equivalent"]
  },
  location: "Remote / New York, NY",
  salary_min: 100000,
  salary_max: 150000,
  currency: "USD",
  job_type: "full-time",
  status: "draft"
}

Response:
{
  id, title, description, ..., public_url: "https://app.optiohire.com/jobs/{uuid}",
  share_link: "https://optiohire.com/apply/{public_url}?ref=email"
}
```

#### 3.2.4 Update Job
```
PATCH /api/jobs/:job_id
Auth: Required (owner or admin)

Body: { title?, description?, status?, ... }

Response: { id, title, ..., updated_at }
```

#### 3.2.5 Publish Job (change status to published)
```
POST /api/jobs/:job_id/publish
Auth: Required (owner or admin)

Response: { success: true, message: "Job published" }
```

#### 3.2.6 Close Job
```
POST /api/jobs/:job_id/close
Auth: Required (owner or admin)

Response: { success: true, message: "Job closed" }
```

#### 3.2.7 Get Job Stats (for HR)
```
GET /api/jobs/:job_id/stats
Auth: Required (owner or admin)

Response:
{
  applications_count: 25,
  shortlisted_count: 8,
  rejected_count: 5,
  avg_match_score: 0.78,
  last_application: "2026-05-24T10:30:00Z"
}
```

### 3.3 Application & Apply Form Endpoints

#### 3.3.1 Get Apply Form (public, prefilled if link contains token)
```
GET /api/jobs/:job_id/apply?token={optional_token}&name={optional_name}&email={optional_email}

Response:
{
  job: { id, title, description, requirements },
  form_fields: [
    { field: "name", label: "Full Name", type: "text", required: true, prefilled: "John Doe" },
    { field: "email", label: "Email", type: "email", required: true, prefilled: "john@example.com" },
    { field: "phone", label: "Phone", type: "tel", required: true },
    { field: "resume", label: "Resume (PDF/DOCX)", type: "file", required: true },
    { field: "cover_letter", label: "Cover Letter", type: "file", required: false },
    { field: "portfolio_url", label: "Portfolio", type: "url", required: false },
    { field: "consent", label: "I agree to data processing", type: "checkbox", required: true }
  ]
}
```

#### 3.3.2 Submit Application (file upload + form data)
```
POST /api/jobs/:job_id/apply
Content-Type: multipart/form-data

Body:
{
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "+1-555-0123",
  summary: "Experienced frontend engineer...",
  resume: <File: resume.pdf>,
  cover_letter: <File: cover_letter.pdf> (optional),
  portfolio_url: "https://janedoe.dev",
  consent: true
}

Response:
{
  success: true,
  application: {
    id, job_id, applicant_id, status: "submitted", created_at
  },
  message: "Application received! We'll review and get back to you.",
  next_steps: "Check your email for confirmation and updates."
}

HTTP Status: 201 Created
```

#### 3.3.3 Get Application (for candidate or HR)
```
GET /api/applications/:application_id
Auth: Required (applicant, HR of job company, or admin)

Response:
{
  id, job_id, applicant_id, status, source, created_at,
  job: { id, title, company_id },
  applicant: { id, name, email, phone },
  documents: [ { id, type, url, uploaded_at }, ... ],
  match: { score, shortlisted, reason } (if available)
}
```

#### 3.3.4 List Applications (for HR)
```
GET /api/jobs/:job_id/applications
Auth: Required (HR of company or admin)

Query Params:
  - status (submitted, shortlisted, rejected, etc.)
  - sort_by (created_at, match_score)
  - limit=20, offset=0

Response:
{
  data: [
    {
      id, applicant_id, status, created_at,
      applicant: { id, name, email },
      match: { score, shortlisted }
    },
    ...
  ],
  total: 42
}
```

#### 3.3.5 Update Application Status (HR)
```
PATCH /api/applications/:application_id
Auth: Required (HR of company or admin)

Body: { status: "shortlisted" | "rejected" | "scheduled" | "hired" }

Response: { id, status, updated_at }
```

### 3.4 Inbound Email & Webhook Endpoints

#### 3.4.1 Email Webhook Receiver (from Resend / SendGrid)
```
POST /api/webhooks/email
Headers: X-Webhook-Signature: <signature> (for verification)

Body (multipart, email payload):
{
  from: "candidate@example.com",
  subject: "Application for Senior Backend Engineer",
  html: "<html>...</html>",
  text: "Plain text body",
  attachments: [
    {
      filename: "resume.pdf",
      content: <base64 or binary>,
      content_type: "application/pdf"
    },
    ...
  ],
  headers: { ... }
}

Internal Process:
1. Verify signature
2. Parse email (extract text, subject, sender)
3. Match email to job listing (via email headers, subject line, or manual config)
4. Create Application record with source: 'email'
5. Create temporary Applicant profile
6. Push to queue: { jobId, applicationId, source: 'email', rawEmail, attachments }
7. Return 200 OK

Response:
{
  success: true,
  message: "Email received and queued for processing",
  application_id: "uuid"
}
```

#### 3.4.2 Email Webhook Health Check
```
GET /api/webhooks/email/health

Response: { status: "ok", receiver: "resend" | "sendgrid", last_received: "2026-05-24T10:00:00Z" }
```

### 3.5 Admin & Shortlist Management Endpoints

#### 3.5.1 Get Shortlisted Candidates (for Job)
```
GET /api/jobs/:job_id/shortlist
Auth: Required (HR of company or admin)

Response:
{
  job: { id, title, company_id },
  shortlisted_candidates: [
    {
      match_id, application_id, applicant_id,
      applicant: { id, name, email, phone, summary },
      score: 0.89,
      shortlist_reason: "Strong backend skills, 5+ yrs exp",
      match_at: "2026-05-24T09:15:00Z"
    },
    ...
  ],
  total: 8
}
```

#### 3.5.2 Send Shortlist Notification Email (to HR)
```
POST /api/jobs/:job_id/notify-shortlist
Auth: Required (HR of company or admin)

Body:
{
  recipient_email: "hr@company.com",
  template: "shortlist_summary" (default)
}

Internal Process:
1. Retrieve shortlisted candidates for job.
2. Generate HTML email with candidate cards, scores, links.
3. Create secure token for "View All" link (time-limited access).
4. Send email via Resend.
5. Log email event.

Response:
{
  success: true,
  message: "Notification sent to hr@company.com",
  email_event_id: "uuid"
}
```

#### 3.5.3 Get Shortlist Notification History
```
GET /api/jobs/:job_id/notifications
Auth: Required (HR of company or admin)

Response:
{
  notifications: [
    {
      id, sent_to, sent_at, candidate_count,
      opened_at, clicked_at (if tracked)
    },
    ...
  ]
}
```

#### 3.5.4 Get Admin Dashboard (all jobs, applications, stats)
```
GET /api/admin/dashboard
Auth: Required (admin)

Response:
{
  total_jobs: 45,
  total_applications: 380,
  total_shortlisted: 65,
  avg_match_score: 0.72,
  jobs_by_status: { published: 30, draft: 10, closed: 5 },
  recent_applications: [ ... ],
  top_matches: [ ... ]
}
```

### 3.6 File Upload Endpoints

#### 3.6.1 Upload Document (direct upload, for applicants or internal use)
```
POST /api/documents/upload
Auth: Required (authenticated user)
Content-Type: multipart/form-data

Body:
{
  file: <File>,
  document_type: "resume" | "cover_letter" | "portfolio" | "other",
  applicant_id: (optional, admin use)
}

Response:
{
  id, s3_url, file_hash, uploaded_at,
  extracted_text: "..." (if OCR available)
}
```

#### 3.6.2 Delete Document
```
DELETE /api/documents/:document_id
Auth: Required (applicant owner or admin)

Response: { success: true, message: "Document deleted" }
```

### 3.7 Notification & Email Preference Endpoints

#### 3.7.1 Get Email Preferences (for user)
```
GET /api/preferences/email
Auth: Required

Response:
{
  shortlist_notifications: true,
  application_confirmations: true,
  job_recommendations: false,
  frequency: "immediate" | "daily_digest" | "weekly_digest"
}
```

#### 3.7.2 Update Email Preferences
```
PATCH /api/preferences/email
Auth: Required

Body: { shortlist_notifications, application_confirmations, ... }

Response: { success: true, updated_preferences: {...} }
```

### 3.8 Error Responses (Standard)

All endpoints follow consistent error format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION_ERROR" | "RATE_LIMIT_EXCEEDED",
    "message": "Human-readable message",
    "details": { field: "error description" } // for validation errors
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request (validation)
- 401: Unauthorized (auth missing)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate email, etc.)
- 429: Rate Limited
- 500: Internal Server Error
- 503: Service Unavailable

---

## 4. FRONTEND ARCHITECTURE & PAGES

### 4.1 Page/Route Structure

```
Frontend (Next.js 14):

Root Layout:
  ├── Global nav, theme, auth state
  └── Toast / notification provider

PUBLIC ROUTES (no auth required):
  ├── /
  │  └── [Homepage]
  │      - Featured jobs carousel (4-6 job cards)
  │      - "See All Jobs" button → /jobs
  │      - Company highlights, testimonials, CTA
  │
  ├── /jobs
  │  └── [Jobs List Page]
  │      - Search bar (keyword, location, job type)
  │      - Filters sidebar (salary range, experience level, skills)
  │      - Job card grid (20 per page, pagination)
  │      - "Apply Now" button on each card
  │
  ├── /jobs/:id
  │  └── [Job Detail Page]
  │      - Full job description, requirements
  │      - Company info card (logo, size, link to careers)
  │      - Match badge (if logged in: "75% match")
  │      - "Apply Now" CTA button
  │
  ├── /jobs/:id/apply
  │  └── [Apply Form Page]
  │      - Prefilled form fields (if from email link)
  │      - File upload dropzone (resume, cover letter, portfolio)
  │      - Submission button
  │      - Success page (confirmation + next steps)
  │
  └── /auth
      ├── /login
      ├── /register
      ├── /forgot-password
      └── /verify-email

PROTECTED ROUTES (auth required):
  ├── /dashboard
  │  └── [User Dashboard - context-aware]
  │      If HR: Job management + shortlist view
  │      If Admin: Platform-wide analytics
  │      If Candidate: Application history + status
  │
  ├── /dashboard/jobs
  │  └── [HR Job Management]
  │      - List HR's jobs (draft, published, closed)
  │      - "Create Job" button → form
  │      - Edit/delete/close actions per job
  │      - Quick stats: applications, shortlist count
  │
  ├── /dashboard/jobs/:id/edit
  │  └── [Job Edit Form]
  │      - Update title, description, requirements
  │      - Change status
  │      - View/copy share link
  │
  ├── /dashboard/jobs/:id/applications
  │  └── [Applications List]
  │      - Filter by status (submitted, shortlisted, rejected)
  │      - Sort by date or match score
  │      - Click candidate to view details
  │
  ├── /dashboard/jobs/:id/candidate/:application_id
  │  └── [Candidate Detail View]
  │      - Applicant info (name, email, phone, summary)
  │      - Documents (resume, cover letter)
  │      - Match score & reason
  │      - Action buttons: shortlist, reject, schedule
  │
  ├── /dashboard/shortlist
  │  └── [Shortlist Summary View]
  │      - Aggregate view of shortlisted candidates across all jobs
  │      - Download shortlist as CSV/PDF
  │      - Send notification email
  │
  ├── /dashboard/profile
  │  └── [User Profile / Settings]
  │      - Edit name, email, phone
  │      - Change password
  │      - Email notification preferences
  │      - Account deletion (soft delete)
  │
  └── /admin
      ├── /analytics
      ├── /users
      ├── /companies
      └── /settings
```

### 4.2 Key UI Components

**Reusable Component Library:**
```
components/
  ├── Layout/
  │  ├── Header.tsx (nav, logo, user menu)
  │  ├── Footer.tsx
  │  └── Sidebar.tsx (for dashboard)
  │
  ├── Auth/
  │  ├── LoginForm.tsx
  │  ├── RegisterForm.tsx
  │  └── ProtectedRoute.tsx
  │
  ├── Jobs/
  │  ├── JobCard.tsx (list preview)
  │  ├── JobDetail.tsx (full view)
  │  ├── JobForm.tsx (create/edit)
  │  ├── JobStats.tsx
  │  └── ShareLinkDisplay.tsx
  │
  ├── Applications/
  │  ├── ApplyForm.tsx (file uploads, field validation)
  │  ├── ApplicationList.tsx (HR view)
  │  ├── CandidateCard.tsx (with match score)
  │  ├── CandidateDetail.tsx
  │  └── SubmissionSuccess.tsx
  │
  ├── Admin/
  │  ├── ShortlistSummary.tsx
  │  ├── NotificationBuilder.tsx (email template preview)
  │  └── DashboardStats.tsx
  │
  └── Common/
     ├── Button.tsx
     ├── Input.tsx, Textarea.tsx
     ├── FileUpload.tsx (with drag-drop, progress)
     ├── Modal.tsx
     ├── Toast.tsx
     └── Pagination.tsx
```

### 4.3 Frontend State Management

**Tools:** React Context + React Query (or Zustand for simpler state)

**Store Structure:**
```typescript
// Auth Context
- user (auth state, role, company)
- login, logout, refreshToken

// Notification Context (Toast)
- showNotification(type, message, duration)

// React Query Hooks (for data fetching & caching)
- useJobs(filters, page)
- useJobDetail(jobId)
- useApplications(jobId)
- useApplicantDetail(applicationId)
- useShortlist(jobId)
- useUserProfile()

// Form State (React Hook Form + Zod validation)
- useJobForm (create/edit)
- useApplyForm (file upload + validation)
```

### 4.4 File Upload & S3 Integration (Frontend)

**Flow:**
1. User selects files in ApplyForm component.
2. Frontend calls `POST /api/documents/upload` (multipart form data).
3. Backend receives, validates MIME type & size, uploads to S3.
4. S3 URL returned to frontend, stored in application record.
5. On success page, files are linked.

**Libraries:**
- `react-dropzone` for drag-drop UX
- `axios` for multipart form data
- Progress bar via `useProgress` hook

### 4.5 Email & Shareable Link Flow (Frontend)

**For HR sharing job:**
1. HR creates job, clicks "Share Job" button.
2. Frontend shows copy-to-clipboard link: `optiohire.com/apply/{job_id}?ref=email`.
3. HR copies & pastes into email client (Gmail, Outlook, etc.).
4. Candidate clicks link → lands on prefilled apply form.
5. Candidate sees form with `name`, `email` prepopulated (if in URL params).
6. Candidate uploads resume and submits.

**For Direct Email Submission (inbound):**
1. HR sends job link via email.
2. Candidate replies with resume attachment.
3. Watcher inbox receives email.
4. Webhook or cron processes email → creates application & applicant.

---

## 5. BACKEND ARCHITECTURE & SERVICES

### 5.1 Folder Structure

```
backend/
├── src/
│  ├── app.ts (Express app initialization)
│  ├── server.ts (server entry point)
│  ├── middleware/ (auth, error handling, logging)
│  ├── routes/ (API endpoint definitions)
│  │  ├── auth.routes.ts
│  │  ├── jobs.routes.ts
│  │  ├── applications.routes.ts
│  │  ├── webhooks.routes.ts
│  │  └── admin.routes.ts
│  ├── controllers/ (request handlers)
│  │  ├── auth.controller.ts
│  │  ├── jobs.controller.ts
│  │  ├── applications.controller.ts
│  │  └── webhooks.controller.ts
│  ├── services/ (business logic)
│  │  ├── auth.service.ts
│  │  ├── job.service.ts
│  │  ├── application.service.ts
│  │  ├── file.service.ts (S3 operations)
│  │  ├── email.service.ts (transactional email)
│  │  ├── extraction.service.ts (AI)
│  │  ├── matching.service.ts (scoring & shortlisting)
│  │  └── queue.service.ts (job enqueueing)
│  ├── models/ (Knex queries, TypeORM entities, or SQL builders)
│  │  ├── user.model.ts
│  │  ├── job.model.ts
│  │  ├── application.model.ts
│  │  └── ...
│  ├── utils/
│  │  ├── validators.ts
│  │  ├── jwt.ts
│  │  ├── logger.ts
│  │  └── encryption.ts
│  ├── types/ (TypeScript interfaces)
│  │  ├── user.types.ts
│  │  ├── job.types.ts
│  │  ├── application.types.ts
│  │  └── ...
│  ├── config/ (environment & config files)
│  │  ├── database.ts
│  │  ├── redis.ts
│  │  ├── s3.ts
│  │  ├── email.ts
│  │  └── ai.ts
│  └── migrations/ (Knex migrations)
│
├── .env.example
├── tsconfig.json
├── package.json
└── Dockerfile
```

### 5.2 Core Services (Descriptions & Key Methods)

#### 5.2.1 Auth Service
```typescript
class AuthService {
  // User registration
  async register(email, password, company_name, first_name, last_name)
    → { user, access_token, refresh_token }

  // User login
  async login(email, password)
    → { user, access_token, refresh_token }

  // Refresh token
  async refreshToken(refresh_token)
    → { access_token, refresh_token }

  // Email verification
  async sendVerificationEmail(user_id, email)
  async verifyEmail(token)

  // Password reset
  async requestPasswordReset(email)
  async resetPassword(token, new_password)
}
```

#### 5.2.2 Job Service
```typescript
class JobService {
  // CRUD operations
  async createJob(company_id, created_by, jobData)
    → { id, title, ..., public_url }
  
  async getJobById(job_id)
    → { id, title, ..., company }
  
  async listJobs(filters, limit, offset)
    → { data: [...], total, limit, offset }
  
  async updateJob(job_id, updates)
  
  async deleteJob(job_id) // soft delete
  
  // Status transitions
  async publishJob(job_id)
  async closeJob(job_id)
  
  // Stats
  async getJobStats(job_id)
    → { applications_count, shortlisted_count, avg_match_score, ... }
  
  // Share link generation
  async generateShareLink(job_id, template: 'email' | 'web')
    → { share_url, email_body_template, ... }
}
```

#### 5.2.3 Application Service
```typescript
class ApplicationService {
  // Create application (from form or email)
  async createApplication(job_id, applicant_data, documents, source)
    → { application: {...}, applicant: {...} }
  
  // Get application
  async getApplication(application_id)
  
  // List applications for job (paginated)
  async listApplications(job_id, filters, limit, offset)
  
  // Update status
  async updateApplicationStatus(application_id, new_status)
  
  // Link or create applicant
  async createOrLinkApplicant(email, name, phone, extracted_data)
    → applicant_id
  
  // Handle duplicate applicant (same email)
  async mergeDuplicateApplicants(existing_id, new_data)
}
```

#### 5.2.4 File Service (S3)
```typescript
class FileService {
  // Upload file to S3
  async uploadFile(file, applicant_id, application_id?, document_type)
    → { id, s3_url, file_hash, extracted_text }
  
  // Extract text from PDF/DOCX
  async extractTextFromDocument(s3_key, file_type)
    → text
  
  // Generate signed URL (time-limited access)
  async getSignedUrl(s3_key, expiry_seconds)
    → signed_url
  
  // Delete file
  async deleteFile(s3_key)
  
  // Validate file (type, size, virus scan)
  async validateFile(file, max_size)
}
```

#### 5.2.5 Email Service (Transactional)
```typescript
class EmailService {
  // Send application confirmation
  async sendApplicationConfirmation(applicant_email, job_title, app_id)
  
  // Send shortlist notification (to HR)
  async sendShortlistNotification(hr_email, shortlisted_candidates, job)
    → { email_event_id, success }
  
  // Send rejection
  async sendRejectionEmail(applicant_email, job_title)
  
  // Generic send
  async sendEmail(to, subject, template, variables)
    → { message_id, status }
}
```

#### 5.2.6 Extraction Service (AI)
```typescript
class ExtractionService {
  // Extract structured data from resume text + email body
  async extractApplicantData(resume_text, email_body?, metadata?)
    → {
        name, email, phone, experience_years, skills,
        education, summary, confidence_score, raw_response
      }
  
  // Generate embeddings for resume
  async generateEmbedding(resume_text)
    → vector (1536 dimensions for OpenAI)
  
  // Validate extraction quality
  async validateExtraction(extracted_data, threshold: 0.7)
    → { is_valid, confidence, errors: [...] }
}
```

#### 5.2.7 Matching Service
```typescript
class MatchingService {
  // Run full matching pipeline
  async matchApplicationToJob(application_id, job_id)
    → { score, rule_checks, reason, embedding_similarity }
  
  // Check required skills
  async checkSkillsMatch(applicant_skills, required_skills, threshold)
    → { met: bool, missing: [...], extra: [...] }
  
  // Check experience
  async checkExperienceMatch(applicant_years, min_required)
    → { met: bool, gap: number }
  
  // Compute embedding similarity
  async computeEmbeddingSimilarity(applicant_embedding, job_embedding)
    → similarity_score (0-1)
  
  // Get shortlisted candidates (above threshold or top-N)
  async getShortlistedCandidates(job_id, top_n?, threshold?)
    → [ { applicant, score, reason }, ... ]
}
```

#### 5.2.8 Queue Service (BullMQ + Redis)
```typescript
class QueueService {
  // Enqueue tasks
  async enqueueExtractApplicant(application_id, rawEmail?, attachments?)
  async enqueueMatchJob(application_id, job_id)
  async enqueueNotifyHR(job_id, trigger: 'threshold' | 'manual')
  
  // Worker handlers (defined separately in watcher-engine)
  // See section 6
}
```

### 5.3 Middleware & Request/Response Handling

```typescript
// Middleware Stack (in Express app):

app.use(cors(...));
app.use(helmet()); // security headers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Logging
app.use(logger.middleware);

// Authentication
app.use(authenticate); // attach user if token present

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);
```

### 5.4 Key Validations & Security

**Input Validation:**
- Email format, password strength
- File types (only PDF, DOCX, DOCX, images)
- File size limits (max 10MB per file)
- Job title & description (max lengths)
- Phone number format

**Authorization:**
- JWT token validation
- Company-scoped data access (user can only see their company's jobs)
- Role-based access (only HR can create jobs in their company)

**Security Practices:**
- Passwords hashed with bcrypt (cost: 12)
- Refresh tokens stored in HTTP-only cookies
- CORS whitelist (frontend domain only)
- Rate limiting on auth endpoints (5 attempts / 5 minutes)
- File hash validation (dedup + integrity check)
- PII encryption at rest (optional, for sensitive fields)

---

## 6. WATCHER ENGINE ARCHITECTURE

### 6.1 Overview

The **Watcher Engine** is a separate Node.js worker process (runs in Docker) that:
1. **Receives** inbound emails/webhooks or polls mailbox.
2. **Extracts** structured candidate data using AI.
3. **Matches** candidates to jobs using embeddings + rules.
4. **Notifies** HR with shortlist summaries.

**Deployment:** Runs as separate service, can scale horizontally (multiple workers).

### 6.2 Core Components

```
watcher-engine/
├── src/
│  ├── index.ts (worker process entry)
│  ├── queue-workers/ (job handlers)
│  │  ├── extract-applicant.worker.ts
│  │  ├── match-job.worker.ts
│  │  └── notify-hr.worker.ts
│  ├── services/ (shared with backend, or duplicated)
│  │  ├── extraction.service.ts
│  │  ├── matching.service.ts
│  │  ├── email.service.ts
│  │  └── database.service.ts
│  ├── adapters/ (email providers)
│  │  ├── resend.adapter.ts (webhook receiver)
│  │  ├── imap.adapter.ts (fallback polling)
│  │  └── email-parser.ts (MIME parsing)
│  ├── utils/
│  │  ├── logger.ts
│  │  ├── email-cleaner.ts (remove signatures, footers)
│  │  └── validators.ts
│  └── config/ (same as backend)
│
└── Dockerfile
```

### 6.3 Job Queue Workflows

#### 6.3.1 Extract Applicant Job
```typescript
// Trigger: Application submitted (web form or email)

bullQueue.process('extract-applicant', async (job) => {
  const { application_id, raw_email, attachments } = job.data;

  // Step 1: Load application & documents
  const app = await getApplication(application_id);
  const docs = await getDocuments(application_id);

  // Step 2: Extract text from attachments
  let resume_text = '';
  for (const doc of docs) {
    const text = await fileService.extractTextFromDocument(doc.s3_key, doc.type);
    if (doc.type === 'resume') resume_text = text;
  }

  // Step 3: Call AI extractor
  const extracted = await extractionService.extractApplicantData(
    resume_text,
    raw_email?.body,
    { email_subject: raw_email?.subject }
  );

  // Step 4: Generate embeddings
  const embedding = await extractionService.generateEmbedding(resume_text);

  // Step 5: Store or update applicant
  const applicant = await applicationService.createOrLinkApplicant(
    extracted.email,
    extracted.name,
    extracted.phone,
    { ...extracted, embedding, ai_confidence: extracted.confidence }
  );

  // Step 6: Update application
  await updateApplication(application_id, {
    applicant_id: applicant.id,
    status: 'submitted'
  });

  // Step 7: Enqueue match job
  await queueService.enqueueMatchJob(application_id, app.job_id);

  return { applicant_id: applicant.id, confidence: extracted.confidence };
});
```

#### 6.3.2 Match Job Job
```typescript
// Trigger: After extract-applicant completes

bullQueue.process('match-job', async (job) => {
  const { application_id, job_id } = job.data;

  // Step 1: Load applicant & job
  const app = await getApplication(application_id);
  const applicant = await getApplicant(app.applicant_id);
  const jobData = await getJob(job_id);

  // Step 2: Run matching pipeline
  const match = await matchingService.matchApplicationToJob(
    application_id,
    job_id
  );

  // Step 3: Store match result
  await saveMatch({
    application_id,
    job_id,
    score: match.score,
    rule_checks: match.rule_checks,
    matching_reason: match.reason,
    embedding_similarity: match.embedding_similarity,
    is_shortlisted: match.score >= jobData.shortlisting_threshold
  });

  // Step 4: Check if should notify HR
  if (match.score >= jobData.shortlisting_threshold) {
    // Increment notify_count
    await updateJobNotifyCount(job_id);

    // If reached threshold, enqueue notify
    const notify_count = await getJobNotifyCount(job_id);
    if (notify_count >= jobData.max_shortlist_count) {
      await queueService.enqueueNotifyHR(job_id, 'threshold');
      await resetJobNotifyCount(job_id);
    }
  }

  return { match_id: match.id, score: match.score, shortlisted: match.is_shortlisted };
});
```

#### 6.3.3 Notify HR Job
```typescript
// Trigger: Manual request or when max_shortlist_count reached

bullQueue.process('notify-hr', async (job) => {
  const { job_id, trigger } = job.data;

  // Step 1: Get job & HR user
  const jobData = await getJob(job_id);
  const hr_user = await getUser(jobData.created_by);

  // Step 2: Get shortlisted candidates
  const shortlisted = await matchingService.getShortlistedCandidates(
    job_id,
    limit: 10
  );

  // Step 3: Generate HTML email
  const email_html = await generateShortlistEmail(jobData, shortlisted, {
    secure_token: generateTimeToken(1, 'day'), // 24 hr access link
    portal_url: `${APP_URL}/admin/shortlist/${job_id}`
  });

  // Step 4: Send email
  const result = await emailService.sendShortlistNotification(
    hr_user.email,
    shortlisted,
    jobData
  );

  // Step 5: Log email event
  await createEmailEvent({
    job_id,
    recipient_email: hr_user.email,
    email_type: 'shortlist_notification',
    subject: `[OptiOHire] ${shortlisted.length} New Shortlisted Candidates for ${jobData.title}`,
    status: result.success ? 'sent' : 'failed'
  });

  return { email_event_id: result.email_event_id, candidate_count: shortlisted.length };
});
```

### 6.4 Email Ingestion Strategies

#### Strategy 1: Webhook-Based (Recommended for Production)
- Email provider (Resend/SendGrid/Postmark) receives email.
- Provider sends webhook to `POST /api/webhooks/email`.
- Synchronously create application record.
- Asynchronously push to queue.
- **Pros:** Reliable, fast, no polling.
- **Cons:** Requires email provider support.

**Flow:**
```
Candidate Email → Email Provider → Webhook → Backend
                                        ↓
                              Create Application
                                        ↓
                              Enqueue extract-applicant
                                        ↓
                              Worker processes in background
```

#### Strategy 2: IMAP Polling (Fallback)
- Separate cron job (every 1-5 minutes) polls mailbox via IMAP.
- Fetches new emails, parses, creates application.
- **Pros:** Works without provider webhooks (e.g., generic company mailbox).
- **Cons:** Polling latency, potential missed emails, rate limiting.

**Cron Job:**
```typescript
cron.schedule('*/5 * * * *', async () => {
  // Every 5 minutes
  const imap = new Imap(IMAP_CONFIG);
  const emails = await imap.getUnreadEmails(INBOUND_EMAIL_ADDRESS);

  for (const email of emails) {
    try {
      // Parse email
      const parsed = await emailParser.parse(email.raw_mime);

      // Match to job (via TO field, subject line, or manual config)
      const job_id = await matchEmailToJob(parsed);

      if (!job_id) continue; // unrelated email

      // Create application
      const app = await applicationService.createApplication(
        job_id,
        { name: parsed.from_name, email: parsed.from_email },
        parsed.attachments,
        'email'
      );

      // Enqueue extraction
      await queueService.enqueueExtractApplicant(
        app.id,
        parsed.body,
        parsed.attachments
      );

      // Mark as read
      await imap.markAsRead(email.uid);
    } catch (err) {
      logger.error('Failed to process inbound email', { email, err });
    }
  }
});
```

### 6.5 AI Extraction Prompt & Logic

**Extraction Prompt (for GPT-4):**
```
You are a resume parsing and candidate profiling AI. Extract structured candidate information from the provided resume and/or email body.

Return a JSON object with the following fields (all required unless noted):
{
  "name": "Full name of candidate",
  "email": "Email address (use 'unknown' if not found)",
  "phone": "Phone number (use 'unknown' if not found)",
  "summary": "1-2 sentence professional summary",
  "experience_years": (integer, estimate if not explicit),
  "skills": [
    {
      "skill": "Skill name (e.g., Python, React, SQL)",
      "level": "beginner|intermediate|expert",
      "years": (optional, years of experience)
    },
    ...
  ],
  "education": [
    {
      "degree": "BS|MS|PhD|etc",
      "field": "Field of study",
      "school": "University/Institution name",
      "year_graduated": (integer, 4-digit year or null)
    }
  ],
  "work_history": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration_months": (integer or null),
      "description": "Brief description of responsibilities"
    }
  ],
  "confidence": (float 0-1, your confidence in the extraction accuracy)
}

Resume/Email Content:
{RESUME_TEXT}
{EMAIL_BODY}

Return ONLY valid JSON, no additional text.
```

**Validation & Fallback:**
```typescript
async extractApplicantData(resume_text, email_body, metadata) {
  // Step 1: Call LLM
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: EXTRACTION_PROMPT,
      role: 'user',
      content: `Resume:\n${resume_text}\n\nEmail:\n${email_body || '(none)'}`
    }],
    temperature: 0.2, // low randomness
    timeout: 30000
  });

  let extracted = JSON.parse(response.choices[0].message.content);

  // Step 2: Validate
  const validation = await this.validateExtraction(extracted, 0.7);
  if (!validation.is_valid) {
    // Mark for human review
    extracted.requires_review = true;
    extracted.validation_errors = validation.errors;
  }

  // Step 3: Fallback extraction (regex patterns)
  if (extracted.confidence < 0.5) {
    extracted = await this.fallbackExtraction(resume_text, email_body);
  }

  return extracted;
}
```

### 6.6 Matching Algorithm

**Two-Stage Matching:**

1. **Rule-Based Checks** (binary: pass/fail)
   - Required skills present? (count match / required)
   - Minimum experience met? (applicant_years >= min_years)
   - Desired education present?

2. **Embedding Similarity** (continuous: 0-1)
   - Generate embedding for applicant resume.
   - Generate embedding for job description.
   - Compute cosine similarity.

**Combined Score:**
```typescript
async matchApplicationToJob(application_id, job_id) {
  const applicant = await getApplicant(...);
  const job = await getJob(job_id);

  // Rule checks
  const rule_checks = {
    required_skills_met: checkSkills(applicant.skills, job.requirements.required_skills),
    min_experience_met: applicant.experience_years >= job.requirements.min_experience_years,
    education_present: checkEducation(applicant.education, job.requirements.education)
  };

  const rule_score = (
    (rule_checks.required_skills_met ? 0.3 : 0) +
    (rule_checks.min_experience_met ? 0.3 : 0) +
    (rule_checks.education_present ? 0.1 : 0)
  ); // 0-0.7

  // Embedding similarity
  const job_embedding = await this.generateEmbedding(job.description);
  const similarity = await this.computeEmbeddingSimilarity(
    applicant.embedding,
    job_embedding
  ); // 0-1

  // Combined score (rule-based: 0-0.7, embedding: 0-0.3)
  const final_score = rule_score + (similarity * 0.3);

  return {
    score: final_score, // 0-1
    rule_checks,
    embedding_similarity: similarity,
    reason: generateMatchReason(rule_checks, similarity)
  };
}
```

---

## 7. EMAIL NOTIFICATION & TEMPLATE SYSTEM

### 7.1 Email Providers & Setup

**Primary:** Resend (modern, webhook-friendly)
- Inbound webhook for email receipt
- Transactional API for sending
- Event tracking (opens, clicks)

**Alternative:** SendGrid or Postmark (mature, feature-rich)

**Configuration:**
```
.env:
EMAIL_PROVIDER=resend
RESEND_API_KEY=...
FROM_EMAIL=noreply@optiohire.com
WEBHOOK_SIGNATURE_SECRET=...
APP_URL=https://optiohire.com
INBOUND_EMAIL_ADDRESS=jobs@optiohire.com
```

### 7.2 Email Templates

#### 7.2.1 Application Confirmation (Sent to Candidate)
```html
Subject: Your Application to {JOB_TITLE} at {COMPANY}

Dear {CANDIDATE_NAME},

Thank you for applying to {JOB_TITLE} at {COMPANY}!

We have received your application and will review it shortly. We typically review applications within 3-5 business days.

— OptiOHire Team

[Optional] Track your application status: {SECURE_LINK}
```

#### 7.2.2 Shortlist Notification (Sent to HR)
```html
Subject: [OptiOHire] {N} New Shortlisted Candidates for {JOB_TITLE}

Dear {HR_NAME},

Great news! We've identified {N} highly-qualified candidates for your {JOB_TITLE} position.

---
[Shortlisted Candidates:]

{FOR EACH CANDIDATE:}
  Name: {NAME} | Match Score: {SCORE}%
  Skills: {SKILLS_MATCHED}
  Experience: {YEARS} years
  [View Full Profile Button]
---

[View All Candidates Dashboard: {SECURE_PORTAL_LINK}]

— OptiOHire Team
```

#### 7.2.3 Job Shared via Email (Template for HR to Copy)
```
Subject: [Hiring] {COMPANY} is Hiring {JOB_TITLE}

Hi,

{COMPANY} is hiring for the {JOB_TITLE} role. If you're interested or know someone who might be, check out the full details and apply:

[Apply Now: {SHARE_LINK}]

Key Details:
- Location: {LOCATION}
- Salary: {SALARY_RANGE}
- Type: {JOB_TYPE}

{JOB_DESCRIPTION_EXCERPT}

Looking forward to hearing from you!

— {HR_NAME}, {COMPANY}
```

### 7.3 Email Sending Flow

```typescript
class EmailService {
  async sendApplicationConfirmation(to, applicant_name, job_title, application_id) {
    const template = 'application-confirmation';
    const variables = { applicant_name, job_title, application_id };
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your Application to ${job_title}`,
      html: await renderTemplate(template, variables)
    });

    // Log event
    await createEmailEvent({
      recipient_email: to,
      application_id,
      email_type: 'application-confirmation',
      subject: result.subject,
      status: result.success ? 'sent' : 'failed'
    });

    return result;
  }

  async sendShortlistNotification(to, candidates, job, secure_token) {
    const template = 'shortlist-notification';
    const variables = { candidates, job, portal_link: `${APP_URL}/admin/shortlist/${job.id}?token=${secure_token}` };

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[OptiOHire] ${candidates.length} New Shortlisted Candidates for ${job.title}`,
      html: await renderTemplate(template, variables),
      tags: [`job:${job.id}`, 'shortlist-notification']
    });

    return result;
  }
}
```

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### 8.1 Performance & Scalability

| Requirement             | Target          | Strategy                                      |
|-------------------------|-----------------|-----------------------------------------------|
| **API Response Time**    | < 200ms (p95)   | Caching (Redis), DB indexing, query optimization |
| **File Upload Time**     | < 5sec (10MB)   | Multipart streaming, async processing         |
| **Email Processing**     | < 2sec per app  | Queue + async workers, batch operations       |
| **Match Computation**    | < 500ms/app     | Precomputed embeddings, vectordb indexing     |
| **Concurrent Users**     | 10K+ simultaneous | Horizontal scaling (k8s), stateless APIs    |
| **Database Throughput**  | 1K+ writes/sec  | Connection pooling, write replication         |

### 8.2 Availability & Reliability

- **Target Uptime:** 99.5% (4.38 hours downtime/month)
- **SLA:** API ≥99%, Watcher ≥98%, Email delivery ≥99%
- **Failover:** Multi-zone database replicas, read replicas, automated backups (daily)
- **Queue Resilience:** Job persistence, dead-letter queue, automatic retries (exponential backoff)
- **Rate Limiting:** 100 requests/min per IP (auth endpoints: 5/min)

### 8.3 Security & Compliance

- **Data Encryption:** TLS in transit, AES-256 at rest (optional for sensitive fields)
- **PII Handling:** Minimal collection, hashing where possible, retention policy (delete after 6 months if no hire)
- **GDPR/CCPA:** Data export, right-to-be-forgotten, consent tracking
- **Audit Logging:** All user actions logged with timestamp, user ID, IP, resource ID
- **Vulnerability Scanning:** Dependabot, OWASP Top 10 mitigation, regular penetration testing (post-launch)

### 8.4 Testing Strategy

**Unit Tests (Jest):**
- Service layer (auth, job, application, matching)
- Utility functions (validators, encryption)
- Target: ≥80% code coverage

**Integration Tests (Supertest + Jest):**
- API endpoints (happy path + error cases)
- Database transactions
- Queue job handlers
- Email service mock

**E2E Tests (Playwright or Cypress):**
- User registration & login flow
- Job creation & sharing
- Application submission & file uploads
- Watcher ingestion (email/webhook)
- HR shortlist notification

**Load Tests (K6 / Apache JMeter):**
- Peak traffic simulation (1K concurrent users)
- File upload concurrency
- API response time under load

**Sample Test Command:**
```bash
npm run test:unit # unit tests
npm run test:integration # API tests
npm run test:e2e # end-to-end
npm run test:load # load tests
npm run coverage # coverage report
```

---

## 9. DEPLOYMENT & INFRASTRUCTURE

### 9.1 Docker Compose (Development)

**File: `docker-compose.yml`**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: optiohire_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  backend:
    build: ./backend
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://dev:dev_secret@postgres:5432/optiohire_dev
      REDIS_URL: redis://redis:6379
      S3_ENDPOINT: http://minio:9000
      S3_BUCKET: optiohire
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin123
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      RESEND_API_KEY: ${RESEND_API_KEY}
      FROM_EMAIL: noreply@optiohire.local
    ports:
      - "3001:3000"
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./backend:/app
      - /app/node_modules

  watcher:
    build: ./watcher-engine
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://dev:dev_secret@postgres:5432/optiohire_dev
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      RESEND_API_KEY: ${RESEND_API_KEY}
    depends_on:
      - postgres
      - redis
      - backend
    volumes:
      - ./watcher-engine:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/.next
      - /app/node_modules

volumes:
  postgres_data:
  minio_data:
```

**Startup Command:**
```bash
docker-compose up -d
docker-compose exec backend npm run migrate:latest
docker-compose logs -f
```

### 9.2 Production Deployment (Kubernetes)

**Helm Chart or Manual k8s YAML:**
```
k8s/
├── namespace.yaml
├── secrets.yaml (API keys, DB creds)
├── configmap.yaml (app config)
├── backend/
│  ├── deployment.yaml (backend API)
│  ├── service.yaml
│  └── hpa.yaml (autoscaling)
├── watcher/
│  ├── deployment.yaml (watcher workers)
│  ├── service.yaml
│  └── hpa.yaml
├── frontend/
│  ├── deployment.yaml (Next.js app)
│  ├── service.yaml
│  └── ingress.yaml
├── postgres/
│  ├── statefulset.yaml (or RDS)
│  └── pvc.yaml
├── redis/
│  ├── statefulset.yaml (or ElastiCache)
│  └── pvc.yaml
└── ingress.yaml (main ingress, TLS cert from cert-manager)
```

**Deployment Steps:**
```bash
# 1. Create k8s cluster (EKS / GKE / AKS)
# 2. Install ingress controller, cert-manager
# 3. Create secrets & configmaps
kubectl create namespace optiohire
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# 4. Deploy services
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/watcher/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml

# 5. Run migrations
kubectl exec -it deployment/backend -- npm run migrate:latest

# 6. Verify
kubectl get pods -n optiohire
kubectl get svc -n optiohire
```

### 9.3 CI/CD Pipeline (GitHub Actions)

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy

on:
  push:
    branches: [main, staging]

env:
  REGISTRY: gcr.io
  IMAGE_PREFIX: optiohire

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm

      - run: npm install --workspaces
      - run: npm run test:unit
      - run: npm run test:integration

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2

      - run: |
          docker build -t $REGISTRY/$IMAGE_PREFIX/backend:${{ github.sha }} ./backend
          docker push $REGISTRY/$IMAGE_PREFIX/backend:${{ github.sha }}
          
          docker build -t $REGISTRY/$IMAGE_PREFIX/watcher:${{ github.sha }} ./watcher-engine
          docker push $REGISTRY/$IMAGE_PREFIX/watcher:${{ github.sha }}

  deploy:
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/setup-kubectl@v3
      - uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}

      - run: |
          kubectl set image deployment/backend backend=$REGISTRY/$IMAGE_PREFIX/backend:${{ github.sha }} -n optiohire
          kubectl set image deployment/watcher watcher=$REGISTRY/$IMAGE_PREFIX/watcher:${{ github.sha }} -n optiohire
          kubectl rollout status deployment/backend -n optiohire
```

---

## 10. MONITORING, LOGGING & OBSERVABILITY

### 10.1 Structured Logging

**Logger Setup (Winston):**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'optiohire-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage:
logger.info('Application started', { port: 3000 });
logger.error('Database error', { error: err.message, userId: user_id });
```

### 10.2 Error Tracking (Sentry)

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  maxBreadcrumbs: 50
});

// Catch unhandled errors
app.use(Sentry.Handlers.errorHandler());

// Manual capture
try {
  // code
} catch (error) {
  Sentry.captureException(error);
}
```

### 10.3 Health Check Endpoints

```typescript
GET /api/health

Response:
{
  status: "ok" | "degraded" | "error",
  timestamp: ISO8601,
  services: {
    database: { status: "ok", latency_ms: 5 },
    redis: { status: "ok", latency_ms: 2 },
    s3: { status: "ok", latency_ms: 100 },
    email: { status: "ok", last_sent: ISO8601 },
    ai_service: { status: "ok", latency_ms: 500 }
  }
}
```

### 10.4 Metrics & Dashboards (Post-Launch Phase 2)

**Tools:** Prometheus + Grafana

**Key Metrics:**
- Request latency (p50, p95, p99)
- Application success rate
- Queue depth & processing time
- AI extraction confidence scores
- Email delivery success rate
- Database connections & slow queries
- S3 upload bandwidth

---

## 11. 5-DAY IMPLEMENTATION TIMELINE

### Day 1: Foundation (Architecture & Backend Core)
**Goal:** Database schema ready, core APIs running, authentication working

**Tasks:**
1. Set up backend project structure (TypeScript, Express, middleware)
2. Configure database (Knex migrations, seed data)
3. Implement Auth service (register, login, JWT)
4. Implement Job service (create, list, detail endpoints)
5. Docker Compose setup (postgres, redis, minio)
6. Deployment scripts
7. **Acceptance:** `POST /api/auth/register` → user created; `GET /api/jobs` → returns empty list

### Day 2: Apply Flow & File Uploads (Frontend + Backend)
**Goal:** Candidates can submit applications with file uploads

**Tasks:**
1. Frontend: homepage with featured jobs
2. Frontend: jobs listing page (search, filters, pagination)
3. Frontend: job detail page
4. Frontend: apply form (multipart file upload)
5. Backend: file upload endpoint (S3 integration)
6. Backend: application creation & storage
7. Email: application confirmation to candidate
8. **Acceptance:** Form submits, files uploaded, confirmation email sent

### Day 3: Watcher Engine & Email Integration (Inbound Processing)
**Goal:** Inbound emails ingested, applicants extracted, stored

**Tasks:**
1. Backend: webhook endpoint for inbound emails
2. Watcher: queue setup (BullMQ)
3. Watcher: extract-applicant job worker
4. AI extraction service (LLM integration, embeddings)
5. Database: applicant & document tables populated
6. Logging & error handling
7. **Acceptance:** Email received via webhook → applicant extracted & stored in DB

### Day 4: Matching & HR Notifications (Matching + Shortlist)
**Goal:** Candidates matched to jobs, HR notified with shortlist

**Tasks:**
1. Watcher: match-job worker (rule checks + embeddings)
2. Matching service (scoring algorithm)
3. Watcher: notify-hr worker (email generation & sending)
4. Backend: shortlist API endpoints
5. Frontend: admin shortlist view (candidate cards, scores)
6. Email: shortlist notification template
7. Link tracking & email events
8. **Acceptance:** Matched candidates visible in admin UI, HR receives shortlist email

### Day 5: Integration, Testing & Deployment (E2E + Polish)
**Goal:** Full system working end-to-end, deployable, documented

**Tasks:**
1. E2E tests (apply → watcher → match → shortlist flow)
2. Integration tests (API + queue)
3. Load testing (concurrent users, file uploads)
4. Docker Compose final checks
5. Kubernetes deployment manifests (or alternative hosting)
6. CI/CD pipeline (GitHub Actions)
7. Documentation (README, API docs, runbooks)
8. Performance tuning & optimization
9. Security audit & hardening
10. **Acceptance:** Full workflow tested; system deployable; docs complete

---

## 12. DELIVERABLES CHECKLIST

### Code & Infrastructure
- [ ] Backend service (API + services + migrations)
- [ ] Frontend application (pages + components)
- [ ] Watcher engine (workers + queue)
- [ ] Database schema (migrations + seed data)
- [ ] Docker Compose (dev environment)
- [ ] Kubernetes manifests (or hosting-specific configs)
- [ ] CI/CD pipeline (GitHub Actions)

### Documentation
- [ ] Architecture design document (this file)
- [ ] API documentation (Swagger/OpenAPI or README)
- [ ] Database schema diagram
- [ ] Deployment runbook
- [ ] Operations manual (scaling, monitoring, troubleshooting)
- [ ] Developer onboarding guide

### Testing & QA
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (user flows)
- [ ] Load test results
- [ ] Security audit report

### Configuration & Secrets
- [ ] `.env.example` file (template)
- [ ] Secrets management (Vault, K8s Secrets, or platform)
- [ ] SSL/TLS certificates configured
- [ ] Email provider setup (DNS, webhook, API keys)

---

## 13. RISK MITIGATION & CONTINGENCY

| Risk                             | Impact | Probability | Mitigation                                      |
|----------------------------------|--------|-------------|-----------------------------------------------------|
| LLM API rate limiting / timeout  | High   | Medium      | Implement queue + retry logic; fallback extraction |
| Email provider downtime          | High   | Low         | Multiple provider support; queue with retry        |
| Inbound email parsing failures   | Medium | Medium      | Validation + human review flag; fuzzy matching     |
| Database scaling at volume       | Medium | Low         | RDS read replicas; query optimization; caching    |
| Poor embedding quality           | Medium | Medium      | Fine-tune model + hybrid matching (rules + sim)    |
| File upload virus / malware      | High   | Low         | Virus scanning (ClamAV); file hash validation     |
| Concurrency issues (race cond.)  | Medium | Low         | Database locks + optimistic concurrency; testing  |

---

## 14. SUCCESS METRICS & KPIs

**Operational:**
- API uptime: 99.5%+
- Watcher processing latency: < 2 seconds per email
- Email delivery success rate: > 99%

**Product:**
- Application-to-shortlist time: < 24 hours
- Shortlist accuracy (HR feedback): > 75%
- HR satisfaction score: > 4.5/5

**Business:**
- Feature adoption rate: > 70% (HR users creating jobs)
- Candidate conversion (apply → hire): baseline + trending
- Cost per hire reduction: target TBD by stakeholders

---

## 15. FUTURE ROADMAP (Phase 2+)

**Short-term (1-2 months post-launch):**
- Interview scheduling & calendar integration
- Video interview recording & playback
- Offer management workflow
- Advanced analytics dashboard
- Bulk candidate import (CSV)
- API for ATS integrations (LinkedIn, Indeed, Workable)

**Medium-term (3-6 months):**
- Candidate ranking & ML-driven recommendations
- White-labeled job portals (custom domains)
- SSO integrations (SAML, OIDC)
- Advanced permission model (multiple HRs, approval workflows)
- Multi-language support

**Long-term (6-12 months):**
- Full HRMS suite (onboarding, payroll, performance)
- Skill-based marketplace (candidate search pool)
- Predictive hiring analytics
- Global expansion (compliance per region)

---

## CONCLUSION

This outline provides a complete, production-ready specification for the **OptiOHire Watcher Engine** hiring platform. The 5-day implementation plan is aggressive but achievable with focused execution, clear prioritization, and a capable team.

**Key Success Factors:**
1. **Parallel development** (frontend, backend, watcher started simultaneously)
2. **Reusable components** (shared services, models, utilities across services)
3. **Automated testing** (early, comprehensive test coverage)
4. **Clear API contracts** (frontend & backend teams aligned on endpoint specs)
5. **Operational readiness** (monitoring, logging, error handling from Day 1)

**Next Step:** Development team begins implementation on Day 1 with this spec as the north star. Daily standups to track progress, unblock issues, and adjust scope if needed.

---

**Document Prepared By:** Senior Product Engineering  
**Status:** Ready for Dev Audit  
**Last Updated:** May 24, 2026  
**Next Review:** May 29, 2026 (Launch + 0 days)
