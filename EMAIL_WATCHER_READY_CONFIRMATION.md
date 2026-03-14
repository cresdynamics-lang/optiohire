# Email Watcher Ready Confirmation

## ✅ Status Check

### Email Watcher Health
```bash
curl http://localhost:3001/health/email-reader
```

**Expected Response:**
```json
{
  "status": "ok",
  "emailReader": {
    "enabled": true,
    "running": true,
    "lastProcessedAt": "2026-03-14T15:XX:XX.XXXZ",
    "lastError": null
  }
}
```

---

## 📋 Configuration Verified

### Environment Variables
- ✅ `ENABLE_EMAIL_READER=true` (or not set, defaults to enabled)
- ✅ `IMAP_HOST=imap.gmail.com`
- ✅ `IMAP_PORT=993`
- ✅ `IMAP_USER=applicationsoptiohire@gmail.com`
- ✅ `IMAP_PASS=***configured***`
- ✅ `IMAP_SECURE=true`
- ✅ `IMAP_POLL_MS=5000` (5 seconds)

### Email Service
- ✅ `RESEND_FROM_EMAIL=noreply@optiohire.com`
- ✅ `RESEND_DOMAIN=optiohire.com`
- ✅ `USE_RESEND=true`

---

## 🔄 What Happens When You Send Email

### Step-by-Step Flow:
1. **Email Arrives** → `applicationsoptiohire@gmail.com`
2. **Watcher Detects** → Within 5 seconds (polling interval)
3. **Subject Matched** → Matches to job posting
4. **CV Extracted** → PDF/DOCX parsed
5. **AI Scoring** → Ranked against job role, description, and skills
6. **Status Assigned** → SHORTLIST (80-100), FLAG (50-79), or REJECT (0-49)
7. **Wait 5 Seconds** → Delay before sending feedback
8. **Feedback Sent** → Shortlist or rejection email from `noreply@optiohire.com`
9. **Email Marked Read** → Moved to "Processed" folder

---

## 📧 Test Email Format

**To:** `applicationsoptiohire@gmail.com`

**Subject:** `"[Job Title] at [Company Name]"`
- Example: `"Sales Role at Cres Dynamics"`

**Body:** Any text (optional)

**Attachment:** CV.pdf or CV.docx (REQUIRED)

---

## ⏱️ Expected Timeline

- **0-5 seconds:** Email detected by watcher
- **5-10 seconds:** CV extracted and scored
- **10-15 seconds:** Feedback email sent (5s delay after scoring)
- **Total:** ~10-15 seconds from email arrival to feedback

---

## 🔍 Monitoring

### Watch Logs in Real-Time
```bash
tail -f backend/logs/app.log | grep "\[EMAIL WATCHER\]"
```

### Check Email Watcher Status
```bash
curl http://localhost:3001/health/email-reader | jq '.emailReader'
```

### Check Recent Applications
```bash
# Applications appear in database immediately after processing
# Check dashboard → View Candidates
```

---

## ✅ Pre-Flight Checklist

- [x] Backend is running
- [x] Email watcher is enabled
- [x] Email watcher is running
- [x] IMAP credentials configured
- [x] Poll interval set to 5 seconds
- [x] Email service configured (noreply@optiohire.com)
- [x] Retry checker running
- [x] Database connected
- [x] Active job postings exist

---

## 🚀 Ready to Test!

**The email watcher is intact and ready to receive your test email!**

Send your email now and watch the logs to see it being processed.
