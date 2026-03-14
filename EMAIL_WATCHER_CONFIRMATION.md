# Email Watcher End-to-End Flow Confirmation

## ✅ Current Status

### Email Watcher Status
- **Enabled:** ✅ YES (`ENABLE_EMAIL_READER=true`)
- **Running:** ✅ YES (Active and monitoring inbox)
- **IMAP Host:** `imap.gmail.com:993`
- **IMAP User:** `applicationsoptiohire@gmail.com`
- **Poll Interval:** 5 seconds (`IMAP_POLL_MS=5000`)
- **Last Processed:** Active (checking inbox every 5 seconds)
- **Last Error:** None

**Health Check:**
```bash
curl http://localhost:3001/health/email-reader
```

**Response:**
```json
{
  "status": "ok",
  "emailReader": {
    "enabled": true,
    "running": true,
    "lastProcessedAt": "2026-03-14T15:01:15.450Z",
    "lastError": null
  }
}
```

## 🔄 End-to-End Flow

### 1. Email Arrives → Watched ✅
**Process:**
- Email arrives at `applicationsoptiohire@gmail.com`
- Email watcher polls inbox every **5 seconds**
- Detects new unread emails
- Matches email subject to active job postings

**Code:** `backend/src/server/email-reader.ts` - `watchEmails()` method

### 2. Email Screened → CV Extracted ✅
**Process:**
- Email subject matched to job posting (e.g., "Sales Role at Cres Dynamics")
- CV attachment extracted (PDF/DOCX)
- CV parsed to extract:
  - Text content
  - LinkedIn URL
  - GitHub URL
  - Email addresses
  - Other links

**Code:** `backend/src/server/email-reader.ts` - `processCandidateCV()` method
**Parser:** `backend/src/lib/cv-parser.ts`

### 3. Candidate Ranked → AI Scoring ✅
**Process:**
- CV text analyzed against job description
- AI scoring engine evaluates:
  - Skills match
  - Experience level
  - Education
  - Overall fit
- Score assigned: 0-100
- Status assigned:
  - **SHORTLIST** (80-100): Meets requirements
  - **FLAG** (50-79): Needs review
  - **REJECT** (0-49): Doesn't meet requirements

**Code:** `backend/src/server/email-reader.ts` - `processCandidateCV()` → `aiScoring.scoreCandidate()`
**AI Engine:** `backend/src/lib/ai-scoring.ts` (uses Groq API)

### 4. Application Created → Database ✅
**Process:**
- Application record created in database
- Fields populated:
  - `candidate_name`
  - `email`
  - `ai_score`
  - `ai_status` (SHORTLIST/FLAG/REJECT)
  - `reasoning` (AI explanation)
  - `parsed_resume_json` (extracted links)
  - `resume_url` (CV file path)

**Code:** `backend/src/server/email-reader.ts` - `processCandidateCV()` → `applicationRepo.updateScoring()`

### 5. Feedback Sent → Candidate Email ✅
**Process:**
- **If SHORTLIST:** Shortlist email sent immediately
  - Subject: "Congratulations! You've been shortlisted..."
  - Includes job details and next steps
- **If REJECT:** Rejection email sent immediately
  - Subject: "Thank you for your application..."
  - Professional rejection message
- **If FLAG:** No email (requires manual review)

**Code:** `backend/src/server/email-reader.ts` - `processCandidateCV()` lines 1105-1127
**Email Service:** `backend/src/services/emailService.ts`
- Uses Resend API (optiohire.com domain verified ✅)
- Falls back to SMTP if Resend fails

### 6. HR Dashboard → View Candidates ✅
**Process:**
- HR navigates to Dashboard → Job → "View Candidates"
- Frontend fetches candidates via `/api/hr/candidates?jobId=...`
- Backend returns candidates ordered by:
  1. Status priority: SHORTLIST → FLAG → REJECT
  2. Score (descending)
  3. Created date (ascending)
- Each candidate shows:
  - **Rank** (1st, 2nd, 3rd...)
  - **Name**
  - **Email**
  - **Score** (0-100)
  - **Status** badge (SHORTLIST/FLAG/REJECT)
  - **Reasoning** (AI explanation)

**Frontend:** `frontend/src/app/dashboard/job/[jobId]/shortlisted/page.tsx`
**Backend API:** `frontend/src/app/api/hr/candidates/route.ts`
**Backend Controller:** `backend/src/api/hrCandidatesController.ts`

