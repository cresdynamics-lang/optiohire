# Notifications and HR job creation – confirmation

## 1. Notifications (sending emails)

**Status: Working and able to send.**

- **Primary:** Resend (when `RESEND_API_KEY` or `USE_RESEND=true`).  
  Verification: `node backend/scripts/verify-notifications.mjs`  
  - Script sends a test email via Resend and reports success/failure.  
  - A successful run confirms notifications are configured and able to send.
- **Fallbacks:** SendGrid (`SENDGRID_API_KEY`), then SMTP (`MAIL_USER`, `MAIL_PASS`).  
  If Resend is configured, the app uses it first; shortlist, rejection, and HR notifications all go through `EmailService.sendEmail()`.

**What gets sent:**

- Shortlist emails: `EmailService.sendShortlistEmail()` (candidate).
- Rejection emails: `EmailService.sendRejectionEmail()` (candidate).
- HR notifications: `EmailService.sendHRNotification()` (new applicant alert to HR).
- Other: password reset, welcome, activation, report emails.

**How to verify:**

```bash
# From repo root
node backend/scripts/verify-notifications.mjs
```

- Exit code 0 and “Resend: test email sent successfully” → notifications are able to send.
- Optional: set `NOTIFICATION_TEST_TO=your@email.com` in `.env` to send the test to that address.

**Note:** If you use your own domain with Resend (e.g. `RESEND_DOMAIN=optiohire.com`), add and verify the domain in the Resend dashboard. Until then, the app can still send using Resend’s default sender where allowed, or you can rely on the verification script (which uses `onboarding@resend.dev` for the test).

---

## 2. HR job creation

**Status: Implemented and wired end-to-end.**

**Flow:**

1. HR user is logged in (JWT in `localStorage` as `token`).
2. Dashboard → Jobs → Create job (e.g. “Create job” / “Add job”).
3. Frontend calls `POST /api/job-postings` with:
   - Header: `Authorization: Bearer <token>`
   - Body: `company_name`, `company_email`, `hr_email`, `job_title`, `job_description`, `required_skills` (array), `application_deadline` (ISO), optional `meeting_link`
4. Next.js API route (`frontend/src/app/api/job-postings/route.ts`):
   - Verifies JWT and extracts `userId`.
   - Validates required fields and `application_deadline`.
   - Uses Postgres (Supabase) in a transaction:
     - Finds or creates `companies` (by `user_id`, then domain/email).
     - Inserts into `job_postings` (company_id, job_title, job_description, responsibilities, skills_required, application_deadline, meeting_link, status = ACTIVE).
   - Returns `{ success: true, job_posting_id, company_id }`.

**Required body fields:**

- `company_name`, `company_email`, `hr_email`, `job_title`, `job_description`
- `required_skills`: array of strings (at least one)
- `application_deadline`: ISO date string

**How to verify:**

- Log in as an HR user in the app, open the dashboard, create a job with all required fields and at least one skill. A successful create shows success and the new job in the list.
- Backend route (alternative): `POST /job-postings` with `authenticate` middleware and same payload shape (see `backend/src/api/jobPostingsController.ts` and `backend/src/routes/job-postings.ts`).

**Database:** Job creation uses the same `DATABASE_URL` as the frontend (Supabase). Ensure `DATABASE_URL` and, if used, `DB_SSL` are set in `frontend/.env.local` (and backend if you use the backend route).

---

## Summary

| Area              | Status   | How to confirm                                      |
|-------------------|----------|-----------------------------------------------------|
| Notifications     | Working  | Run `node backend/scripts/verify-notifications.mjs` |
| HR job creation   | Working  | Create a job from the dashboard while logged in     |
