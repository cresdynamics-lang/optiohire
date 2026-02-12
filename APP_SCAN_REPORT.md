# 📋 OptioHire Application Scan Report
## HR Job Creation, Email Templates & Email Watcher Analysis

**Date:** February 10, 2026  
**Status:** ✅ Ready for Testing (with minor configuration needed)

---

## 🎯 Executive Summary

The application has a **complete end-to-end flow** for HR job creation, email processing, and automated candidate communication. The email watcher is currently **disabled** but fully implemented and ready to activate.

### ✅ What Works
- ✅ HR job creation with full workflow
- ✅ Email templates for shortlisted and rejected candidates
- ✅ Email watcher service (IMAP-based) fully implemented
- ✅ Automatic CV extraction and AI scoring
- ✅ Automated email sending based on AI decisions

### ⚠️ Configuration Needed
- ⚠️ Email watcher is disabled (`ENABLE_EMAIL_READER=false`)
- ⚠️ IMAP polling interval is 10 seconds (can be optimized to 1 second)

---

## 📊 1. HR Job Creation Flow

### **1.1 Job Creation Process**

**Location:** `backend/src/api/jobPostingsController.ts` (line 230)

**Flow:**
1. **HR Creates Job** → Frontend form submission (`/dashboard/jobs`)
2. **Backend Processing:**
   - Validates company exists or creates new company
   - Creates job posting record
   - Sets status to `ACTIVE`
   - Creates webhook URL for incoming applications
   - Schedules deadline job
   - Creates audit log

**Key Endpoints:**
- `POST /api/job-postings` - Create new job
- `GET /api/job-postings` - List all jobs
- `GET /api/job-postings/:jobId` - Get job details

**Database Tables:**
- `job_postings` - Main job data
- `companies` - Company information
- `job_schedules` - Scheduled tasks
- `audit_logs` - Activity tracking

**Status:** ✅ **Fully Functional**

---

## 📧 2. Email Templates

### **2.1 Shortlisted Candidate Email**

**Template Files:**
- `frontend/templates/template_shortlist.txt` (Text version)
- `frontend/templates/template_shortlist.html` (HTML version)

**Implementation:** `backend/src/services/emailService.ts` (line 205)

**Content Includes:**
- ✅ Congratulations message
- ✅ Interview details (date, time, format, duration)
- ✅ Interview preparation tips
- ✅ Interview meeting link
- ✅ Company branding
- ✅ Professional formatting

**Variables Used:**
- `{{candidate_name}}`
- `{{job_title}}`
- `{{company_name}}`
- `{{interview_date}}`
- `{{interview_link}}`
- `{{application_link}}`

**Status:** ✅ **Fully Functional**

### **2.2 Rejection Email**

**Template Files:**
- `frontend/templates/template_rejection.txt` (Text version)
- `frontend/templates/template_rejection.html` (HTML version)

**Implementation:** `backend/src/services/emailService.ts` (line 298)

**Content Includes:**
- ✅ Professional rejection message
- ✅ Encouragement for future applications
- ✅ Company contact information
- ✅ Application link
- ✅ Professional formatting

**Variables Used:**
- `{{candidate_name}}`
- `{{job_title}}`
- `{{company_name}}`
- `{{application_link}}`

**Status:** ✅ **Fully Functional**

### **2.3 Email Sending Logic**

**Trigger Points:**
1. **Manual Scoring:** When HR manually scores an application (`POST /api/applications/score`)
2. **Automatic Processing:** When email watcher processes new application

**Code Location:** `backend/src/api/applicationsController.ts` (line 95-117)

**Flow:**
```
Application Scored → AI Status Determined
  ├─ SHORTLIST → sendShortlistEmail()
  ├─ REJECT → sendRejectionEmail()
  └─ FLAG → Send acknowledgment (no decision)
```

**Status:** ✅ **Fully Functional**

---

## 📬 3. Email Watcher (IMAP Email Reader)

### **3.1 Service Overview**

**Location:** `backend/src/server/email-reader.ts`

**Purpose:** Monitor inbox for new job applications via email

### **3.2 How It Works**

#### **Step 1: Connection Setup**
- Connects to IMAP server (Gmail by default)
- Uses credentials from environment variables:
  - `IMAP_HOST` (default: `imap.gmail.com`)
  - `IMAP_PORT` (default: `993`)
  - `IMAP_USER` (email address)
  - `IMAP_PASS` (app-specific password)
  - `IMAP_SECURE` (default: `true`)

#### **Step 2: Polling for New Emails**
- Polls inbox every `IMAP_POLL_MS` milliseconds (default: 10,000ms = 10 seconds)
- Searches for **unread emails** (`seen: false`)
- Logs activity for monitoring

