# Email Watcher Fixes - Ranking Email Delays

## ✅ Issues Fixed

### 1. Status Check Enhancement
**Problem:** Email sending only checked for `scoringResult.status === 'REJECTED'` but status might be 'REJECT' after mapping.

**Fix:** Now checks for both statuses:
```typescript
const shouldSendReject = scoringResult.status === 'REJECTED' || scoringResult.status === 'REJECT'
```

### 2. Enhanced Logging
**Added comprehensive logging:**
- `[EMAIL WATCHER]` prefix for all email watcher logs
- Detailed email sending decision logs
- Better error logging with full context
- Status tracking for each step

### 3. Polling Interval
**Changed:** `IMAP_POLL_MS=10000` → `IMAP_POLL_MS=5000`
- Email watcher now checks inbox every 5 seconds instead of 10 seconds

### 4. Monitoring Scripts Created
- `scripts/monitor-email-processing.sh` - Real-time monitoring of email processing
- `scripts/check-missing-emails.ts` - Check for applications that didn't receive emails
- `scripts/check-unread-emails.ts` - Check unread emails in inbox

## 🔍 How to Monitor

### Real-time Monitoring
```bash
# Monitor email processing and sending
./scripts/monitor-email-processing.sh
```

### Check for Missing Emails
```bash
cd backend && npx tsx ../scripts/check-missing-emails.ts
```

### Check Email Watcher Status
```bash
curl http://localhost:3001/health/email-reader | jq '.emailReader'
```

## 📊 What to Look For in Logs

### Successful Email Sending
```
📧 [EMAIL WATCHER] Sending shortlist email to candidate@example.com
✅ [EMAIL WATCHER] Shortlist email sent successfully to candidate@example.com
```

### Failed Email Sending
```
❌ [EMAIL WATCHER] Failed to send candidate decision email for application xxx
   Email error details: [error details]
```

### Email Processing
```
📧 [EMAIL WATCHER] Processing email #123: Subject="Sales Role at Cres Dynamics"
✅ [EMAIL WATCHER] MATCH FOUND: Email subject matches job posting
✅ [EMAIL WATCHER] Processed CV for application xxx, score: 90, status: SHORTLIST
```

## 🔧 Troubleshooting

### If Emails Still Not Sending

1. **Check Backend Logs:**
   ```bash
   # Look for [EMAIL WATCHER] logs
   tail -f backend/logs | grep "EMAIL WATCHER"
   ```

2. **Check Email Service Configuration:**
   - Verify `USE_RESEND=true` in `.env`
   - Check `RESEND_API_KEY` is set
   - Verify SMTP fallback is configured

3. **Check Email Logs Table:**
   ```sql
   SELECT recipient_email, email_type, status, error_message, created_at
   FROM email_logs
   WHERE email_type IN ('shortlist', 'rejection')
   ORDER BY created_at DESC
   LIMIT 10;
   ```

4. **Verify Applications Were Scored:**
   ```bash
   cd backend && npx tsx ../scripts/check-applications.ts
   ```

## 🚀 Next Steps

1. **Restart Backend** to apply the 5-second polling interval
2. **Monitor Logs** using the monitoring script
3. **Check for Missing Emails** if candidates report not receiving emails
4. **Review Email Logs** in admin dashboard or database

## 📝 Key Changes Made

1. ✅ Fixed status check to handle both 'REJECTED' and 'REJECT'
2. ✅ Added comprehensive `[EMAIL WATCHER]` logging
3. ✅ Enhanced error handling with full context
4. ✅ Changed polling interval to 5 seconds
5. ✅ Created monitoring and diagnostic scripts
