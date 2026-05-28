# Testing Email Watcher and CV Screening

## Overview

The email watcher monitors an IMAP inbox for incoming job applications, extracts CVs, and screens them against job descriptions using AI.

## Prerequisites

1. **Backend running** on port 3001
2. **Email watcher enabled** (`ENABLE_EMAIL_READER=true` in backend `.env`)
3. **IMAP configured** (`IMAP_HOST`, `IMAP_USER`, `IMAP_PASS` in backend `.env`)
4. **AI provider configured** (Groq or Gemini API key)
5. **Active job posting** in the database

## Step 1: Start the Application

### Start Backend
```bash
cd /Users/airm1/Projects/optiohire/backend
npm run dev
# OR if using PM2:
pm2 start npm --name optiohire-backend -- run dev
```

### Start Frontend (separate terminal)
```bash
cd /Users/airm1/Projects/optiohire/frontend
npm run dev
```

## Step 2: Check Email Watcher Status

### Option A: Health Check Endpoint
```bash
curl http://localhost:3001/health/email-reader | jq
```

Expected response:
```json
{
  "status": "ok",
  "emailReader": {
    "enabled": true,
    "running": true,
    "disabledReason": null,
    "lastProcessedAt": "2026-03-07T12:00:00.000Z",
    "lastError": null
  },
  "timestamp": "2026-03-07T12:00:00.000Z"
}
```

### Option B: Admin Dashboard
1. Login to admin dashboard: `http://localhost:3000/admin/login`
2. Navigate to: `/admin/email-reader/status` (if endpoint exists)
3. Or check: `/api/admin/email-reader/status`

### Option C: Backend Logs
```bash
# If using PM2:
pm2 logs optiohire-backend

# Look for:
# ✅ IMAP email reader connected to imap.gmail.com:993
# 📧 Email reader started monitoring inbox (checking every 1000ms)
```

## Step 3: Verify Active Jobs

The email watcher only matches emails to **active** job postings.

### Check Active Jobs via API
```bash
curl http://localhost:3001/api/admin/job-postings?status=ACTIVE \
  -H "Authorization: Bearer <admin-token>" | jq
```

### Check via Admin Dashboard
1. Go to: `http://localhost:3000/admin/jobs`
2. Verify at least one job has status `ACTIVE`
3. Note the **exact job title** and **company name**

## Step 4: Test Email Processing

### Email Subject Format Required

The email subject **MUST** match one of these patterns:

1. **Best:** `"Job Title at Company Name"` (exact match)
   - Example: `"Software Engineer at Acme Inc"`

2. **Good:** Subject starts with `"Job Title at Company Name"`
   - Example: `"Re: Software Engineer at Acme Inc"`

3. **Acceptable:** Subject contains `"Job Title at Company Name"`
   - Example: `"Application for Software Engineer at Acme Inc"`

4. **Fallback:** Subject contains both job title AND company name (any order)
   - Example: `"Acme Inc - Software Engineer Application"`

### Send Test Email

1. **From:** Any email address (candidate email)
2. **To:** `IMAP_USER` inbox (e.g., `applicationsoptiohire@gmail.com`)
3. **Subject:** Use exact format from job creation email
   - Example: `"Software Engineer at Acme Inc"`
4. **Attachment:** CV file (PDF or DOCX)
   - Must be attached, not embedded in body

### Example Test Email

```
To: applicationsoptiohire@gmail.com
Subject: Software Engineer at Acme Inc
Body: (optional - can be empty)
Attachment: candidate-cv.pdf
```

## Step 5: Monitor Processing

### Watch Backend Logs

```bash
pm2 logs optiohire-backend --lines 100
```

### Expected Log Flow

1. **Email Detected:**
   ```
   📧 Processing email from candidate@example.com: "Software Engineer at Acme Inc"
   ```

2. **Job Matched:**
   ```
   ✅ MATCH FOUND: Email subject matches job posting: "Software Engineer at Acme Inc" -> Job: "Software Engineer" (ID: xxx)
   ```

3. **CV Extracted:**
   ```
   CV extracted and saved: candidate-cv.pdf -> /path/to/cvs/xxx_timestamp_candidate-cv.pdf
   ```

4. **CV Parsed:**
   ```
   Parsed CV for application xxx: textContent length: 5000, linkedin: https://linkedin.com/..., github: https://GIT_HOST/...
   ```

5. **AI Scoring:**
   ```
   Using Groq model llama-3.1-8b-instant for scoring
   Scoring successful with Groq llama-3.1-8b-instant, score: 85, status: SHORTLIST
   ```

6. **Application Created:**
   ```
   ✅ Successfully processed application from candidate@example.com for job xxx - CV extracted and analyzed
   ```

