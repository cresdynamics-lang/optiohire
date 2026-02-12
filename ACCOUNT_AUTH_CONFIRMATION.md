# Account creation, reset links, JWT, and passwords – confirmation

## 1. Exact admin account

| Item | Value |
|------|--------|
| **Admin email** | `admin@optiohire.com` |
| **Admin password** | `OptioHire@Admin` |
| **Where** | Frontend admin login: `frontend/src/app/admin/login/page.tsx` (hardcoded `ADMIN_USERS` and `ADMIN_PASSWORD`). |
| **Backend** | `backend/src/middleware/auth.ts`: `ADMIN_EMAILS` defaults to `['admin@optiohire.com']` when env is not set. |

Admin login does **not** use the database or JWT. It checks email against `ADMIN_USERS` and password against `ADMIN_PASSWORD`, then stores `admin_session` in `localStorage`. For the backend to recognise the same admin (e.g. bypass), ensure a user exists in `users` with `email = admin@optiohire.com` and `role = 'admin'`, or use the admin bypass headers with `ADMIN_EMAILS` / `ADMIN_SECRET_TOKEN` in env.

To create the admin user in the DB (so backend APIs see them as admin):

```bash
cd backend
ADMIN_EMAIL=admin@optiohire.com ADMIN_PASSWORD=OptioHire@Admin node scripts/create-admin-user.cjs
```

---

## 2. Account creation (HR / user signup)

| Step | Detail |
|------|--------|
| **Entry** | Frontend: `/auth/signup` → form submit → `useAuth().signUp(...)` |
| **API** | `POST /api/auth/signup` (Next.js route: `frontend/src/app/api/auth/signup/route.ts`) |
| **DB** | Same DB as backend (`DATABASE_URL` in frontend). Inserts into `users` and `companies`. |
| **Password** | `bcryptjs.hash(password, 10)` (SALT_ROUNDS = 10). Stored in `users.password_hash`. |
| **Response** | JWT (see below) + user + company. Token stored in `localStorage` as `token`. |

Required body: `name`, `email`, `password`, `company_role` (`hr` | `hiring_manager`), `organization_name` (company_name), `company_email`, `hr_email` (can equal company_email), `hiring_manager_email`.

Backend also exposes `POST /auth/signup` (same logic, optional signup approval queue). The app’s signup flow uses the **Next.js** route above.

---

## 3. Reset links and password reset flow

There is **no clickable reset link** in the email. The flow is **code-based**:

1. User goes to **Forgot password** (`/auth/forgot-password`).
2. Submits **email** → `POST` to backend `POST /auth/forgot-password`.
3. Backend: looks up user, generates **6-digit code**, saves in `password_reset_tokens` (token = code, expires in 1 hour), sends email via `EmailService.sendPasswordResetCode(email, name, resetCode)`.
4. User receives email with the **6-digit code** (no URL).
5. User enters the **code** on the same forgot-password page (step 2) → `POST` to backend `POST /auth/verify-reset-code` with `{ email, code }`.
6. If valid, frontend redirects to **reset password** with query params:  
   `/auth/reset-password?email=<email>&code=<code>`  
   This is the effective “reset link” (same origin, no token in path).
7. Reset page verifies code again via `POST /auth/verify-reset-code`, then user submits new password → `POST /auth/reset-password` with `{ email, code, password }`.
8. Backend: verifies code, hashes new password with bcrypt (SALT_ROUNDS = 10), updates `users.password_hash`, marks token used.

**Tables:** `password_reset_tokens` (token_id, user_id, token, expires_at, used, created_at). The `token` column holds the **6-digit code** (string).

**Expiry:** 1 hour (`RESET_TOKEN_EXPIRY_HOURS` in `backend/src/api/authController.ts`).

---

## 4. JWT

| Item | Value |
|------|--------|
| **Secret** | `process.env.JWT_SECRET` in both frontend and backend. **Must be identical** so tokens issued by the frontend are accepted by the backend (e.g. `/api/user/me`, job-postings auth). |
| **Default (fallback)** | Backend and frontend code both use the same long fallback string if `JWT_SECRET` is unset (see `authController.ts`, `auth.ts`, `signup/route.ts`, `signin/route.ts`). In production, set `JWT_SECRET` in both `frontend/.env.local` and `backend/.env` to the **same** value. |
| **Payload** | `{ sub: user_id, email: string }` (signup route omits role; signin can include role). Backend signin/signup use `{ sub, email, role }`. |
| **Expiry** | `expiresIn: '7d'` (7 days). |
| **Where used** | Issued: frontend `POST /api/auth/signup`, `POST /api/auth/signin`; backend `POST /auth/signup`, `POST /auth/signin`. Verified: frontend `POST /api/job-postings`, `GET /api/job-postings`, etc.; backend `authenticate` middleware and `/api/user/me`. |

**Aligned secrets:** `frontend/.env.local` and `backend/.env` should both set the same `JWT_SECRET` (e.g. `optiohire_jwt_secret_change_in_production_2024`) so one token works everywhere.

---

## 5. Passwords

| Item | Detail |
|------|--------|
| **Hashing** | **Backend:** `bcrypt` (node), SALT_ROUNDS = 10. **Frontend (signup/signin API routes):** `bcryptjs`, SALT_ROUNDS = 10. |
| **Storage** | `users.password_hash` (text). |
| **Sign-in check** | `bcrypt.compare(plainPassword, user.password_hash)` (backend and frontend signin route). |
| **Reset** | New password hashed with `bcrypt.hash(password, 10)` in backend before `UPDATE users SET password_hash = $1`. |
| **Reset password rules** | Backend: length ≥ 8. Frontend reset form: min 8, plus uppercase, lowercase, number, special character. |

---

## 6. Quick checklist

- [ ] **Admin:** Log in at `/admin/login` with `admin@optiohire.com` / `OptioHire@Admin`. Create DB admin user with `create-admin-user.cjs` if backend must recognise this admin.
- [ ] **JWT_SECRET:** Same value in `frontend/.env.local` and `backend/.env`.
- [ ] **Account creation:** Sign up at `/auth/signup`; token and user returned; password stored hashed.
- [ ] **Reset:** Request code at `/auth/forgot-password` → get email with 6-digit code → enter code → redirect to `/auth/reset-password?email=...&code=...` → set new password.
- [ ] **password_reset_tokens:** Table exists (migration `add_password_reset_tokens.sql`); `token` holds the 6-digit code.
