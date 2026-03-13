# Job Created Email Troubleshooting Guide

## Issue: Job Created Email Not Received

When you create a job posting, you should receive a confirmation email with:
- Job details (company, role, deadline)
- Subject line to use for applications
- Email forwarding setup instructions

## ✅ What Was Fixed

### 1. Email Error Handling
- ✅ Fixed `emailError` variable initialization
- ✅ Added validation for email recipients
- ✅ Improved error logging for each recipient
- ✅ Better error messages in API response

### 2. Recipient Validation
- ✅ Checks that `hr_email` and `company_email` are valid
- ✅ Filters out empty or invalid email addresses
- ✅ Logs warning if no valid recipients found

### 3. Email Logging
- ✅ Logs email attempts to `email_logs` table
- ✅ Records success/failure status
- ✅ Stores error messages for debugging

## 🔍 How to Diagnose

### Step 1: Check API Response

When creating a job, check the API response:
```json
{
  "success": true,
  "job_posting_id": "...",
  "emailSent": true/false,
  "emailError": "error message if failed",
  "recipients": ["email1@example.com", "email2@example.com"]
}
```

### Step 2: Check Backend Logs

Look for these log messages:
- ✅ Success: `✅ Job created email sent successfully to: email1@example.com, email2@example.com`
- ❌ Failure: `❌ Failed to send job posting created email: { error: "...", recipients: [...] }`
- ⚠️ Warning: `Cannot send job created email: no valid recipients`

### Step 3: Check Email Logs Table

Query the database:
```sql
SELECT 
  recipient_email,
  subject,
  email_type,
  status,
  error_message,
  created_at
FROM email_logs
WHERE email_type = 'notification'
  AND subject LIKE 'Job posted%'
ORDER BY created_at DESC
LIMIT 10;
```

### Step 4: Verify Email Configuration

Check backend `.env` file:
```bash
# Resend (Primary)
USE_RESEND=true
RESEND_API_KEY=your_key_here
RESEND_DOMAIN=optiohire.com

# SendGrid (Secondary)
USE_SENDGRID=false
SENDGRID_API_KEY=your_key_here

# SMTP (Fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=applicationsoptiohire@gmail.com
SMTP_PASS=your_app_password
```

## 🐛 Common Issues & Solutions

### Issue 1: No Email Recipients

**Symptoms:**
- `emailSent: false`
- `emailError: "No valid email addresses provided"`
- Warning in logs: "Cannot send job created email: no valid recipients"

**Solution:**
- Ensure `hr_email` is provided when creating job
- Ensure `company_email` is valid (if provided)
- Check that emails contain `@` symbol

### Issue 2: Resend Domain Not Verified

**Symptoms:**
- `emailError: "Resend API error: domain is not verified"`
- Logs show: "Resend failed (e.g. domain not verified), falling back to SendGrid or SMTP"

**Solution:**
- System should automatically fallback to SMTP
- If Resend keeps failing, set `USE_RESEND=false` to use SMTP directly
- Or verify domain in Resend dashboard: https://resend.com/domains

### Issue 3: SMTP Authentication Failed

**Symptoms:**
- `emailError: "SMTP authentication failed"`
- Logs show SMTP connection errors

**Solution:**
- Verify `SMTP_USER` and `SMTP_PASS` are correct
- For Gmail, use App Password (not regular password)
- Check Gmail "Less secure app access" settings
- Ensure 2FA is enabled and App Password is generated

### Issue 4: Rate Limiting

**Symptoms:**
- `emailError: "rate_limit_exceeded"` or `"Too many requests"`
- Logs show rate limit errors

**Solution:**
- Wait a few minutes before retrying
- Use multiple email service providers (Resend → SendGrid → SMTP)
- Check API rate limits in service dashboards

### Issue 5: Email Goes to Spam

**Symptoms:**
- Email sent successfully but not in inbox
- `emailSent: true` but email not received

**Solution:**
- Check spam/junk folder
- Verify sender email address is correct
- Check email service reputation
- Add sender to contacts/whitelist

## 🔧 Testing Email Sending

### Test via API

```bash
# Create a job posting
curl -X POST http://localhost:3001/api/job-postings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "company_name": "Test Company",
    "company_email": "hr@testcompany.com",
    "hr_email": "hr@testcompany.com",
    "job_title": "Test Position",
    "job_description": "Test description...",
    "required_skills": ["Skill1", "Skill2"],
    "application_deadline": "2026-12-31T23:59:59Z"
  }'

# Check response for emailSent and emailError
```

### Test Email Service Directly

Use the admin diagnostic endpoint:
```bash
# Check email service status
curl http://localhost:3001/api/admin/email-service/check \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Send test email
curl -X POST http://localhost:3001/api/admin/email-service/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"to": "your-email@example.com"}'
```

## 📋 Email Service Priority

The system tries email services in this order:

1. **Resend** (if `USE_RESEND=true` and `RESEND_API_KEY` set)
   - Fast, reliable
   - Requires domain verification
   - Falls back if domain not verified

2. **SendGrid** (if `USE_SENDGRID=true` and `SENDGRID_API_KEY` set)
   - Good deliverability
   - Requires API key setup

3. **SMTP** (fallback or if others disabled)
   - Works with Gmail, Outlook, etc.
   - Requires SMTP credentials
   - Most reliable fallback

## ✅ Verification Checklist

- [ ] `hr_email` is provided when creating job
- [ ] `company_email` is valid (if provided)
- [ ] At least one email service is configured
- [ ] Email service credentials are correct
- [ ] Backend logs show email attempt
- [ ] Check `email_logs` table for status
- [ ] Check spam folder if email sent successfully
- [ ] Verify email service is not rate-limited

## 📞 Next Steps

If email still not received after checking above:

1. **Check Backend Logs:**
   ```bash
   tail -f backend/logs/app.log | grep -i "job.*email\|email.*error"
   ```

2. **Check Email Logs Table:**
   ```sql
   SELECT * FROM email_logs 
   WHERE email_type = 'notification' 
   ORDER BY created_at DESC LIMIT 5;
   ```

3. **Test Email Service:**
   - Use admin diagnostic endpoints
   - Send test email to verify configuration

4. **Contact Support:**
   - Share backend logs
   - Share email_logs table entries
   - Share API response with `emailError`

## Summary

✅ **Fixed Issues:**
- Email error handling improved
- Recipient validation added
- Better error messages
- Improved logging

✅ **Email Flow:**
1. Job created → Validate recipients
2. Try Resend → Fallback to SendGrid → Fallback to SMTP
3. Log success/failure to `email_logs`
4. Return status in API response

The system now provides clear feedback on email sending status and automatically handles fallbacks between email services.
