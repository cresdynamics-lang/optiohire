# Email Fixes and Diagnostics

## Issues Fixed

### 1. Job Created Email Not Sending

**Problem:** Job creation emails were failing silently with errors only logged to console.

**Fixes:**
- Updated `jobPostingsController.ts` to return email error details in the API response
- Added email error logging to `email_logs` table
- Improved error messages with actionable guidance

**Diagnostics:**
- Check email service status: `GET /api/admin/email-service/check`
- Test email sending: `POST /api/admin/email-service/test` with `{ "to": "your@email.com" }`
- Check email logs: `GET /api/admin/emails` (filter by `status='failed'`)

**Common Causes:**
- Missing email credentials: `MAIL_USER`, `MAIL_PASS` (or `SMTP_USER`, `SMTP_PASS`)
- For Gmail: Must use App Password (not regular password)
- Resend/SendGrid not configured: Set `USE_RESEND=true` + `RESEND_API_KEY` or `USE_SENDGRID=true` + `SENDGRID_API_KEY`

### 2. Email Watcher Not Detecting Emails

**Problem:** Email watcher wasn't matching incoming emails to job postings.

**Fixes:**
- Updated `processEmail` to use `findJobByExactSubject` for consistent matching
- Improved error logging with available jobs list when no match found
- Better subject matching diagnostics

**Email Subject Format Required:**
The email subject MUST match one of these patterns:
- **Best:** `"Job Title at Company Name"` (exact match)
- **Good:** Subject starts with `"Job Title at Company Name"`
- **Acceptable:** Subject contains `"Job Title at Company Name"`
- **Fallback:** Subject contains both job title AND company name (any order)

**Example:**
- ✅ `"Software Engineer at Acme Inc"`
- ✅ `"Re: Software Engineer at Acme Inc"`
- ✅ `"Application for Software Engineer at Acme Inc"`
- ❌ `"Software Engineer"` (missing company name)
- ❌ `"Job Application"` (too generic)

**Diagnostics:**
- Check email reader status: `GET /api/admin/email-reader/status`
- Check backend logs for matching attempts
- Verify IMAP credentials: `IMAP_HOST`, `IMAP_USER`, `IMAP_PASS`
- Ensure `ENABLE_EMAIL_READER` is not set to `'false'`

## New Diagnostic Endpoints

### Email Service Check
```bash
GET /api/admin/email-service/check
```
Returns:
- Connection status
- Provider (resend/sendgrid/smtp)
- Configuration status
- Credentials check

### Test Email Send
```bash
POST /api/admin/email-service/test
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "to": "test@example.com",
  "subject": "Test Email" // optional
}
```

### Email Reader Status
```bash
GET /api/admin/email-reader/status
```
Returns:
- Enabled/running status
- Last processed timestamp
- Last error (if any)
- Configuration check
- Recommendations

## Required Environment Variables

### Email Sending (choose one)

**Option 1: Resend (Recommended)**
```env
USE_RESEND=true
RESEND_API_KEY=re_xxxxx
```

**Option 2: SendGrid**
```env
USE_SENDGRID=true
SENDGRID_API_KEY=SG.xxxxx
```

**Option 3: SMTP (Gmail)**
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your@gmail.com
MAIL_PASS=<app_password>  # NOT your regular password!
MAIL_FROM=applicationsoptiohire@gmail.com
```

### Email Watcher (IMAP)
```env
ENABLE_EMAIL_READER=true
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=applicationsoptiohire@gmail.com
IMAP_PASS=<app_password>  # Gmail App Password
IMAP_SECURE=true
IMAP_POLL_MS=1000  # Poll every 1 second
```

## Troubleshooting Steps

1. **Check email service:**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/admin/email-service/check
   ```

2. **Test email sending:**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"to":"test@example.com"}' \
     http://localhost:3001/api/admin/email-service/test
   ```

3. **Check email reader:**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/admin/email-reader/status
   ```

4. **Check backend logs:**
   ```bash
   pm2 logs optiohire-backend --lines 100
   ```
   Look for:
   - `Failed to send job posting created email`
   - `Could not match email subject`
   - `IMAP connection` errors

5. **Verify job subject format:**
   - When creating a job, the "job created" email includes the exact subject line to use
   - Forward emails using that exact subject line
   - Check logs for "Available jobs" list when no match found

## Next Steps After Deployment

1. Test job creation email by creating a test job
2. Check `/api/admin/email-service/check` to verify email service
3. Send a test email using `/api/admin/email-service/test`
4. Check `/api/admin/email-reader/status` to verify watcher is running
5. Send a test application email with subject matching "Job Title at Company Name"
6. Monitor logs for any errors
