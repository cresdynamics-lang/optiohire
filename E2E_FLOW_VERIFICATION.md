# End-to-End Flow Verification

## ✅ Complete Application Flow Confirmed

### **Flow 1: User Signup → Job Creation → Email Processing → Report Generation**

#### Step 1: User Signup ✅
- **Endpoint**: `POST /auth/signup`
- **Controller**: `backend/src/api/authController.ts`
- **Flow**:
  1. Validates input (name, email, password, company details)
  2. Checks for existing email
  3. Creates user record in `users` table
  4. Creates company record in `companies` table
  5. Issues JWT token
  6. Returns user + company data
- **Status**: ✅ Working

#### Step 2: Job Posting Creation ✅
- **Endpoint**: `POST /api/job/create`
- **Controller**: `backend/src/api/jobController.ts`
- **Service**: `backend/src/services/jobService.ts`
- **Flow**:
  1. Validates job data (title, description, skills, deadline)
  2. Finds or creates company
  3. Creates job posting in `job_postings` table
  4. Returns job posting ID
- **Status**: ✅ Working

#### Step 3: Email Reader Processing ✅
- **Service**: `backend/src/server/email-reader.ts`
- **Started**: Automatically in `server.ts` (line 955)
- **Flow**:
  1. Connects to IMAP server (Gmail)
  2. Monitors inbox every 1-10 seconds (configurable)
  3. Detects new emails with CV attachments
  4. Matches email to job posting (by subject/body)
  5. Extracts CV from attachment (PDF/DOC/DOCX)
  6. Parses CV using AI (`CVParser`)
  7. Scores candidate using AI (`AIScoringEngine`)
  8. Creates application record in `applications` table
  9. Sends HR notification email
  10. Moves email to "Processed" folder
- **Status**: ✅ Working (requires `ENABLE_EMAIL_READER=true`)

#### Step 4: AI Scoring Pipeline ✅
- **Service**: `backend/src/lib/ai-scoring.ts`
- **Flow**:
  1. Receives CV text + job requirements
  2. Uses Groq/Gemini AI to analyze match
  3. Generates score (0-100)
  4. Assigns status: SHORTLIST (≥80), FLAG (50-79), REJECT (<50)
  5. Stores reasoning text
  6. Updates application record
- **Status**: ✅ Working

#### Step 5: Report Generation ✅
- **Scheduler**: `backend/src/cron/reportScheduler.ts`
- **Service**: `backend/src/services/reports/reportService.ts`
- **Flow**:
  1. Cron runs every 10 minutes
  2. Finds jobs with passed deadlines (or CLOSED status)
  3. Checks if report already exists
  4. Fetches all applications for job
  5. Generates AI analysis (`reportGenerator.ts`)
  6. Creates PDF report (`pdfGenerator.ts`)
  7. Saves PDF to storage (local/S3)
  8. Creates report record in `reports` table
  9. Sends report to HR team
- **Status**: ✅ Working

---

## 🔄 Complete Data Flow Diagram

```
┌─────────────────┐
│  User Signup    │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /auth/    │
│  signup         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Create User    │─────▶│  Create Company │
│  (users table)  │      │  (companies)    │
└─────────────────┘      └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Issue JWT      │
│  Token          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Job     │
│  Posting        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Job Stored in  │
│  job_postings   │
└─────────────────┘
         │
         │ (Candidate sends email with CV)
         │
         ▼
┌─────────────────┐
│  Email Reader   │
│  Detects Email  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract CV     │
│  (PDF/DOC)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Parse CV    │
│  (CVParser)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Score       │
│  Candidate      │
│  (AIScoring)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Store          │─────▶│  Send HR        │
│  Application    │      │  Notification   │
│  (applications) │      │  Email           │
└─────────────────┘      └─────────────────┘
         │
         │ (Job deadline passes)
         │
         ▼
┌─────────────────┐
│  Report         │
│  Scheduler      │
│  (Cron)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Generate       │
│  AI Analysis    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create PDF     │
│  Report         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Store Report   │─────▶│  Send Report    │
│  (reports table)│      │  to HR           │
└─────────────────┘      └─────────────────┘
```

---

## ✅ Verification Checklist

### **Authentication Flow**
- [x] User signup creates user + company
- [x] JWT token issued and stored
- [x] Token validation middleware works
- [x] Protected routes require authentication
- [x] Admin routes require admin role

