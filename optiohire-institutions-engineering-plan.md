# OptioHire — Institutions Module
## Engineering Plan

**Author:** [Your name]
**For review by:** Brian
**Status:** Draft for engineering review
**Scope:** Bulk institutional onboarding, cohort tracking, and placement analytics for universities, colleges, and TVET institutions

---

## 1. Problem Statement

Today OptioHire onboards candidates one at a time — via the web form, a shareable job link, or inbound email (see `README.md`, "Application Channels"). Institutions (universities, colleges, TVET/polytechnics) want to bring their entire graduating class — often 300–600+ students — into OptioHire in one action, and then track that specific cohort's outcomes over time: who activated their account, who got shortlisted, who is interning, who got hired.

This is a new relationship type that doesn't exist in the current schema: **Institution → Cohort → Candidate**, sitting on top of the existing **Candidate → Application → Job** pipeline. The Watcher Engine, scoring pipeline, and Talent Pool logic should not need to change — institution-sourced candidates are still just candidates. What's new is a layer above them for bulk creation, grouping, and reporting.

## 2. Goals

- Let an institution admin upload a CSV/Excel of students and create verified OptioHire accounts for all of them in one operation.
- Group those candidates into a **Cohort** (e.g. "2026 · Informatics & Business IT") with metadata: academic level (Certificate / Diploma / Degree / Postgraduate) and placement track(s) (Internship / Industrial Attachment / Job-Ready Graduate).
- Send each student a personalized onboarding email to activate their account and complete/confirm their profile and CV.
- Give institution staff a dashboard to track the cohort's funnel (Enrolled → Activated → Shortlisted → Interviewing → Placed/Interning) and drill into individual students.
- Preserve full audit trail of what was sent, to whom, and when.
- Fit cleanly into the existing Watcher Engine (Job 1/2/3) and Talent Pool without special-casing institution candidates in the scoring logic.

## 3. Non-Goals (for this phase)

- Direct SIS (Student Information System) integrations (Phase 3 — see §11).
- Institutions posting jobs on behalf of employers.
- Automated degree/transcript verification.
- Payment/billing for institutions (assume free tier for now, pricing TBD by product).

## 4. Key Concepts

| Term | Definition |
|---|---|
| **Institution** | A university/college/TVET tenant with its own admins, branding, and candidate pool. |
| **Institution Admin** | A staff user (career services officer, registrar liaison) with role-based access to one institution. |
| **Cohort** | A named batch of students onboarded together, tagged with academic level + placement track(s) + expected completion date. |
| **Academic Level** | `certificate` \| `diploma` \| `degree` \| `postgraduate` |
| **Placement Track** | One or more of `internship`, `attachment`, `job_ready`. Determines which job postings/roles a candidate in this cohort can be matched against. |
| **Roster Entry** | A single candidate's row within a cohort — links a `candidates` record to a `cohort_id` and carries institution-specific fields (student ID, department). |

## 5. Data Model

New tables (Postgres, additive — no changes to existing `candidates`, `applications`, `jobs` tables beyond one nullable FK).

```sql
-- Institutions (tenant)
CREATE TABLE institutions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  country           TEXT DEFAULT 'KE',
  contact_email     TEXT NOT NULL,
  brand_accent_hex  TEXT DEFAULT '#1F4D3D',
  email_signature   TEXT,
  sis_sync_enabled  BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Institution staff accounts + roles
CREATE TABLE institution_admins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users(id),                -- reuse existing auth users table
  role           TEXT NOT NULL CHECK (role IN ('owner','roster_manager','viewer')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Cohorts
CREATE TABLE cohorts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id     UUID REFERENCES institutions(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,                         -- "2026 · Informatics & Business IT"
  programme          TEXT,
  academic_level      TEXT CHECK (academic_level IN ('certificate','diploma','degree','postgraduate')),
  placement_tracks    TEXT[] NOT NULL,                       -- e.g. {'attachment','job_ready'}
  expected_completion DATE,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active','closed','archived')),
  source_filename     TEXT,                                  -- audit: original upload file
  created_by          UUID REFERENCES institution_admins(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Roster: link candidates to a cohort + institution-specific fields
CREATE TABLE cohort_candidates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id      UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  candidate_id   UUID REFERENCES candidates(id) ON DELETE CASCADE,
  student_id     TEXT,                                       -- e.g. STR/2026/0142
  department     TEXT,
  row_status     TEXT DEFAULT 'invited' CHECK (
                    row_status IN ('enrolled','invited','activated','requires_review')
                  ),
  invited_at     TIMESTAMPTZ,
  activated_at   TIMESTAMPTZ,
  raw_row        JSONB,                                       -- original CSV row, for audit/reprocessing
  UNIQUE(cohort_id, candidate_id)
);

-- One nullable FK added to existing candidates table
ALTER TABLE candidates ADD COLUMN source_institution_id UUID REFERENCES institutions(id);

-- Bulk upload batches (audit + reprocessing)
CREATE TABLE cohort_uploads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id        UUID REFERENCES cohorts(id),
  original_filename TEXT,
  row_count        INT,
  valid_rows       INT,
  duplicate_rows   INT,
  flagged_rows     INT,
  column_mapping   JSONB,                                     -- persisted CSV-column -> field mapping
  status           TEXT DEFAULT 'processing' CHECK (
                     status IN ('processing','mapped','sent','failed')
                    ),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Notification log (institution-facing view of Resend sends)
CREATE TABLE institution_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  UUID REFERENCES institutions(id),
  cohort_id       UUID REFERENCES cohorts(id),
  type            TEXT CHECK (type IN ('onboarding_invite','reminder','shortlist_alert','placement_confirmation')),
  recipients      INT,
  opened          INT DEFAULT 0,
  activated       INT DEFAULT 0,
  sent_at         TIMESTAMPTZ DEFAULT now()
);
```

