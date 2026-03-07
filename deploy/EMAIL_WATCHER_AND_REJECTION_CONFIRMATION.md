# Email watcher and rejection emails – confirmation

## Summary

- **Rejection emails** and **shortlist emails** are sent automatically when the system scores an application (from the email watcher or from manual scoring). There is no env flag to disable them.
- **Email watcher** is active when `ENABLE_EMAIL_READER=true` and IMAP is configured. It watches the applications inbox and matches incoming emails to **active** job postings. Once a job is created and posted (status ACTIVE), it is included in matching.

---

## 1. Rejection (and shortlist) emails

**When they are sent**

- **From the email watcher:** When an application is created from an incoming email, the CV is parsed, scored by AI (Groq), and the status is set to SHORTLIST, FLAG, or REJECT. If status is **SHORTLIST**, a shortlist email is sent to the candidate. If status is **REJECT**, a rejection email is sent.
- **From manual scoring:** When HR uses “Score” on an application (e.g. `POST /applications/score`), the same logic runs and shortlist/rejection emails are sent based on the result.

**Required for sending**

- **Backend .env:** Resend or SMTP must work (e.g. `USE_RESEND=true` + `RESEND_API_KEY`, or `MAIL_HOST` / `MAIL_USER` / `MAIL_PASS`). From address should be `applicationsoptiohire@gmail.com` (or your configured from address).

**Code references**

- `backend/src/server/email-reader.ts` (after CV scoring): sends shortlist or rejection email when `scoringResult.status === 'SHORTLIST'` or `'REJECTED'`.
- `backend/src/api/applicationsController.ts`: same for manual scoring.
- `backend/src/services/emailService.ts`: `sendRejectionEmail`, `sendShortlistEmail`.

---

## 2. Email watcher (reader)

**When it is active**

- Backend starts the email reader only if **`ENABLE_EMAIL_READER` is not `'false'`** (so `true` or unset = enabled).
- IMAP must be configured: `IMAP_HOST`, `IMAP_USER`, `IMAP_PASS` (and optionally `IMAP_PORT`, `IMAP_SECURE`, `IMAP_POLL_MS`).

**What it watches**

- The inbox of **`IMAP_USER`** (e.g. `applicationsoptiohire@gmail.com`).
- It polls every `IMAP_POLL_MS` ms (default 10000 = 10 seconds; can be 1000 for 1 second).

**How jobs are matched**

- The watcher loads all **active** job postings (`status` ACTIVE or null or empty) from `job_postings` joined with `companies`.
- For each new email, the **subject** is matched to jobs using:
  - **Best:** subject equals or contains **"Job Title at Company Name"** (e.g. `Software Engineer at Acme Inc`).
  - **Fallback:** subject contains both the job title and company name (in any order).
  - **Title-only:** if only the job title appears (no company name) and several companies have that role, applications are created for **all** matching jobs.
- So once a job is **created and has status ACTIVE**, it is included in this list and can receive matching applications.

**Flow after a match**

1. Email is fetched from the inbox.
2. Subject is matched to one or more jobs (see above).
3. CV attachment is extracted; an **application** record is created.
4. CV is scored by AI (Groq); `ai_status` is set to SHORTLIST, FLAG, or REJECT.
5. **Shortlist or rejection email** is sent to the candidate when status is SHORTLIST or REJECT.
6. HR notification (new application) is sent; milestone notifications (e.g. 10, 50 applications) if configured.

**Health check**

- `GET /health/email-reader` returns whether the reader is enabled and running (and last error if any).

---

## 3. Checklist for your server

Ensure backend `.env` has:

| Variable | Purpose |
|----------|--------|
| `ENABLE_EMAIL_READER=true` | Turns on the email watcher. |
| `IMAP_HOST=imap.gmail.com` | Inbox to watch. |
| `IMAP_PORT=993` | IMAP port. |
| `IMAP_USER=applicationsoptiohire@gmail.com` | Inbox address. |
| `IMAP_PASS=<app password>` | Gmail App Password for that inbox. |
| `IMAP_SECURE=true` | Use TLS. |
| `IMAP_POLL_MS=10000` | Poll interval (ms). |
| Resend or SMTP (MAIL_* / SMTP_*) | So shortlist/rejection (and other) emails can be sent. |

**Verify**

1. Create a job from the dashboard (subject line in the “job created” email will be like **"Job Title at Company Name"**).
2. Forward or send a test email to `applicationsoptiohire@gmail.com` with that **exact subject** and a CV attachment.
3. Check backend logs for “Processing email”, “MATCH”, “Sending shortlist/rejection email”.
4. Call `GET http://your-backend:3001/health/email-reader` to confirm reader is enabled and running.

Once the above env is set and the job is created, the watcher watches all active jobs that match the subject, and rejection (and shortlist) emails are sent when the AI sets status to REJECT or SHORTLIST.
