# Groq parse/rank results and shortlist/rejection emails – confirmation

## 1. Groq parse, rank, and results (shortlisted / flagged / rejected)

**Flow**

- CV PDF/DOC is turned into **plain text** in `backend/src/lib/cv-parser.ts` (pdf-parse + mammoth). Only this text is sent to Groq (no binary/base64).
- **Parsing (resume structure):** `backend/src/services/ai/resumeParser.ts` – `parseResumeText(text)` calls Groq when `AI_PROVIDER=groq` and returns structured JSON (personal, skills, education, experience, links, etc.).
- **Ranking (scoring):** `backend/src/lib/ai-scoring.ts` – `AIScoringEngine.scoreCandidate({ job, company, cvText })` calls Groq when `AI_PROVIDER=groq`, gets `{ score, status, reasoning }`.
- **Result statuses:** Groq returns `SHORTLIST` | `FLAGGED` | `REJECTED`. These are stored in the DB as `SHORTLIST` | `FLAG` | `REJECT` (FLAGGED → FLAG, REJECTED → REJECT).

**Where Groq is used**

- **Inbound email (CV attachment):** `backend/src/server/email-reader.ts` – `processCandidateCV()` uses CVParser → `parsed.textContent` → `aiScoring.scoreCandidate({ cvText: parsed.textContent, job, company })` → Groq → then sends shortlist or rejection email.
- **Manual score API:** `backend/src/api/applicationsController.ts` – `scoreApplication()` uses `parsed_resume_json.textContent` as `cvText` when present and calls `AIScoringEngine.scoreCandidate()` (Groq). If no CV text, it falls back to rule-based `screening.scoreCandidate(parsed, job)`.
- **Batch scoring:** `backend/src/services/ai/batchScoring.ts` uses `AIScoringEngine` (Groq when configured).

So **Groq is used to parse (resume structure), rank (score 0–100), and assign result: shortlisted, flagged, or rejected.**

---

## 2. APIs involved

| API | Method | Route (backend) | Purpose |
|-----|--------|------------------|---------|
| Trigger email parsing | POST | `/applications/parse-email` | Starts IMAP ingestion (inbound CVs → parse → Groq score → shortlist/reject emails). |
| Score application (manual) | POST | `/applications/score` | Body: `{ application_id, job_posting_id }`. Scores with Groq when CV text exists, updates DB, then sends shortlist or rejection email. |

**Email sending (internal, not REST)**

- **Shortlist:** `EmailService.sendShortlistEmail({ candidateEmail, candidateName, jobTitle, companyName, companyEmail?, companyDomain?, interviewLink?, interviewDate?, interviewTime? })`
- **Rejection:** `EmailService.sendRejectionEmail({ candidateEmail, candidateName, jobTitle, companyName, companyEmail?, companyDomain? })`

Both are used from:

- `backend/src/server/email-reader.ts` (after Groq scoring from inbound CV).
- `backend/src/api/applicationsController.ts` (after POST `/applications/score`).
- `backend/scripts/resend-email-notifications.ts` (resend existing shortlist/rejection emails).

---

## 3. Templates for shortlist and rejection emails

**Implementation:** `backend/src/services/emailService.ts`

### Shortlist email (to applicants who are shortlisted)

- **Method:** `sendShortlistEmail(data)` — **sent to `data.candidateEmail`** (the applicant’s email).
- **Subject:** `Final Interview Invitation – {jobTitle} at {companyName}`
- **Content (HTML + plain text):** Congratulates, shortlisted for next stage; interview details (position, company, date, time, meeting link); contact HR.
- **From:** Resend/SendGrid/SMTP via `getCompanyEmail()`.

### Rejection email (to applicants who are not selected)

- **Method:** `sendRejectionEmail(data)` — **sent to `data.candidateEmail`** (the applicant’s email).
- **Subject:** `Update on Your Application for the {jobTitle} Position at {companyName}`
- **Content (HTML + plain text):** Thanks for applying; we will not be moving forward; encourages future applications; contact for feedback.
- **From:** Same as shortlist.

**Delivery:** Both go through `EmailService.sendEmail()` (Resend → SendGrid → SMTP). **Confirmed:** Shortlist and rejection emails are sent to the applicant’s email (`application.email` / `app.email`) when status is SHORTLIST or REJECT. Run `NOTIFICATION_TEST_TO=applicant@example.com node backend/scripts/verify-notifications.mjs` to send test shortlist + rejection emails to that address and validate delivery.

---

## 4. Summary

- **Groq** is used to **parse** (resume text → structure) and **rank** (score 0–100 and status).
- **Results** are **shortlisted**, **flagged**, or **rejected** (stored as `SHORTLIST`, `FLAG`, `REJECT`).
- **APIs:** `POST /applications/parse-email` (trigger inbound flow), `POST /applications/score` (manual score + optional shortlist/rejection email).
- **Templates:** Shortlist and rejection emails are implemented in `emailService.ts` via `sendShortlistEmail` and `sendRejectionEmail`, with HTML and text bodies and company-branded subject/from where configured.
