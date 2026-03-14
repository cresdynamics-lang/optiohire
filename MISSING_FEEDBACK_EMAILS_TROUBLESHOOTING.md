# Missing Feedback Emails - Troubleshooting Guide

## 🔍 Issue
Feedback emails (shortlist/rejection) are not being sent to applicants after CV processing.

## 🔧 Immediate Actions

### 1. Check Backend Logs
```bash
# Watch logs in real-time
tail -f backend/logs/app.log | grep "\[EMAIL WATCHER\]"

# Or check for errors
tail -100 backend/logs/app.log | grep -E "EMAIL WATCHER|Failed to send|email.*error" -i
```

**Look for:**
- `📧 [EMAIL WATCHER] Sending shortlist/rejection email` - Email attempt started
- `✅ [EMAIL WATCHER] Email sent successfully` - Email sent
- `❌ [EMAIL WATCHER] Failed to send` - Email failed (check error message)

### 2. Check Recent Applications
```bash
cd backend && npx tsx ../scripts/check-missing-feedback-emails.ts
```

This will show:
- Recent applications
- Which ones are missing emails
- Status and scores

### 3. Retry Missing Emails
```bash
cd backend && npx tsx ../scripts/retry-missing-emails.ts
```

This will:
- Find applications with SHORTLIST/REJECT status
- Check if emails were sent
- Retry sending missing emails

### 4. Check Email Service Configuration
```bash
# Check .env file
grep -E "USE_RESEND|RESEND_API_KEY|RESEND_FROM_EMAIL|SMTP" backend/.env
```

**Required:**
- `USE_RESEND=true` OR `SMTP_HOST` configured
- `RESEND_API_KEY` set (if using Resend)
- `RESEND_FROM_EMAIL` set (should be `noreply@optiohire.com`)
- `SMTP_USER` and `SMTP_PASS` set (if using SMTP fallback)

## 🐛 Common Issues

### Issue 1: Email Service Not Initialized
**Symptoms:**
- Logs show "Email transporter not initialized"
- No email attempts in logs

**Fix:**
- Check `.env` configuration
- Restart backend after changing `.env`
- Verify SMTP credentials are correct

### Issue 2: Resend API Failing
**Symptoms:**
- Logs show "Resend failed" or "domain not verified"
- Emails fallback to SMTP

**Fix:**
- Verify `optiohire.com` domain is verified in Resend dashboard
- Check `RESEND_FROM_EMAIL` uses verified domain
- Ensure `RESEND_API_KEY` is valid

### Issue 3: Status Check Logic Issue
**Symptoms:**
- Applications scored but no email sent
- Status is SHORTLIST/REJECT but email not triggered

**Fix:**
- Check logs for "Email sending decision" message
- Verify status matches exactly: `SHORTLIST` or `REJECT`/`REJECTED`
- FLAG status does NOT trigger emails (by design)

### Issue 4: Silent Failures
**Symptoms:**
- No error logs but emails not sent
- Email attempts logged but no success confirmation

**Fix:**
- Check email service error handling
- Verify email logs table (`email_logs`)
- Check network connectivity
- Verify SMTP/Resend credentials

## 📋 Debugging Steps

### Step 1: Verify Email Watcher is Processing
```bash
curl http://localhost:3001/health/email-reader | jq '.emailReader'
```

Should show:
- `enabled: true`
- `running: true`
- `lastProcessedAt: recent timestamp`

### Step 2: Check Email Logs Table
```sql
SELECT 
  recipient_email,
  email_type,
  status,
  sent_at,
  created_at,
  error_message
FROM email_logs
WHERE email_type IN ('shortlist', 'rejection')
  AND created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Look for:**
- `status = 'sent'` - Email sent successfully
- `status = 'failed'` - Email failed (check `error_message`)
- Missing entries - Email not attempted

### Step 3: Test Email Service Directly
```bash
cd backend && npx tsx ../scripts/test-optiohire-email.ts
```

This will:
- Test email sending with current configuration
- Show if Resend/SMTP is working
- Display any errors

### Step 4: Check Application Status
```sql
SELECT 
  application_id,
  email,
  ai_status,
  ai_score,
  created_at
FROM applications
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Verify:**
- `ai_status` is `SHORTLIST` or `REJECT` (not `FLAG` or `PENDING`)
- `ai_score` is set (not NULL)
- Application was created recently

## 🔧 Fixes Applied

### Enhanced Error Logging
- Added detailed error logging in email watcher
- Console output for immediate visibility
- Full error stack traces

### Retry Script
- `scripts/retry-missing-emails.ts` - Retry sending missing emails
- Checks email_logs before retrying
- Handles both SHORTLIST and REJECT statuses

## 📞 Next Steps

1. **Check logs** - Look for email sending errors
2. **Run retry script** - Send missing emails manually
3. **Verify configuration** - Check .env settings
4. **Test email service** - Ensure Resend/SMTP works
5. **Monitor** - Watch logs while sending new applications

## ✅ Expected Behavior

When an application is processed:
1. ✅ CV extracted and scored
2. ✅ Status set to SHORTLIST/FLAG/REJECT
3. ✅ **Email sent immediately** (if SHORTLIST or REJECT)
4. ✅ Email logged in `email_logs` table
5. ✅ Success confirmation in logs

If any step fails, check logs for detailed error messages.