## 📊 Real-Time Updates

### Current Implementation ✅
- **Frontend:** Fetches candidates on page load
- **Auto-Polling:** ✅ **IMPLEMENTED** - Refreshes every **30 seconds** automatically
- **Code:** `frontend/src/app/dashboard/job/[jobId]/shortlisted/page.tsx` lines 162-166
  ```typescript
  useEffect(() => {
    if (!jobId || !user || user.role === 'admin') return
    const interval = setInterval(fetchCandidates, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [jobId, user, fetchCandidates])
  ```

### How Updates Appear
1. **Automatic:** Page refreshes candidate list every 30 seconds
2. **Manual Refresh:** Navigate away and back, or press F5/Cmd+R
3. **Real-Time:** New applications appear within 30 seconds of being processed

## 🧪 Testing the Flow

### Step-by-Step Test:
1. **Send Test Email:**
   ```
   To: applicationsoptiohire@gmail.com
   Subject: Sales Role at Cres Dynamics
   Body: [Any text]
   Attachment: CV.pdf or CV.docx
   ```

2. **Wait 5-10 seconds:**
   - Email watcher polls every 5 seconds
   - Processing takes 2-5 seconds

3. **Check Backend Logs:**
   ```bash
   # Look for these log messages:
   📧 [EMAIL WATCHER] Processing email #123: Subject="Sales Role at Cres Dynamics"
   ✅ [EMAIL WATCHER] MATCH FOUND: Email subject matches job posting
   ✅ [EMAIL WATCHER] Processed CV for application xxx, score: 85, status: SHORTLIST
   ✅ [EMAIL WATCHER] Shortlist email sent successfully to candidate@example.com
   ```

4. **Check Dashboard:**
   - Navigate to Dashboard → Job → "View Candidates"
   - Candidate should appear with:
     - Rank (1st, 2nd, etc.)
     - Score (e.g., 85.0)
     - Status badge (SHORTLIST/FLAG/REJECT)
     - Reasoning text

5. **Check Candidate Email:**
   - Candidate should receive shortlist or rejection email
   - Check `email_logs` table for sent confirmation

## 🔍 Verification Commands

### Check Email Watcher Status:
```bash
curl http://localhost:3001/health/email-reader | jq '.emailReader'
```

### Check Recent Applications:
```bash
cd backend && npx tsx ../scripts/verify-end-to-end-flow.ts
```

### Check Recent Ranking Emails:
```sql
SELECT 
  recipient_email,
  email_type,
  status,
  sent_at,
  created_at
FROM email_logs
WHERE email_type IN ('shortlist', 'rejection')
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Monitor Email Processing (Real-time):
```bash
tail -f backend/logs/app.log | grep "\[EMAIL WATCHER\]"
```

## ✅ Confirmation Checklist

- [x] Email watcher is active and running
- [x] Polling interval set to 5 seconds
- [x] Emails are detected and matched to jobs
- [x] CVs are extracted and parsed
- [x] Candidates are scored by AI
- [x] Applications are created in database
- [x] Ranking emails (shortlist/rejection) are sent to candidates
- [x] HR can view ranked candidates on dashboard
- [x] Candidates are ordered by status and score
- [x] optiohire.com domain is verified in Resend
- [x] Real-time auto-refresh on dashboard (every 30 seconds) ✅

## 📝 Notes

- **Email Watcher:** Active and monitoring `applicationsoptiohire@gmail.com` every 5 seconds
- **Domain Verified:** optiohire.com is verified in Resend ✅
- **Email Sending:** Uses Resend API (optiohire.com domain) with SMTP fallback
- **Ranking:** Candidates ranked by status (SHORTLIST → FLAG → REJECT) then by score
- **Feedback:** Shortlist/rejection emails sent immediately after scoring
- **Dashboard:** Shows ranked candidates with scores and status badges

## 🚀 Next Steps (Optional Improvements)

1. ✅ **Auto-Refresh:** Already implemented (every 30 seconds)
2. **WebSocket Updates:** Real-time push notifications when new applications arrive (optional enhancement)
3. **Email Notifications:** Optional HR email alerts for high-scoring candidates (currently disabled per user request)
4. **Dashboard Stats:** Show count of new applications since last visit (optional enhancement)
