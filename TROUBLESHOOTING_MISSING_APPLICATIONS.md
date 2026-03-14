# Troubleshooting: Applications Not Showing Up

## Current Status

✅ **Email Watcher:** Active and running  
✅ **Sales Role Job:** Exists and is ACTIVE  
❌ **Applications:** None found in database  

## Possible Issues

### 1. Email Subject Mismatch

**What subjects will match:**
- ✅ `"Sales Role at Cres Dynamics"` (Best - Score 10)
- ✅ `"Sales Role"` (Good - Score 6)
- ✅ `"Sales at Cres Dynamics"` (Good - Score 5)
- ✅ `"Sales"` (Will match - Score 1, but may be ambiguous)

**What subjects WON'T match:**
- ❌ Generic subjects like `"Job Application"` (no keywords)
- ❌ Subjects with typos that don't contain "Sales" or "Cres Dynamics"

### 2. Missing CV Attachment

**Required:**
- Email MUST have a CV attachment (PDF or DOCX)
- Attachment must be a file, not embedded text/images
- File must be readable (not corrupted)

**What happens if no CV:**
- Email is processed but no application is created
- Email is moved to "Failed" folder
- Log shows: `⚠️ Email processed but CV not extracted - keeping unread`

### 3. Email Location

**Where emails should be:**
- ✅ In **INBOX** folder (unread)
- ❌ NOT in Spam, Sent, or other folders
- ❌ NOT already marked as read

**What happens:**
- Email watcher only checks **unread emails in INBOX**
- If emails are already read, they won't be processed
- If emails are in other folders, they won't be checked

### 4. Processing Errors

**Check backend logs for:**
- `❌ NO MATCH: Email subject doesn't match`
- `⚠️ Email processed but CV not extracted`
- `❌ Error processing email`
- `❌ Failed to extract CV`

## How to Fix

### Step 1: Verify Email Details

**Check:**
1. What email subject did you use?
2. Did the email have a CV attachment (PDF/DOCX)?
3. Was the email sent to `applicationsoptiohire@gmail.com`?
4. Is the email still unread in the INBOX?

### Step 2: Check Backend Logs

**Look for processing logs:**
```bash
# Check recent logs
tail -100 backend/logs | grep -i "sales\|cres\|processing\|match\|cv"

# Or watch logs in real-time
tail -f backend/logs | grep -i "sales\|cres\|match"
```

**What to look for:**
- `Processing email #X: Subject="..."`
- `✅ MATCH FOUND` or `❌ NO MATCH`
- `CV extracted and saved`
- `✅ Successfully processed email`

### Step 3: Resend Test Email

**Send a test email with:**
- **To:** `applicationsoptiohire@gmail.com`
- **Subject:** `"Sales Role at Cres Dynamics"` (best match)
- **Attachment:** CV file (PDF or DOCX)
- **Body:** (optional)

**Wait 10-30 seconds** then check:
- Backend logs for processing
- Database for new application
- Admin dashboard for candidates

### Step 4: Check Email Folders

**If emails were processed but failed:**
- Check "Failed" folder in email inbox
- Check "Processed" folder (if CV was extracted)
- Emails in these folders won't be reprocessed

**To reprocess:**
- Move email back to INBOX
- Mark as unread
- Wait for next poll cycle (10 seconds)

## Quick Diagnostic Commands

### Check Applications
```bash
cd backend && npx tsx ../scripts/check-applications.ts
```

### Check Email Watcher Status
```bash
curl http://localhost:3001/health/email-reader | jq '.emailReader'
```

### Test Email Matching
```bash
cd backend && npx tsx ../scripts/diagnose-email-matching.ts
```

## Expected Flow

1. **Email arrives** → `applicationsoptiohire@gmail.com` inbox
2. **Email watcher detects** → Within 10 seconds
3. **Subject matched** → Log shows `✅ MATCH FOUND`
4. **CV extracted** → Log shows `CV extracted and saved`
5. **CV scored** → Log shows `Scoring successful ... score: X`
6. **Application created** → Database record created
7. **Email sent** → Shortlist/rejection email sent to candidate
8. **Email moved** → To "Processed" folder

## Next Steps

1. **Check what email subjects you used** - Share them so we can verify matching
2. **Verify CV attachments** - Make sure PDFs/DOCX files were attached
3. **Check backend logs** - Look for any error messages
4. **Resend test email** - Use subject `"Sales Role at Cres Dynamics"` with CV attachment

## Contact for Help

If applications still don't appear after checking all above:
- Share the exact email subjects used
- Share any error messages from backend logs
- Confirm CV attachments were included
- Check if emails are still in INBOX (unread)
