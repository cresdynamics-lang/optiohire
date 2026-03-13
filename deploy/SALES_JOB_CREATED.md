# Sales Job at Cres Dynamics - Created and Monitoring

## ✅ Job Created Successfully

### Job Details
- **Company:** Cres Dynamics
- **Company ID:** `788623c8-e434-423f-a2d7-af199c0f4fa5`
- **Position:** Sales
- **Job ID:** `f189570d-2930-4bee-804b-ee2088a95fa0`
- **Status:** ACTIVE
- **Deadline:** 2026-04-07
- **Skills Required:** Sales, Customer Relations, Communication, Negotiation, CRM

### Job Description
We are looking for an experienced Sales professional to join our team. The ideal candidate will have a proven track record in sales, excellent communication skills, and the ability to build strong client relationships. Responsibilities include identifying new business opportunities, managing client accounts, and achieving sales targets.

## 📧 Email Watcher Configuration

### Status
- ✅ **Enabled:** Yes
- ✅ **Running:** Yes
- ✅ **Monitoring:** Inbox checked every 10 seconds
- ✅ **Last Check:** Active (updating continuously)

### Email Matching

The email watcher will now **automatically match** emails with subjects containing:

#### High Priority Matches (Score 6-10)
- ✅ **"Sales at Cres Dynamics"** - Exact match (Score 10)
- ✅ **"Sales"** - Job title match (Score 6)
- ✅ **"Cres Dynamics"** - Company match (Score 5)

#### Flexible Matches (Score 1-4)
- ✅ **"Application for Sales"** - Contains job title
- ✅ **"Sales Position"** - Keywords match
- ✅ **"Cres Dynamics Job"** - Company + keyword
- ✅ **Any subject with "Sales" or "Cres Dynamics"**

### Example Email Subjects That Will Match

1. ✅ `"Sales"`
2. ✅ `"Sales at Cres Dynamics"`
3. ✅ `"Application for Sales Position"`
4. ✅ `"Cres Dynamics - Sales Role"`
5. ✅ `"Job Application - Sales"`
6. ✅ `"Fwd: Sales At Cres Dynamics"` (will now match!)
7. ✅ `"Re: Sales Position"`
8. ✅ `"Sales Professional Application"`

## 🔍 Monitoring Emails

### Real-time Monitoring

**Option 1: Watch Script**
```bash
./scripts/watch-sales-emails.sh
```

**Option 2: Manual Log Monitoring**
```bash
tail -f backend logs | grep -i "sales\|cres"
```

**Option 3: Admin Dashboard**
- Applications: `http://localhost:3000/admin/applications`
- Filter by company: Cres Dynamics
- Filter by job: Sales

### What to Look For

When an email matches, you'll see in logs:
1. `🔍 Matching email subject: "..."` 
2. `✅ MATCH FOUND` or `✅ TITLE MATCH` or `✅ COMPANY MATCH`
3. `CV extracted and saved`
4. `Scoring successful ... score: X, status: Y`
5. `✅ Successfully processed application`

## 📧 Test Email

To test the email watcher:

**Send email to:** `applicationsoptiohire@gmail.com`

**Subject examples:**
- `"Sales"`
- `"Sales at Cres Dynamics"`
- `"Application for Sales Position"`
- `"Cres Dynamics - Sales Role"`

**Attachment:** CV file (PDF or DOCX)

**Expected Result:**
- Email processed within 10-30 seconds
- Application created in database
- CV extracted and scored
- Shortlist/rejection email sent to candidate

## 📊 Check Results

### Via Admin Dashboard
1. Login: `http://localhost:3000/admin/login`
2. Go to: `http://localhost:3000/admin/applications`
3. Look for applications with:
   - Job: "Sales"
   - Company: "Cres Dynamics"
   - CV attached (resume_url)
   - AI score (0-100)
   - AI status (SHORTLIST/FLAG/REJECT)

### Via Backend Logs
```bash
tail -f backend logs | grep -E "Sales|Cres|MATCH|CV extracted|Scoring"
```

## ✅ Summary

- ✅ **Job Created:** Sales at Cres Dynamics (ACTIVE)
- ✅ **Email Watcher:** Running and monitoring inbox
- ✅ **Flexible Matching:** Accepts any subject format
- ✅ **Ready to Process:** Will match emails automatically

The email watcher is now actively monitoring for emails matching the Sales position at Cres Dynamics. Any email with a subject containing "Sales" or "Cres Dynamics" will be automatically processed, CV extracted, scored, and applications created.
