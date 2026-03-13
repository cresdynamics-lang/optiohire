# Email Watcher - Unread Emails Confirmation

## ✅ CONFIRMED: Email Watcher is Active

### Status Check 1:
- ✅ **Enabled:** `true`
- ✅ **Running:** `true`
- ✅ **Last Processed:** `2026-03-08T05:47:49.835Z` (updating every 10 seconds)
- ✅ **Last Error:** `none`
- ✅ **IMAP Connected:** `imap.gmail.com:993`
- ✅ **Poll Interval:** `10 seconds` (checking inbox every 10 seconds)

### Status Check 2:
- ✅ **Email Watcher:** Monitoring inbox continuously
- ✅ **Connection:** Stable, no errors
- ✅ **Processing:** Active (lastProcessedAt timestamp updating)

## Why Emails Might Not Be Processing

If you have unread emails but they're not being processed, check:

### 1. Email Subject Format

**Required Format:** `"Job Title at Company Name"`

**Examples:**
- ✅ `"Software Engineer at Acme Inc"`
- ✅ `"Re: Software Engineer at Acme Inc"`
- ✅ `"Application for Software Engineer at Acme Inc"`
- ❌ `"Software Engineer"` (missing company name)
- ❌ `"Job Application"` (too generic)

### 2. Active Jobs Required

- Emails only match to jobs with status `ACTIVE`
- Check: `http://localhost:3000/admin/jobs`
- Ensure at least one job has status `ACTIVE`

### 3. Email Location

- Emails must be in the **INBOX** folder
- Emails in other folders (Spam, Sent, etc.) won't be processed

### 4. CV Attachment

- Email must have a CV attachment (PDF or DOCX)
- Embedded images/text won't work - must be attached file

## What Happens When Email is Processed

1. **Email Detected**
   - Log: `✅ Found X unread email(s) in inbox - processing...`

2. **Subject Matched**
   - Log: `✅ MATCH FOUND: Email subject matches job posting`
   - OR: `❌ NO MATCH: Email subject doesn't match any job posting`

3. **CV Extracted**
   - Log: `CV extracted and saved: filename.pdf`

4. **CV Scored**
   - Log: `Scoring successful ... score: 85, status: SHORTLIST`

5. **Email Sent**
   - Log: `✅ Shortlist email sent successfully`

## How to Verify Email Processing

### Check Backend Logs

```bash
# Watch logs in real-time
tail -f backend logs

# Look for these patterns:
# - "Found X unread email(s)"
# - "Processing email #X"
# - "MATCH FOUND" or "NO MATCH"
# - "CV extracted"
# - "Scoring successful"
```

### Check Admin Dashboard

1. **Applications:** `http://localhost:3000/admin/applications`
   - Look for new applications
   - Check `resume_url` (CV attached)
   - Check `ai_score` and `ai_status`

2. **Email Logs:** `http://localhost:3000/admin/emails`
   - Filter by `shortlist` or `rejection`
   - Check if emails were sent

## Troubleshooting Steps

### Step 1: Verify Email Subject

Check the subject line of your unread emails:
- Does it match: `"Job Title at Company Name"`?
- Does it contain both job title AND company name?

### Step 2: Check Active Jobs

```bash
# Via Admin Dashboard
http://localhost:3000/admin/jobs

# Look for jobs with status = ACTIVE
# Note the exact job title and company name
```

### Step 3: Check Logs for "NO MATCH"

If emails aren't matching, logs will show:
```
❌ NO MATCH: Email subject "..." doesn't match any job posting
   Available jobs for matching (X):
     1. "Job Title" (Status: ACTIVE)
   💡 TIP: Email subject should match: "Job Title at Company Name"
```

### Step 4: Verify Email Location

- Ensure emails are in **INBOX** (not Spam, Sent, etc.)
- Check Gmail inbox: `applicationsoptiohire@gmail.com`

## Expected Behavior

**If email matches:**
- ✅ Email processed within 10-30 seconds
- ✅ Application created in database
- ✅ CV extracted and scored
- ✅ Email sent to candidate (if shortlisted/rejected)

**If email doesn't match:**
- ⚠️ Email stays unread
- ⚠️ Log shows "NO MATCH" with available jobs list
- ⚠️ Email moved to "Failed" folder

## Summary

✅ **Email Watcher:** CONFIRMED ACTIVE (checking every 10 seconds)  
✅ **Connection:** CONFIRMED STABLE (no errors)  
✅ **Processing:** CONFIRMED RUNNING (lastProcessedAt updating)

**If emails aren't processing:**
1. Check email subject matches: `"Job Title at Company Name"`
2. Verify job status is `ACTIVE`
3. Check backend logs for "NO MATCH" messages
4. Ensure CV is attached (PDF or DOCX)

The email watcher is working correctly. If emails aren't being processed, it's likely a subject matching issue or no active jobs in the database.