7. **Email Sent (if shortlisted/rejected):**
   ```
   📧 Sending shortlist email to candidate@example.com for application xxx
   ✅ Shortlist email sent successfully to candidate@example.com
   ```

## Step 6: Verify Results

### Check Applications

```bash
curl http://localhost:3001/api/admin/applications?limit=10 \
  -H "Authorization: Bearer <admin-token>" | jq '.applications[] | {
    id: .application_id,
    candidate: .candidate_name,
    email: .email,
    job: .job_title,
    score: .ai_score,
    status: .ai_status,
    reasoning: .reasoning,
    created: .created_at
  }'
```

### Check via Admin Dashboard

1. Go to: `http://localhost:3000/admin/applications`
2. Look for the new application
3. Verify:
   - ✅ CV attached (`resume_url` populated)
   - ✅ AI score (0-100)
   - ✅ AI status (SHORTLIST, FLAG, or REJECT)
   - ✅ Reasoning text
   - ✅ Parsed resume JSON (LinkedIn, GitHub, etc.)

### Check Email Logs

```bash
curl http://localhost:3001/api/admin/emails?limit=10 \
  -H "Authorization: Bearer <admin-token>" | jq '.emails[] | {
    to: .recipient_email,
    subject: .subject,
    status: .status,
    type: .email_type,
    sent: .sent_at
  }'
```

## Troubleshooting

### Email Watcher Not Running

**Check:**
1. `ENABLE_EMAIL_READER=true` in backend `.env`
2. IMAP credentials configured
3. Backend logs for errors

**Fix:**
```bash
# Check backend .env
cat backend/.env | grep EMAIL

# Restart backend
pm2 restart optiohire-backend
```

### Email Not Matched to Job

**Symptoms:**
- Log shows: `❌ NO MATCH: Email subject "..." doesn't match any job posting`

**Causes:**
1. Subject doesn't match job title + company name format
2. Job status is not ACTIVE
3. Job doesn't exist in database

**Fix:**
1. Check active jobs: `/admin/jobs`
2. Use exact subject format from job creation email
3. Ensure job status is `ACTIVE`

### CV Not Extracted

**Symptoms:**
- Log shows: `⚠️ Email processed but CV not extracted - keeping unread`

**Causes:**
1. No attachment in email
2. Attachment is not PDF/DOCX
3. Attachment is corrupted

**Fix:**
1. Ensure CV is attached (not embedded)
2. Use PDF or DOCX format
3. Check file is not corrupted

### AI Scoring Failed

**Symptoms:**
- Log shows: `Groq scoring failed` or `Gemini scoring failed`
- Application has `ai_score: 0` and `ai_status: FLAG`

**Causes:**
1. AI API key not configured
2. API rate limit exceeded
3. CV text too long or malformed

**Fix:**
1. Check AI provider config:
   ```bash
   # For Groq
   echo $GROQ_API_KEY
   
   # For Gemini
   echo $GEMINI_API_KEY
   ```
2. Check API quotas/limits
3. Review CV parsing logs

### Email Not Sent to Candidate

**Symptoms:**
- Application scored but no email sent
- Log shows: `❌ Failed to send candidate decision email`

**Causes:**
1. Email service not configured (Resend/SMTP)
2. Invalid candidate email address
3. Email service error

**Fix:**
1. Check email service: `/api/admin/email-service/check`
2. Test email sending: `/api/admin/email-service/test`
3. Check email logs for errors

## Quick Test Script

Use the provided test script:

```bash
cd /Users/airm1/Projects/optiohire
./scripts/test-email-watcher.sh
```

Or manually:

```bash
# 1. Check email watcher status
curl http://localhost:3001/health/email-reader | jq

# 2. Check active jobs
curl http://localhost:3001/api/admin/job-postings?status=ACTIVE \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

# 3. Send test email with CV
# (Use email client to send to IMAP inbox)

# 4. Watch logs
pm2 logs optiohire-backend --lines 50

# 5. Check new applications
curl http://localhost:3001/api/admin/applications?limit=5 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq
```

## Expected Behavior Summary

✅ **Email watcher running** → Logs show "monitoring inbox"  
✅ **Email received** → Logs show "Processing email"  
✅ **Job matched** → Logs show "MATCH FOUND"  
✅ **CV extracted** → Logs show "CV extracted and saved"  
✅ **CV parsed** → Logs show "Parsed CV" with text content  
✅ **AI scored** → Logs show "Scoring successful" with score and status  
✅ **Application created** → Visible in `/admin/applications`  
✅ **Email sent** → Logs show "Shortlist/Rejection email sent"  

## Next Steps

After successful test:
1. Monitor email watcher continuously
2. Review scored applications in admin dashboard
3. Adjust AI scoring prompts if needed
4. Configure email templates for shortlist/rejection
