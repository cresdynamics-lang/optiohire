# Email Functionality Confirmation

## ✅ Email Services Status

### 1. Email Watcher (Receiving Emails)

**Status:** ✅ **ACTIVE AND RUNNING**

- **Enabled:** Yes (`ENABLE_EMAIL_READER=true`)
- **Running:** Yes
- **IMAP Host:** `imap.gmail.com:993`
- **IMAP User:** `applicationsoptiohire@gmail.com`
- **IMAP Secure:** Yes (TLS)
- **Poll Interval:** 10 seconds (checks inbox every 10 seconds)
- **Last Processed:** Active (checking inbox continuously)
- **Last Error:** None

**What it does:**
- Monitors inbox for new job application emails
- Matches email subjects to active job postings
- Extracts CV attachments (PDF/DOCX)
- Processes CVs through AI screening
- Creates application records automatically

### 2. Email Sending Service (Sending Emails)

**Status:** ✅ **CONFIGURED AND READY**

- **Primary Provider:** Resend API
- **Resend API Key:** Configured (primary, secondary, fallback keys)
- **Fallback Provider:** SMTP (Gmail)
- **SMTP Host:** `smtp.gmail.com`
- **SMTP User:** `applicationsoptiohire@gmail.com`
- **SMTP Pass:** Configured (App Password)
- **From Email:** `applicationsoptiohire@gmail.com`

**What it sends:**
- ✅ Job Created Emails (when job is posted)
- ✅ CV Screening Results (shortlist/rejection emails to candidates)
- ✅ HR Notifications (new application alerts)
- ✅ Email Verification Codes (account signup)
- ✅ Welcome Emails (after email verification)
- ✅ Password Reset Emails (password recovery)

## Email Flow Diagrams

### Receiving Emails (Email Watcher)

```
1. Email arrives → applicationsoptiohire@gmail.com inbox
2. Email Watcher detects (every 10 seconds)
3. Subject matched → "Job Title at Company Name"
4. CV extracted → PDF/DOCX attachment saved
5. CV parsed → Text, LinkedIn, GitHub links extracted
6. AI Screening → CV scored against job description
7. Application created → Stored with score and status
8. Email sent → Shortlist or rejection to candidate
```

### Sending Emails (Email Service)

```
1. Event triggered (job created, application scored, etc.)
2. Email Service called → Resend API (primary)
3. If Resend fails → Fallback to SMTP
4. Email sent → Candidate/HR receives email
5. Email logged → Stored in email_logs table
```

## Configuration Details

### Email Watcher Configuration

```env
ENABLE_EMAIL_READER=true
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=applicationsoptiohire@gmail.com
IMAP_PASS=<app-password>
IMAP_SECURE=true
IMAP_POLL_MS=10000
```

### Email Sending Configuration

```env
USE_RESEND=true
RESEND_API_KEY=re_your_resend_api_key
RESEND_API_KEY_SECONDARY=re_your_resend_api_key_secondary
RESEND_API_KEY_FALLBACK=re_your_resend_api_key_fallback

# Fallback SMTP
MAIL_HOST=smtp.gmail.com
MAIL_USER=applicationsoptiohire@gmail.com
MAIL_PASS=<app-password>
MAIL_FROM=applicationsoptiohire@gmail.com
```

## Testing Email Functionality

### Test Email Watcher (Receiving)

1. **Send test email:**
   ```
   To: applicationsoptiohire@gmail.com
   Subject: "Software Engineer at Acme Inc" (must match active job)
   Attachment: candidate-cv.pdf
   ```

2. **Monitor processing:**
   ```bash
   # Watch backend logs
   tail -f backend logs
   
   # Check email watcher status
   curl http://localhost:3001/health/email-reader | jq
   ```

3. **Verify result:**
   - Check `/admin/applications` for new application
   - Verify CV is attached
   - Check AI score and status
   - Verify candidate received email

### Test Email Sending

1. **Via Admin Dashboard:**
   - Login: `http://localhost:3000/admin/login`
   - Navigate to email service check (if available)
   - Or create a job to trigger "job created" email

2. **Via API (requires admin token):**
   ```bash
   curl -X POST http://localhost:3001/api/admin/email-service/test \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{"to": "test@example.com"}'
   ```

3. **Check email logs:**
   - Admin Dashboard: `/admin/emails`
   - Or API: `GET /api/admin/emails`

## Email Types Sent

### 1. Job Created Email
- **Trigger:** When job is posted
- **Recipients:** HR email, company email
- **Content:** Job details, subject line for applications, forwarding instructions

### 2. Shortlist Email
- **Trigger:** When CV is scored as SHORTLIST (80-100)
- **Recipients:** Candidate email
- **Content:** Congratulations, next steps, interview information

### 3. Rejection Email
- **Trigger:** When CV is scored as REJECT (0-49)
- **Recipients:** Candidate email
- **Content:** Thank you, not moving forward, encouragement

### 4. HR Notification Email
- **Trigger:** When new application arrives
- **Recipients:** HR email
- **Content:** New application alert, candidate details, job info

### 5. Email Verification Code
- **Trigger:** During account signup
- **Recipients:** User email
- **Content:** 6-digit verification code

### 6. Welcome Email
- **Trigger:** After email verification
- **Recipients:** User email
- **Content:** Welcome message, next steps

### 7. Password Reset Email
- **Trigger:** When password reset is requested
- **Recipients:** User email
- **Content:** Reset code or link

## Monitoring & Health Checks

### Email Watcher Health
```bash
curl http://localhost:3001/health/email-reader | jq
```

### Email Service Health (requires admin token)
```bash
curl http://localhost:3001/api/admin/email-service/check \
  -H "Authorization: Bearer <admin-token>" | jq
```

### Email Reader Status (requires admin token)
```bash
curl http://localhost:3001/api/admin/email-reader/status \
  -H "Authorization: Bearer <admin-token>" | jq
```

## Troubleshooting

### Email Watcher Not Processing

**Check:**
1. `ENABLE_EMAIL_READER=true` in `.env`
2. IMAP credentials correct
3. Backend logs for connection errors
4. Email subject matches job format

**Fix:**
- Verify IMAP credentials
- Check Gmail App Password is correct
- Ensure job status is ACTIVE
- Use correct subject format: "Job Title at Company Name"

### Emails Not Sending

**Check:**
1. Resend API key valid
2. SMTP credentials correct (if using fallback)
3. Email logs for errors
4. From address configured

**Fix:**
- Verify Resend API key
- Check SMTP credentials
- Review email logs in admin dashboard
- Test email sending via admin endpoint

## Summary

✅ **Email Watcher:** Active, monitoring inbox every 10 seconds  
✅ **Email Sending:** Configured with Resend API + SMTP fallback  
✅ **All Email Types:** Configured and ready  
✅ **CV Screening:** Automatic email sending after scoring  
✅ **Health Checks:** Available via API endpoints  

**Email functionality is fully operational and ready to use.**
