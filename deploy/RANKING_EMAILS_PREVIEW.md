# Ranking Emails Preview - Shortlist & Rejection

## 📧 Shortlist Email (Score 80-100)

### Subject Line
```
You've been shortlisted – Sales at Cres Dynamics
```

### Email Content

**HTML Version:**
```html
Dear [Candidate Name],

Congratulations! After reviewing your application for the **Sales** position at **Cres Dynamics**, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled. You do not need to take any action at this time.

If you have any questions, feel free to contact our HR team at hr@cresdynamics.com.

We look forward to meeting you and learning more about how you can contribute to our team. Thank you!

Kind regards,
Cres Dynamics
Company Email: hr@cresdynamics.com
```

**Plain Text Version:**
```
Dear [Candidate Name],

Congratulations! After reviewing your application for the Sales position at Cres Dynamics, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled. You do not need to take any action at this time.

If you have any questions, feel free to contact our HR team at hr@cresdynamics.com.

We look forward to meeting you. Thank you!

Kind regards,
Cres Dynamics
Company Email: hr@cresdynamics.com
```

### When Sent
- ✅ Automatically sent when CV scores **80-100 points**
- ✅ Sent immediately after CV processing
- ✅ Professional, encouraging tone

---

## 📧 Rejection Email (Score 0-49)

### Subject Line
```
Update on Your Application for the Sales Position at Cres Dynamics
```

### Email Content

**HTML Version:**
```html
Dear [Candidate Name],

Thank you for taking the time to apply for the **Sales** position at **Cres Dynamics** and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.

After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.

Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within **Cres Dynamics**.

If you have any questions or would like feedback regarding your application, please feel free to contact us at hr@cresdynamics.com.

We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.

Kind regards,
Company Name: Cres Dynamics
Company Email: hr@cresdynamics.com
```

**Plain Text Version:**
```
Dear [Candidate Name],

Thank you for taking the time to apply for the Sales position at Cres Dynamics and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.

After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.

Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within Cres Dynamics.

If you have any questions or would like feedback regarding your application, please feel free to contact us at hr@cresdynamics.com.

We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.

Kind regards,

Company Name: Cres Dynamics
Company Email: hr@cresdynamics.com
```

### When Sent
- ✅ Automatically sent when CV scores **0-49 points**
- ✅ Sent immediately after CV processing
- ✅ Professional, respectful tone
- ✅ Encourages future applications

---

## 📊 Scoring & Email Decision

| Score Range | Status | Email Sent | Email Type |
|------------|--------|-----------|------------|
| 80-100 | SHORTLIST | ✅ Yes | Shortlist Email |
| 50-79 | FLAG | ❌ No | HR Reviews Manually |
| 0-49 | REJECT | ✅ Yes | Rejection Email |

---

## 🔍 How to View Sent Ranking Emails

### Via Admin Dashboard
1. Login: `http://localhost:3000/admin/login`
2. Navigate to: `http://localhost:3000/admin/emails`
3. Filter by:
   - Email Type: `shortlist` or `rejection`
   - Status: `sent`
4. View email details including:
   - Recipient email
   - Subject line
   - Status (sent/failed)
   - Sent timestamp
   - Email content (in metadata)

### Via Backend Logs
Look for these log entries:
```
📧 Sending shortlist email to candidate@example.com for application xxx
✅ Shortlist email sent successfully to candidate@example.com

📧 Sending rejection email to candidate@example.com for application xxx
✅ Rejection email sent successfully to candidate@example.com
```

### Via Database Query
```sql
SELECT 
  recipient_email,
  subject,
  email_type,
  status,
  sent_at,
  metadata
FROM email_logs
WHERE email_type IN ('shortlist', 'rejection')
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📋 Email Flow for Sales Position

### Example: Candidate Scores 85 (SHORTLIST)

1. **Email Arrives** → `applicationsoptiohire@gmail.com`
2. **Subject Matched** → "Sales" or "Cres Dynamics" detected
3. **CV Extracted** → PDF/DOCX saved
4. **CV Scored** → AI scores: **85 points**
5. **Status Set** → **SHORTLIST** (80-100)
6. **Email Sent** → Shortlist email sent to candidate
7. **Logged** → Email logged in `email_logs` table

**Email Sent:**
```
To: candidate@example.com
Subject: You've been shortlisted – Sales at Cres Dynamics
Content: Congratulations message with next steps
```

### Example: Candidate Scores 35 (REJECT)

1. **Email Arrives** → `applicationsoptiohire@gmail.com`
2. **Subject Matched** → "Sales" or "Cres Dynamics" detected
3. **CV Extracted** → PDF/DOCX saved
4. **CV Scored** → AI scores: **35 points**
5. **Status Set** → **REJECT** (0-49)
6. **Email Sent** → Rejection email sent to candidate
7. **Logged** → Email logged in `email_logs` table

**Email Sent:**
```
To: candidate@example.com
Subject: Update on Your Application for the Sales Position at Cres Dynamics
Content: Thank you message, not moving forward, encouragement
```

---

## ✅ Summary

**Shortlist Emails:**
- ✅ Sent automatically for scores 80-100
- ✅ Subject: "You've been shortlisted – [Job Title] at [Company]"
- ✅ Content: Congratulations, next steps, interview scheduling info

**Rejection Emails:**
- ✅ Sent automatically for scores 0-49
- ✅ Subject: "Update on Your Application for the [Job Title] Position at [Company]"
- ✅ Content: Thank you, not moving forward, encouragement

**Flag Status:**
- ❌ No email sent (HR reviews manually)
- ⚠️ Score 50-79 needs human review

All ranking emails are sent automatically immediately after CV scoring, with no manual action required.