**Why a join table (`cohort_candidates`) instead of a `cohort_id` column directly on `candidates`?** A candidate could theoretically belong to more than one cohort over time (e.g. re-enrolling for a postgraduate cohort a year after their undergraduate one). The join table also cleanly carries institution-only fields (student ID, department) without polluting the core `candidates` table used by every other channel.

## 6. Bulk Upload Pipeline

Reuses the existing file-handling and queue infrastructure (S3/MinIO + BullMQ) already in the Watcher Engine.

```
1. Admin creates Cohort (name, academic level, placement tracks, expected completion)
2. Admin uploads CSV/XLSX  →  POST /api/institutions/:id/cohorts/:cohortId/uploads
     → stored in S3, cohort_uploads row created (status: processing)
     → server-side parse (papaparse / xlsx) — detect headers, row count, encoding
3. Field mapping UI: admin maps CSV columns → {full_name, email, student_id, department, phone, grad_year}
     → mapping persisted to cohort_uploads.column_mapping (also reusable as a template for next year's upload)
4. Validation pass (synchronous, <5s for 5,000 rows):
     - required: full_name, email
     - email format + duplicate detection (within file AND against existing cohort_candidates)
     - flag rows missing required fields → status: requires_review, never silently dropped
5. Admin confirms → POST /api/institutions/:id/cohorts/:cohortId/commit
     → for each valid row:
         a. upsert `candidates` row (source_institution_id set, status: invited)
         b. create `cohort_candidates` row (row_status: invited, raw_row stored)
         c. enqueue 'send-institution-invite' BullMQ job
6. Worker sends onboarding email via Resend (template below), updates institution_notifications
7. On candidate activation (existing auth flow) → webhook/hook updates cohort_candidates.row_status = 'activated'
```

**Idempotency / re-upload safety:** uploading the same file twice, or a corrected file for the same cohort, must not create duplicate candidates. Match on `(institution_id, email)` — if a candidate already exists for this institution, update rather than insert, and skip re-sending the invite unless the admin explicitly clicks "resend."

**Rate limiting:** bulk invite sends are chunked (e.g. 50/batch) with backoff, both to respect Resend's rate limits and to avoid a thundering herd against the auth service.

## 7. API Surface (new endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/institutions` | Create institution (internal/admin only at launch) |
| GET | `/api/institutions/:id/dashboard` | Aggregate stats for Overview screen |
| POST | `/api/institutions/:id/cohorts` | Create a cohort (name, level, tracks, completion date) |
| GET | `/api/institutions/:id/cohorts` | List cohorts + funnel summary per cohort |
| POST | `/api/institutions/:id/cohorts/:cid/uploads` | Upload + parse a roster file |
| PATCH | `/api/institutions/:id/cohorts/:cid/uploads/:uid/mapping` | Save column mapping |
| GET | `/api/institutions/:id/cohorts/:cid/uploads/:uid/preview` | Return parsed preview + validation summary |
| POST | `/api/institutions/:id/cohorts/:cid/uploads/:uid/commit` | Create candidates + enqueue invites |
| GET | `/api/institutions/:id/cohorts/:cid/roster` | Paginated roster with filters (status, department) |
| POST | `/api/institutions/:id/cohorts/:cid/roster/:candidateId/resend-invite` | Resend a single invite |
| GET | `/api/institutions/:id/notifications` | Notification log |
| GET | `/api/institutions/:id/admins` | List institution staff + roles |
| POST | `/api/institutions/:id/admins/invite` | Invite a new institution staff member |

All endpoints scoped by `institution_id` and enforced via an `institutionAdminAuth` middleware that checks the `institution_admins` row for the authenticated user + required role.

## 8. Frontend (Next.js — `frontend/app/institutions/`)

