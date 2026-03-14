# Email Sending Delay and Retry System

## ✅ Changes Implemented

### 1. 5-Second Delay Before Sending Emails
**Location:** `backend/src/server/email-reader.ts`

**Change:**
- Feedback emails (shortlist/rejection) are now sent **5 seconds after** CV processing completes
- Uses `setTimeout` to delay email sending
- Prevents immediate email sending, giving time for any processing to complete

**Code:**
```typescript
// Schedule email to be sent after 5 seconds
setTimeout(async () => {
  // Send email here
}, 5000) // 5 second delay
```

### 2. Background Email Retry Checker
**Location:** `backend/src/server/email-retry-checker.ts` (new file)

**Features:**
- Runs every **10 seconds** automatically
- Finds applications with `SHORTLIST` or `REJECT` status that don't have sent emails
- **Sends emails immediately** when found (no delay)
- Checks applications from last 1 hour
- Logs all actions for monitoring

**How It Works:**
1. Queries database for applications missing feedback emails
2. For each missing email:
   - Determines email type (shortlist or rejection)
   - Sends email immediately via `EmailService`
   - Logs success/failure
3. Runs continuously in background

### 3. Auto-Start on Server Boot
**Location:** `backend/src/server.ts`

**Change:**
- Email retry checker starts automatically when backend starts
- Only runs if email watcher is enabled (`ENABLE_EMAIL_READER !== 'false'`)
- Disabled in test environment

## 🔄 Flow Diagram

### Normal Flow (New Applications)
```
1. Email arrives → Email Watcher detects
2. CV extracted and scored
3. Status set (SHORTLIST/REJECT)
4. ⏱️ Wait 5 seconds
5. 📧 Send feedback email
```

### Retry Flow (Missing Emails)
```
1. Retry Checker runs (every 10 seconds)
2. Query: Find applications without sent emails
3. For each missing email:
   - 📧 Send immediately (no delay)
   - ✅ Log success/failure
```

## 📊 Monitoring

### Check Retry Checker Status
The retry checker logs its activity:
- `🔄 Email retry checker started` - Checker started
- `🔍 Found X application(s) with missing feedback emails` - Missing emails found
- `📧 Sending shortlist/rejection email immediately` - Email being sent
- `✅ Email sent successfully` - Success
- `❌ Failed to send email` - Failure (with error details)

### View Logs
```bash
# Watch retry checker activity
tail -f backend/logs/app.log | grep "EMAIL RETRY CHECKER"

# Or watch all email activity
tail -f backend/logs/app.log | grep -E "EMAIL WATCHER|EMAIL RETRY"
```

## ⚙️ Configuration

### Environment Variables
- `ENABLE_EMAIL_READER` - Must be `true` (or not set) for retry checker to run
- Email service configuration (Resend/SMTP) - Same as before

### Timing
- **Email Delay:** 5 seconds (hardcoded)
- **Retry Check Interval:** 10 seconds (hardcoded)
- **Check Window:** Last 1 hour of applications

## 🧪 Testing

### Test Normal Flow
1. Send application email
2. Wait 5-10 seconds
3. Check logs for:
   - `⏱️ Scheduling email to be sent in 5 seconds`
   - `📧 Sending shortlist/rejection email`
   - `✅ Email sent successfully`

### Test Retry Flow
1. Create application manually (or let one fail)
2. Wait up to 10 seconds
3. Check logs for:
   - `🔍 Found X application(s) with missing feedback emails`
   - `📧 Sending email immediately`
   - `✅ Email sent successfully`

## ✅ Benefits

1. **5-Second Delay:**
   - Prevents race conditions
   - Ensures all processing completes before email
   - Better user experience

2. **Automatic Retry:**
   - No manual intervention needed
   - Catches missed emails automatically
   - Runs continuously in background
   - Sends immediately when found (no delay)

3. **Reliability:**
   - Double safety net (delayed send + retry checker)
   - Comprehensive logging
   - Handles both SHORTLIST and REJECT statuses

## 📝 Notes

- **FLAG Status:** Does NOT trigger emails (by design - requires manual review)
- **Email Logs:** All emails logged in `email_logs` table
- **Error Handling:** Failures logged but don't stop processing
- **Performance:** Retry checker runs efficiently (checks last 1 hour, limits to 10 results)

## 🚀 Next Steps

1. **Restart Backend** to apply changes:
   ```bash
   cd backend && npm run dev
   ```

2. **Monitor Logs** to verify:
   - Email delay working (5 seconds)
   - Retry checker running (every 10 seconds)
   - Missing emails being sent immediately

3. **Test** by sending a new application and watching logs
