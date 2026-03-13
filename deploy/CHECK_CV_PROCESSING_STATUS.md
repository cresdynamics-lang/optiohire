# How to Check CV Extraction, Ranking, and Email Status

## Current Status

Based on backend logs analysis:
- ✅ **Email Watcher:** Active and monitoring inbox
- ⏳ **CVs Processed:** 0 (no emails with CVs received yet)
- ⏳ **CVs Scored:** 0
- ⏳ **Emails Sent:** 0 (no shortlist/rejection emails sent yet)

## How to Check CV Processing

### Method 1: Admin Dashboard (Recommended)

#### Step 1: Login to Admin Dashboard
```
URL: http://localhost:3000/admin/login
Credentials: Use your admin credentials
```

#### Step 2: Check Applications
```
URL: http://localhost:3000/admin/applications
```

**What to Look For:**

For each application, check:

1. **CV Attached (resume_url)**
   - ✅ **YES:** CV was extracted from email
   - ❌ **NO:** No CV attachment found

2. **AI Score**
   - Shows: `0-100` (score out of 100)
   - Higher score = better match

3. **AI Status**
   - `SHORTLIST` (80-100): Candidate meets requirements
   - `FLAG` (50-79): Needs review, borderline candidate
   - `REJECT` (0-49): Doesn't meet requirements
   - `NULL`: Not yet scored

4. **Reasoning**
   - Detailed explanation of why candidate was scored this way
   - Mentions specific skills, experience, gaps

5. **Parsed Resume JSON**
   - LinkedIn URL (if found)
   - GitHub URL (if found)
   - Other links extracted from CV

#### Step 3: Check Email Logs
```
URL: http://localhost:3000/admin/emails
```

**Filter by:**
- Email Type: `shortlist` or `rejection`
- Status: `sent` or `failed`

**What to Look For:**

1. **Shortlist Emails**
   - Sent to candidates with `SHORTLIST` status
   - Subject: "Congratulations! You've been shortlisted..."
   - Status: `sent` = email delivered

2. **Rejection Emails**
   - Sent to candidates with `REJECT` status
   - Subject: "Thank you for your application..."
   - Status: `sent` = email delivered

### Method 2: Backend Logs

#### Check Logs for CV Processing

```bash
# Watch logs in real-time
tail -f backend logs

# Or check specific patterns
tail -1000 backend logs | grep -E "CV extracted|Scoring successful|Shortlist email|Rejection email"
```

**What to Look For:**

1. **CV Extraction:**
   ```
   CV extracted and saved: candidate-cv.pdf -> /path/to/cvs/xxx_timestamp_candidate-cv.pdf
   ```

2. **CV Scoring:**
   ```
   Scoring successful with Groq llama-3.1-8b-instant, score: 85, status: SHORTLIST
   ```

3. **Email Sent:**
   ```
   📧 Sending shortlist email to candidate@example.com for application xxx
   ✅ Shortlist email sent successfully to candidate@example.com
   ```

### Method 3: API Endpoints (Requires Admin Token)

#### Check Applications
```bash
curl http://localhost:3001/api/admin/applications?limit=10 \
  -H "Authorization: Bearer <admin-token>" | jq
```

#### Check Email Logs
```bash
curl "http://localhost:3001/api/admin/emails?limit=20&email_type=shortlist,rejection" \
  -H "Authorization: Bearer <admin-token>" | jq
```

## Expected Flow When Email Arrives

1. **Email Received**
   - Email watcher detects new email
   - Log: `📧 Processing email from candidate@example.com`

2. **Job Matched**
   - Subject matched to active job
   - Log: `✅ MATCH FOUND: Email subject matches job posting`

3. **CV Extracted**
   - PDF/DOCX attachment saved
   - Log: `CV extracted and saved: filename.pdf`

4. **CV Parsed**
   - Text extracted, links found
   - Log: `Parsed CV for application xxx`

5. **AI Scoring**
   - CV scored against job description
   - Log: `Scoring successful ... score: 85, status: SHORTLIST`

6. **Application Created**
   - Stored in database with score
   - Log: `✅ Successfully processed application`

7. **Email Sent**
   - Shortlist or rejection email sent
   - Log: `✅ Shortlist email sent successfully`

## What Each Status Means

### SHORTLIST (80-100 points)
- ✅ Candidate meets 100% of must-have requirements
- ✅ Has ≥50% of nice-to-have requirements
- ✅ Clear career progression
- ✅ Strong communication skills
- 📧 **Email Sent:** Congratulations email with next steps

### FLAG (50-79 points)
- ⚠️ Meets ≥79% of must-haves with compensating strengths
- ⚠️ Has transferable skills
- ⚠️ Addressable gaps
- ⚠️ Borderline score - needs human review
- 📧 **Email Sent:** None (HR reviews manually)

### REJECT (0-49 points)
- ❌ Missing multiple critical must-haves
- ❌ Significant misalignment
- ❌ Lacks foundational skills
- ❌ Irrelevant application
- 📧 **Email Sent:** Rejection email with encouragement

## Troubleshooting

### No CVs Processed

**Check:**
1. Email watcher running? `curl http://localhost:3001/health/email-reader`
2. Active jobs exist? Check `/admin/jobs`
3. Emails sent with correct subject? Must match "Job Title at Company Name"
4. CV attached? Must be PDF or DOCX

**Fix:**
- Send test email with CV attachment
- Use exact subject format from job creation email
- Ensure job status is ACTIVE

### CVs Not Scored

**Check:**
1. AI provider configured? (Groq or Gemini API key)
2. Backend logs for scoring errors
3. CV parsing successful?

**Fix:**
- Verify `GROQ_API_KEY` or `GEMINI_API_KEY` in `.env`
- Check logs for AI API errors
- Ensure CV is readable (not corrupted)

### Emails Not Sent

**Check:**
1. Email service configured? (Resend or SMTP)
2. Email logs show status `sent` or `failed`?
3. Candidate email address valid?

**Fix:**
- Check email service: `/api/admin/email-service/check`
- Review email logs for errors
- Verify Resend API key or SMTP credentials

## Quick Check Script

Run the provided script:

```bash
./scripts/check-cv-processing.sh
```

This will show:
- Number of CVs extracted
- Number of CVs scored
- Number of shortlist emails sent
- Number of rejection emails sent
- Recent processing activity

## Summary

**To check if CVs were extracted, ranked, and emails sent:**

1. ✅ **Login to Admin Dashboard:** `http://localhost:3000/admin/login`
2. ✅ **Check Applications:** `http://localhost:3000/admin/applications`
   - Look for `resume_url` (CV attached)
   - Check `ai_score` (0-100)
   - Check `ai_status` (SHORTLIST/FLAG/REJECT)
3. ✅ **Check Email Logs:** `http://localhost:3000/admin/emails`
   - Filter by `shortlist` or `rejection`
   - Check `status` = `sent`

**Current Status:** Email watcher is active but no CVs have been processed yet. Send a test email with a CV attachment to see the full flow in action.