```
app/institutions/
├── [institutionId]/
│   ├── layout.tsx                 # sidebar shell, institution context
│   ├── page.tsx                   # Overview (stat cards + ledger funnel)
│   ├── onboarding/
│   │   └── page.tsx               # 5-step wizard (client component, wizard state in React state/useReducer)
│   ├── roster/page.tsx            # searchable/filterable table
│   ├── tracker/page.tsx           # kanban view (reuses roster data, grouped by row_status)
│   ├── notifications/page.tsx
│   ├── cohorts/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── SealBadge.tsx               # status badge component (enrolled/invited/activated/shortlisted/...)
│   ├── LedgerFunnel.tsx
│   ├── UploadWizard/
│   │   ├── StepCohortDetails.tsx
│   │   ├── StepUpload.tsx          # dropzone + upload/parse states
│   │   ├── StepMapFields.tsx
│   │   ├── StepReview.tsx
│   │   └── StepSend.tsx
│   └── CohortCard.tsx
```

The static HTML mockup already built (`institution-dashboard.html`) maps directly to this structure — it's a useful reference for Brian on exact layout/spacing/interaction before componentizing into React.

## 9. Integration with the Watcher Engine

No changes needed to `extractApplicant.ts`, `matchJob.ts`, or `notifyHR.ts`. Institution-sourced candidates flow through Job 1 and Job 2 exactly like any other candidate — the only difference is:

- `candidates.source_institution_id` is set (for filtering/reporting).
- `cohort_candidates.row_status` is updated by a lightweight event listener whenever the candidate's overall status changes (e.g. `shortlisted`, `interview_scheduled`, `hired`) — this is what powers the roster/tracker views without touching core scoring logic.
- The nightly reconciliation cron gains one additional step: re-check `cohort_candidates` for status drift and refresh cached funnel counts used by the Overview dashboard (avoids expensive aggregate queries on every page load).

## 10. Security & Compliance Notes

- **Multi-tenancy isolation**: every query must be scoped by `institution_id`; add a Postgres RLS (row-level security) policy on `cohorts`, `cohort_candidates`, and `institution_notifications` as defense-in-depth against a missed `WHERE` clause.
- **File upload safety**: reuse existing CV/document upload validation (file type allowlist, size cap, virus scan if available) for the roster CSV/XLSX itself.
- **PII handling**: student rosters contain names, emails, phone numbers, and student IDs for minors in some TVET contexts — confirm data retention and consent language in the onboarding email meets Kenya's Data Protection Act 2019 requirements. Flag for legal review.
- **Prompt injection defense**: unaffected — institution roster data never reaches the CV-scoring LLM prompt directly; it's structured fields, not free text passed to the model.

## 11. Phased Rollout

**Phase 1 — MVP (this plan)**
CSV/XLSX upload, cohort creation with level + track tagging, roster + tracker + notifications dashboards, manual re-upload for corrections.

**Phase 2 — Quality of life**
Saved column-mapping templates per institution, bulk resend/reminder scheduling, CSV export of roster, per-cohort placement-rate reporting exportable as PDF for institution leadership.

**Phase 3 — SIS Integration**
Direct feed from a university's Student Information System (e.g. nightly SFTP drop or API pull) to replace manual CSV upload for larger institutions — flagged as "Not connected" in Settings today, this becomes a real integration point.

## 12. Open Questions for Brian

1. Do we want `cohort_candidates.row_status` as a denormalized cache of the candidate's true pipeline status, or should the roster/tracker views always join live against `applications`? (Recommend: cache + event-driven refresh, for dashboard performance at 600+ rows.)
2. Should an institution admin be able to see a candidate's full match reasoning/score (as HRs do), or a simplified view? Privacy/product question as much as engineering.
3. Multiple institutions could plausibly onboard the *same* candidate (e.g. a student transferring, or a TVET partner + university dual enrollment) — do we allow one `candidates` row to have multiple `source_institution_id` associations via a join table instead of a single FK? Current plan assumes one primary institution; flag if that's wrong.
4. Auth: do institution admins get a fully separate login surface from HR users, or shared login with a role switcher? Affects `institution_admins` vs. reusing the existing `users`/HR auth table.

## 13. Rough Estimate

| Workstream | Estimate |
|---|---|
| Schema + migrations | 2–3 days |
| Bulk upload pipeline (parse, validate, commit, queue) | 4–5 days |
| API endpoints + auth middleware | 3–4 days |
| Frontend: Overview + Roster + Tracker | 5–6 days |
| Frontend: Onboarding wizard (5 steps) | 4–5 days |
| Notifications log + Resend template work | 2 days |
| Cohorts + Settings screens | 2–3 days |
| Testing (unit + integration on upload edge cases) | 3 days |
| **Total** | **~4–5 weeks**, one full-stack engineer, assuming existing Watcher Engine untouched |

---

*Reference: static HTML/CSS mockup of the full institution dashboard (Overview, Bulk Onboarding wizard, Roster, Tracker, Notifications, Cohorts, Settings) attached separately — `institution-dashboard.html`.*
