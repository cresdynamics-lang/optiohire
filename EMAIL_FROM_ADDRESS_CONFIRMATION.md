# Email From Address & Timing Confirmation

## ✅ Confirmed: All Emails Use noreply@optiohire.com

### Configuration
- **RESEND_FROM_EMAIL:** `noreply@optiohire.com` ✅
- **RESEND_FROM_NAME:** `OptioHire` ✅
- **RESEND_DOMAIN:** `optiohire.com` ✅

### Email Types & From Address

| Email Type | From Address | When Sent |
|------------|--------------|-----------|
| **Shortlist Email** | `noreply@optiohire.com` | 5 seconds after CV scoring (SHORTLIST status) |
| **Rejection Email** | `noreply@optiohire.com` | 5 seconds after CV scoring (REJECT status) |
| **Job Creation Email** | `noreply@optiohire.com` | Immediately when job is created |
| **Interview Scheduled** | `noreply@optiohire.com` | Immediately when HR schedules interview |
| **Password Reset** | `noreply@optiohire.com` | Immediately when user requests reset |
| **Email Verification** | `noreply@optiohire.com` | Immediately when user signs up |
| **Welcome Email** | `noreply@optiohire.com` | Immediately after email verification |

---

## ⏱️ Email Timing

### 1. Job Creation Email
**When:** Immediately when job posting is created
**Trigger:** `POST /api/job-postings` (createJobPosting)
**From:** `noreply@optiohire.com`
**To:** HR email, company email, hiring manager email

### 2. Shortlist Email
**When:** 5 seconds after CV is scored and status is SHORTLIST
**Trigger:** Email watcher processes CV → AI scoring → Status = SHORTLIST → Wait 5s → Send
**From:** `noreply@optiohire.com`
**To:** Candidate email
**Code:** `backend/src/server/email-reader.ts` line 1108-1121

### 3. Rejection Email
**When:** 5 seconds after CV is scored and status is REJECT
**Trigger:** Email watcher processes CV → AI scoring → Status = REJECT → Wait 5s → Send
**From:** `noreply@optiohire.com`
**To:** Candidate email
**Code:** `backend/src/server/email-reader.ts` line 1122-1132

### 4. Interview Scheduled Email
**When:** Immediately when HR clicks "Schedule" button
**Trigger:** `POST /api/schedule` (scheduleInterview)
**From:** `noreply@optiohire.com`
**To:** Candidate email, HR email
**Code:** `backend/src/api/scheduleInterviewController.ts` line 92+

### 5. Password Reset Email
**When:** Immediately when user requests password reset
**Trigger:** `POST /api/auth/forgot-password`
**From:** `noreply@optiohire.com`
**To:** User email

### 6. Email Verification Code
**When:** Immediately when user signs up
**Trigger:** `POST /api/auth/signup`
**From:** `noreply@optiohire.com`
**To:** User email

### 7. Welcome Email
**When:** Immediately after email verification
**Trigger:** `POST /api/auth/verify-email`
**From:** `noreply@optiohire.com`
**To:** User email

---

## 🔄 Retry Mechanism

### Email Retry Checker
**Runs:** Every 10 seconds
**Action:** Finds applications missing feedback emails and sends immediately
**From:** `noreply@optiohire.com`
**Timing:** Immediate (no delay when retrying)

---

## 📋 Code Changes Applied

### 1. Updated DEFAULT_FROM_EMAIL
**File:** `backend/src/services/emailService.ts` line 10
**Change:** Now uses `RESEND_FROM_EMAIL` (noreply@optiohire.com) as default

### 2. Updated Shortlist Email
**File:** `backend/src/services/emailService.ts` line 320-321
**Change:** Uses `noreply@optiohire.com` instead of company email

### 3. Updated Rejection Email
**File:** `backend/src/services/emailService.ts` line 395-396
**Change:** Uses `noreply@optiohire.com` instead of company email

---

## ✅ Verification

### Check Current Configuration
```bash
grep RESEND_FROM_EMAIL backend/.env
# Should show: RESEND_FROM_EMAIL=noreply@optiohire.com
```

### Test Email Sending
```bash
cd backend && npx tsx ../scripts/test-optiohire-email.ts
# Should send from: noreply@optiohire.com
```

### Monitor Email Logs
```bash
tail -f backend/logs/app.log | grep "Email sent via Resend"
# Check "from" field in logs
```

---

## 🎯 Summary

✅ **All emails use:** `noreply@optiohire.com`
✅ **Timing:** 
   - Job creation: Immediate
   - Shortlist/Rejection: 5 seconds after scoring
   - Interview scheduled: Immediate
   - Password reset: Immediate
   - Email verification: Immediate
   - Welcome: Immediate
   - Retry checker: Immediate (when found)

**Everything is configured correctly!** 🎉