### **Job Posting Flow**
- [x] Job creation endpoint works
- [x] Job stored in database
- [x] Job can be retrieved by ID
- [x] Job can be updated
- [x] Job status can be changed

### **Email Processing Flow**
- [x] Email reader starts automatically
- [x] IMAP connection established
- [x] Emails detected in inbox
- [x] CV attachments extracted
- [x] CV parsed to text
- [x] Job matched from email
- [x] Application created

### **AI Scoring Flow**
- [x] CV text extracted successfully
- [x] AI parsing extracts structured data
- [x] AI scoring generates 0-100 score
- [x] Status assigned (SHORTLIST/FLAG/REJECT)
- [x] Reasoning stored
- [x] Application updated in database

### **Report Generation Flow**
- [x] Cron scheduler runs every 10 minutes
- [x] Past-deadline jobs detected
- [x] Applications aggregated
- [x] AI analysis generated
- [x] PDF report created
- [x] Report stored in database
- [x] Report sent to HR

### **Email Notifications**
- [x] HR notified of new applications
- [x] Candidates receive status emails
- [x] Reports sent to HR team
- [x] Email service fallback (Resend → SendGrid → SMTP)

---

## 🧪 Test Scenarios

### **Scenario 1: Complete Happy Path**
1. ✅ User signs up → User + Company created
2. ✅ User creates job posting → Job stored
3. ✅ Candidate sends email with CV → Email processed
4. ✅ CV parsed and scored → Application created
5. ✅ HR receives notification → Email sent
6. ✅ Job deadline passes → Report generated
7. ✅ HR receives report → Email sent

### **Scenario 2: Email Reader Edge Cases**
- ✅ Email without CV attachment → Skipped gracefully
- ✅ Email not matching any job → Logged but not processed
- ✅ Multiple CV formats → PDF, DOC, DOCX all supported
- ✅ IMAP connection loss → Auto-reconnect after 30s

### **Scenario 3: AI Scoring Edge Cases**
- ✅ CV with missing sections → Partial parsing works
- ✅ Low-quality CV → Still scored (may be REJECT)
- ✅ Perfect match → High score (SHORTLIST)
- ✅ API failure → Error logged, application still created

---

## 🔧 Configuration Requirements

### **Required Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=...

# Email (at least one)
RESEND_API_KEY=... OR
SENDGRID_API_KEY=... OR
SMTP_HOST=...

# IMAP (for email reader)
IMAP_HOST=imap.gmail.com
IMAP_USER=...
IMAP_PASS=...
ENABLE_EMAIL_READER=true

# AI Services
GROQ_API_KEY=... OR
GEMINI_API_KEY=...
```

---

## 📊 System Health Endpoints

### **Health Checks**
- `GET /health` - Basic server health
- `GET /health/email-reader` - Email reader status
- `GET /health/db` - Database connection status

### **Status Response Example**
```json
{
  "status": "ok",
  "emailReader": {
    "enabled": true,
    "running": true,
    "lastProcessedAt": "2026-02-08T10:30:00Z",
    "lastError": null
  },
  "timestamp": "2026-02-08T10:35:00Z"
}
```

---

## 🚨 Known Issues & Workarounds

1. **Email Reader**: Requires IMAP credentials configured
   - **Workaround**: Set `ENABLE_EMAIL_READER=false` to disable

2. **AI API Rate Limits**: Groq/Gemini may throttle requests
   - **Workaround**: Batch processing implemented, retry logic in place

3. **Report Generation**: Only runs for jobs with passed deadlines
   - **Workaround**: Can manually trigger via API endpoint

4. **File Storage**: Currently local filesystem
   - **Workaround**: S3 support available, configure `S3_*` env vars

---

## ✅ Conclusion

**All end-to-end flows are confirmed working:**

1. ✅ User signup → Job creation → Email processing → AI scoring → Report generation
2. ✅ Email reader automatically processes incoming applications
3. ✅ AI scoring pipeline extracts and scores candidates
4. ✅ Report scheduler generates reports for past-deadline jobs
5. ✅ Email notifications sent at each stage

**System is production-ready** with proper error handling, logging, and fallback mechanisms.

---

**Last Verified**: February 8, 2026
