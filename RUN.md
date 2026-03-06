# How to run OptioHire (best practice)

## One-time setup

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Database** (PostgreSQL)
   - Ensure PostgreSQL is running (e.g. `brew services start postgresql` on macOS).
   - Create DB and user (if not already done):
     ```bash
     cd backend && ./setup-postgres.sh
     ```
   - Apply schema (creates tables including `email_verification_codes`, `email_logs`):
     ```bash
     npm run db:schema
     ```

3. **Environment**
   - Copy `backend/.env.example` to `backend/.env` and set at least:
     - `DATABASE_URL` (e.g. `postgresql://optiohire_user:optiohire_pass_2024@localhost:5432/optiohire`)
     - For OTP and emails: `RESEND_API_KEY` and `RESEND_FROM_EMAIL`, or SMTP vars (`SMTP_USER`, `SMTP_PASS`).

## Before developing: preflight check

```bash
npm run check
```

This checks database connection and that `email_verification_codes` exists; warns if email (Resend/SMTP) is not configured.

## Run the app

**Option A – Backend and frontend together (recommended)**

```bash
npm run dev:all
```

- Backend: http://localhost:3001  
- Frontend: http://localhost:3000  

**Option B – Separate terminals**

- Terminal 1: `npm run dev:backend`
- Terminal 2: `npm run dev:frontend`

## Health check

- Backend: http://localhost:3001/health  
- Response includes `database.status`, `emailReader`, and optional `cache` (Redis).

## Optional

- **Redis**: Set `REDIS_URL` or `REDIS_ENABLED=true` (and optionally `REDIS_HOST`) in `backend/.env` to enable caching. If you don't run Redis, leave these unset so the app skips Redis and avoids connection errors.
- **Email reader** (inbound applications by email): Set `ENABLE_EMAIL_READER=true` and IMAP vars (`IMAP_HOST`, `IMAP_USER`, `IMAP_PASS`) in `backend/.env`.
