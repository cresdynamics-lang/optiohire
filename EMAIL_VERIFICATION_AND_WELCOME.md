# Email verification on signup and welcome email – confirmation

## Status: **Implemented**

When users create an account:

1. **Verification email with code** – After signup, a 6-digit code is sent to the user’s email. They must enter it on the verification page to confirm their email.
2. **Welcome email from OptioHire** – Once the code is confirmed, a welcome email is sent from OptioHire.

---

## Flow

1. User signs up at **/auth/signup** (name, email, password, company details).
2. Backend (or frontend signup API) creates the user and company, then:
   - Generates a 6-digit verification code.
   - Saves it in **email_verification_codes** (expires in 24 hours).
   - Sends **“Confirm your OptioHire account – verification code”** to the user’s email (via `EmailService.sendEmailVerificationCode`).
3. Frontend redirects to **/auth/verify-email?email=...** so the user can enter the code.
4. User enters the code and submits. Frontend calls **POST /auth/verify-email** with `{ email, code }`.
5. Backend:
   - Validates the code (exists, not used, not expired).
   - Marks the code as used and sets **users.email_verified = true** (if the column exists).
   - Sends **“Welcome to OptioHire – your account is ready”** via `EmailService.sendWelcomeEmail`.
6. User sees “Email confirmed” and is redirected to the dashboard; they receive the welcome email in their inbox.

---

## What you need to do

### 1. Run the migration

Create the table and optional column used for verification:

```bash
# From repo root, with DATABASE_URL set (e.g. in backend/.env)
psql "$DATABASE_URL" -f backend/src/db/migrations/add_email_verification.sql
```

Or run the SQL in your Supabase SQL editor (contents of `backend/src/db/migrations/add_email_verification.sql`).

### 2. Backend must be running for signup

The frontend signup API calls **POST {BACKEND_URL}/auth/send-signup-verification-email** after creating the user. So:

- **NEXT_PUBLIC_BACKEND_URL** must point to your running backend (e.g. `http://localhost:3001`).
- If the backend is down or the migration hasn’t been run, signup still succeeds but no verification email is sent (user goes straight to dashboard).

---

## Files involved

| Area | File |
|------|------|
| Migration | `backend/src/db/migrations/add_email_verification.sql` |
| Verification email | `backend/src/services/emailService.ts` → `sendEmailVerificationCode()` |
| Welcome email | `backend/src/services/emailService.ts` → `sendWelcomeEmail()` |
| Send code after signup | `backend/src/api/authController.ts` → `sendSignupVerificationEmail()` |
| Verify code + send welcome | `backend/src/api/authController.ts` → `verifyEmail()` |
| Routes | `backend/src/routes/auth.ts` → POST `/send-signup-verification-email`, POST `/verify-email` |
| Frontend signup | `frontend/src/app/api/auth/signup/route.ts` (calls backend to send code), `frontend/src/app/auth/signup/page.tsx` (redirects to verify-email) |
| Verify page | `frontend/src/app/auth/verify-email/page.tsx` |

---

## Summary

- **Account creation** → verification email with **code** is sent to the user’s email.
- **After they confirm** → they receive a **welcome email from OptioHire**.
- Run the migration and keep the backend up so the verification email is sent and the welcome email is sent after verification.