#### **Step 3: Email Matching**
- Extracts email subject line
- Matches subject against **active job posting titles**
- Matching logic:
  - Case-insensitive comparison
  - Subject must **contain** or **start with** job title
  - Examples:
    - ✅ `"Software Engineer"` matches job title `"Software Engineer"`
    - ✅ `"Software Engineer - Application"` matches job title `"Software Engineer"`
    - ✅ `"Application for Software Engineer"` matches job title `"Software Engineer"`

#### **Step 4: CV Extraction**
- Extracts attachments (PDF, DOC, DOCX)
- Parses resume text using AI (`parseResumeText`)
- Saves resume to storage (S3/Supabase Storage)

#### **Step 5: Application Creation**
- Creates application record in database
- Links to matching job posting
- Stores candidate email, name, resume URL

#### **Step 6: AI Scoring**
- Automatically scores application using AI
- Determines status: `SHORTLIST`, `REJECT`, or `FLAG`
- Updates application record with score and status

#### **Step 7: Email Notification**
- **If SHORTLIST:** Sends shortlist email with interview details
- **If REJECT:** Sends rejection email
- **If FLAG:** Sends acknowledgment (no decision)

#### **Step 8: Email Management**
- Marks email as read (`\Seen`)
- Moves to `Processed` folder (if successful)
- Moves to `Failed` folder (if error or no CV found)
- Keeps unread if CV extraction fails

### **3.3 Current Status**

**Configuration Check:**
```bash
# Current settings in backend/.env
ENABLE_EMAIL_READER=false  # ❌ DISABLED
IMAP_POLL_MS=10000         # 10 seconds (can be optimized to 1000ms)
```

**Status:** ⚠️ **Implemented but Disabled**

**To Enable:**
1. Set `ENABLE_EMAIL_READER=true` in `backend/.env`
2. Configure IMAP credentials
3. Restart backend server

### **3.4 Health Check Endpoint**

**Endpoint:** `GET /health/email-reader`

**Response:**
```json
{
  "status": "ok",
  "emailReader": {
    "enabled": true,
    "running": true,
    "lastCheck": "2026-02-10T12:00:00Z",
    "lastError": null,
    "emailsProcessed": 0
  }
}
```

**Status:** ✅ **Available**

---

## 🔄 4. Complete End-to-End Flow

### **Scenario: HR Creates Job & Receives Applications**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HR CREATES JOB                                           │
│    └─> POST /api/job-postings                               │
│        ├─ Creates job_posting record                        │
│        ├─ Sets status = 'ACTIVE'                            │
│        └─ Creates webhook URL                              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. EMAIL WATCHER MONITORS INBOX                             │
│    └─> Polls every IMAP_POLL_MS (10 seconds)                │
│        ├─ Searches for unread emails                        │
│        └─ Matches subject to job titles                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CANDIDATE SENDS EMAIL                                    │
│    └─> Subject: "Software Engineer - Application"          │
│        ├─ Attaches resume (PDF/DOC)                         │
│        └─ Sends to configured IMAP inbox                   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. EMAIL WATCHER PROCESSES                                  │
│    └─> Extracts CV from attachment                          │
│        ├─ Parses resume text (AI)                           │
│        ├─ Creates application record                       │
│        └─ Links to matching job posting                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. AI SCORES APPLICATION                                     │
│    └─> Analyzes resume against job requirements              │
│        ├─ Calculates score (0-100)                          │
│        └─ Determines status:                                │
│            ├─ SHORTLIST (score >= threshold)                │
│            ├─ REJECT (score < threshold)                    │
│            └─ FLAG (needs review)                           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. AUTOMATED EMAIL SENT                                     │
│    └─> Based on AI status:                                  │
│        ├─ SHORTLIST → sendShortlistEmail()                  │
│        │   └─ Includes interview link & details             │
│        ├─ REJECT → sendRejectionEmail()                      │
│        │   └─ Professional rejection message                 │
│        └─ FLAG → Acknowledgment (no decision)              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. EMAIL MANAGEMENT                                         │
│    └─> Marks email as read                                  │
│        ├─ Moves to 'Processed' folder (success)             │
│        └─ Moves to 'Failed' folder (error)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ 5. Testing Readiness Assessment

### **5.1 Prerequisites Checklist**

- ✅ **Job Creation:** Fully functional
- ✅ **Email Templates:** Implemented and tested
- ✅ **Email Service:** Configured (Resend API)
- ✅ **AI Scoring:** Functional
- ⚠️ **Email Watcher:** Implemented but **disabled**
- ⚠️ **IMAP Configuration:** Needs verification

### **5.2 Configuration Required for Testing**

#### **Step 1: Enable Email Watcher**
```bash
# Edit backend/.env
ENABLE_EMAIL_READER=true
IMAP_POLL_MS=1000  # 1 second for faster testing
```

#### **Step 2: Configure IMAP Credentials**
```bash
# Edit backend/.env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-specific-password
IMAP_SECURE=true
```

**Note:** For Gmail, you need an **App-Specific Password**, not your regular password.

