# Cron watcher key configuration

## CRON_SECRET

The cron watcher key is used to authorize scheduled calls to the **auto-generate reports** endpoint. It is set in environment variables as **`CRON_SECRET`**.

### Where it is set

- **Backend:** `backend/.env` → `CRON_SECRET=...`
- **Frontend:** `frontend/.env.local` → `CRON_SECRET=...` (use the **same value** as backend if any cron or frontend job calls the backend)

Both env files should use the **same** value so external cron jobs and the backend report scheduler can call the protected endpoint.

### Where it is used

- **Endpoint:** `POST /api/system/reports/auto-generate`  
  (backend route: `backend/src/routes/reports.ts` → `reportsController.autoGenerateReports`)
- **Check:** Request must send the secret via either:
  - **Header:** `X-Cron-Secret: <CRON_SECRET>`
  - **Query:** `?secret=<CRON_SECRET>`
- If `CRON_SECRET` is set in env and the request does not send a matching value, the response is **401 Unauthorized**.

### Example: calling from cron (curl)

```bash
# Using header (preferred)
curl -X POST "https://your-backend.example.com/api/system/reports/auto-generate" \
  -H "X-Cron-Secret: YOUR_CRON_SECRET"

# Using query param
curl -X POST "https://your-backend.example.com/api/system/reports/auto-generate?secret=YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` and the URL with your actual `CRON_SECRET` and backend base URL.

### Internal scheduler

The backend also runs an **in-process** report scheduler (`backend/src/cron/reportScheduler.ts`) every 10 minutes. It does **not** use HTTP or `CRON_SECRET`; it calls the report service directly. `CRON_SECRET` is only for **external** HTTP calls to `POST /api/system/reports/auto-generate`.

### Security

- Use a long, random value (e.g. 64+ characters). Do not commit real secrets to git.
- In production, set `CRON_SECRET` in your hosting env (e.g. Vercel, Railway) and keep it the same as in the backend so cron triggers can authenticate.
