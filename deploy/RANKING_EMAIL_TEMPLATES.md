# Ranking Email Templates - Shortlist & Rejection

## Overview

When a CV is processed and scored, the system automatically sends ranking emails to candidates:
- **Shortlist Email** - Sent when AI score is 80-100 (SHORTLIST status)
- **Rejection Email** - Sent when AI score is 0-49 (REJECT status)
- **No Email** - When score is 50-79 (FLAG status) - HR reviews manually

## 📧 Shortlist Email Template

### Subject
```
You've been shortlisted – [Job Title] at [Company Name]
```

### HTML Content
```html
Dear [Candidate Name],

Congratulations! After reviewing your application for the **[Job Title]** position at **[Company Name]**, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled. You do not need to take any action at this time.

If you have any questions, feel free to contact our HR team at [HR Email].

We look forward to meeting you and learning more about how you can contribute to our team. Thank you!

Kind regards,
[Company Name]
Company Email: [HR Email]
```

### When Sent
- ✅ Automatically sent when CV is scored as **SHORTLIST** (80-100 points)
- ✅ Sent immediately after CV processing and scoring
- ✅ Includes job title and company name
- ✅ Professional, encouraging tone

## 📧 Rejection Email Template

### Subject
```
Update on Your Application for the [Job Title] Position at [Company Name]
```

### HTML Content
```html
Dear [Candidate Name],

Thank you for taking the time to apply for the **[Job Title]** position at **[Company Name]** and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.

After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.

Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within **[Company Name]**.

If you have any questions or would like feedback regarding your application, please feel free to contact us at [HR Email].

We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.

Kind regards,
[Company Name]
Company Email: [HR Email]
```

### When Sent
- ✅ Automatically sent when CV is scored as **REJECT** (0-49 points)
- ✅ Sent immediately after CV processing and scoring
- ✅ Professional, respectful tone
- ✅ Encourages future applications

## 📊 Scoring Thresholds

### SHORTLIST (80-100 points)
- **Email:** ✅ Shortlist email sent automatically
- **Content:** Congratulations, next steps, interview scheduling info
- **Tone:** Positive, encouraging

### FLAG (50-79 points)
- **Email:** ❌ No email sent (HR reviews manually)
- **Reason:** Borderline candidate, needs human review
- **Action:** HR decides whether to shortlist or reject

### REJECT (0-49 points)
- **Email:** ✅ Rejection email sent automatically
- **Content:** Thank you, not moving forward, encouragement
- **Tone:** Professional, respectful

## 🔍 How to Check Ranking Emails

### Via Admin Dashboard
1. Login: `http://localhost:3000/admin/login`
2. Go to: `http://localhost:3000/admin/emails`
3. Filter by:
   - Email Type: `shortlist` or `rejection`
   - Status: `sent` or `failed`
4. View email content in the email logs

### Via Backend Logs
Look for:
- `📧 Sending shortlist email to [email]`
- `✅ Shortlist email sent successfully`
- `📧 Sending rejection email to [email]`
- `✅ Rejection email sent successfully`

### Via API (requires admin token)
```bash
curl "http://localhost:3001/api/admin/emails?email_type=shortlist,rejection&limit=20" \
  -H "Authorization: Bearer <admin-token>" | jq
```

## 📋 Email Flow

1. **Email Arrives** → Email watcher detects
2. **CV Extracted** → PDF/DOCX attachment saved
3. **CV Scored** → AI scores CV against job (0-100)
4. **Status Determined** → SHORTLIST (80-100), FLAG (50-79), REJECT (0-49)
5. **Email Sent** → Shortlist or rejection email sent automatically
6. **Logged** → Email logged in `email_logs` table

## Example: Sales Position at Cres Dynamics

### If Candidate Scores 85 (SHORTLIST)
**Email Sent:**
```
Subject: You've been shortlisted – Sales at Cres Dynamics

Dear [Candidate Name],

Congratulations! After reviewing your application for the Sales position at Cres Dynamics, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled...
```

### If Candidate Scores 35 (REJECT)
**Email Sent:**
```
Subject: Update on Your Application for the Sales Position at Cres Dynamics

Dear [Candidate Name],

Thank you for taking the time to apply for the Sales position at Cres Dynamics...

After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time...
```

## Summary

✅ **Shortlist Emails:** Sent automatically for scores 80-100  
✅ **Rejection Emails:** Sent automatically for scores 0-49  
✅ **Flag Status:** No email (HR reviews manually)  
✅ **Professional Templates:** Both emails are professional and respectful  
✅ **Automatic:** No manual action required - emails sent immediately after scoring