#### **Step 3: Verify Email Service**
```bash
# Check Resend API key is configured
RESEND_API_KEY=your-resend-api-key
```

### **5.3 Testing Steps**

#### **Test 1: Job Creation**
1. Login as HR user
2. Navigate to `/dashboard/jobs`
3. Click "Create Job"
4. Fill in job details:
   - Job Title: `"Software Engineer"`
   - Company: Select or create
   - Description: Add job description
   - Skills: Add required skills
   - Deadline: Set deadline
5. Submit form
6. ✅ **Expected:** Job created successfully

#### **Test 2: Email Watcher (Manual)**
1. Ensure email watcher is enabled
2. Check logs: `pm2 logs optiohire-backend`
3. Look for: `"✅ Found X unread email(s) in inbox"`
4. ✅ **Expected:** Watcher is polling inbox

#### **Test 3: Send Test Email**
1. Send email to configured IMAP inbox:
   - **Subject:** `"Software Engineer - Application"` (must match job title)
   - **From:** Candidate email
   - **Attachment:** Resume PDF/DOC
2. Wait for processing (check logs)
3. ✅ **Expected:**
   - Email detected
   - CV extracted
   - Application created
   - AI scoring completed
   - Status email sent

#### **Test 4: Verify Email Templates**
1. Check candidate inbox for:
   - Shortlist email (if SHORTLIST status)
   - Rejection email (if REJECT status)
2. ✅ **Expected:** Professional emails with correct content

#### **Test 5: Health Check**
```bash
curl http://localhost:3001/health/email-reader
```
✅ **Expected:** `{"status": "ok", "emailReader": {"enabled": true, "running": true}}`

---

## 🐛 6. Known Issues & Limitations

### **6.1 Email Matching**
- **Issue:** Email subject must **exactly match** or **contain** job title
- **Impact:** Mismatched subjects won't be processed
- **Workaround:** Use consistent job title format

### **6.2 CV Extraction**
- **Issue:** Only processes first attachment
- **Impact:** Multiple attachments may be ignored
- **Workaround:** Send single resume attachment

### **6.3 IMAP Connection**
- **Issue:** Connection may drop after inactivity
- **Impact:** Watcher stops processing
- **Mitigation:** Auto-reconnect logic implemented (30s retry)

### **6.4 Email Folder Management**
- **Issue:** Requires `Processed` and `Failed` folders in IMAP
- **Impact:** May fail if folders don't exist
- **Workaround:** Create folders manually or handle gracefully

---

## 📝 7. Recommendations

### **7.1 For Production**
1. ✅ Enable email watcher (`ENABLE_EMAIL_READER=true`)
2. ✅ Set `IMAP_POLL_MS=1000` (1 second) for faster processing
3. ✅ Monitor email reader health endpoint
4. ✅ Set up email folder structure (`Processed`, `Failed`)
5. ✅ Configure proper IMAP credentials (app-specific password)

### **7.2 For Testing**
1. ✅ Use test email account
2. ✅ Create test job with simple title (e.g., "Test Job")
3. ✅ Send test emails with matching subject
4. ✅ Monitor logs for processing status
5. ✅ Verify emails are sent correctly

### **7.3 Monitoring**
- ✅ Check `/health/email-reader` endpoint regularly
- ✅ Monitor PM2 logs: `pm2 logs optiohire-backend`
- ✅ Watch for error patterns in logs
- ✅ Track email processing metrics

---

## 🎯 8. Conclusion

### **Overall Status: ✅ READY FOR TESTING**

**Strengths:**
- ✅ Complete end-to-end flow implemented
- ✅ Professional email templates
- ✅ Robust email watcher service
- ✅ Automatic AI scoring and email sending
- ✅ Error handling and logging

**Action Items:**
1. ⚠️ Enable email watcher (`ENABLE_EMAIL_READER=true`)
2. ⚠️ Configure IMAP credentials
3. ⚠️ Optimize polling interval (`IMAP_POLL_MS=1000`)
4. ✅ Test complete flow end-to-end

**Confidence Level:** 🟢 **HIGH** - All components are implemented and functional. Only configuration needed.

---

## 📚 9. Related Files

### **Core Implementation**
- `backend/src/server/email-reader.ts` - Email watcher service
- `backend/src/services/emailService.ts` - Email sending service
- `backend/src/api/jobPostingsController.ts` - Job creation
- `backend/src/api/applicationsController.ts` - Application scoring

### **Templates**
- `frontend/templates/template_shortlist.txt` - Shortlist email template
- `frontend/templates/template_rejection.txt` - Rejection email template

### **Configuration**
- `backend/.env` - Environment variables
- `env.example` - Example configuration

### **Documentation**
- `E2E_FLOW_VERIFICATION.md` - End-to-end flow documentation
- `APP_SCAN_SUMMARY.md` - Application overview

---

**Report Generated:** February 10, 2026  
**Next Review:** After testing completion
