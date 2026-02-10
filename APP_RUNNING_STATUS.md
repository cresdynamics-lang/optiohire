# Application Running Status

## ✅ Backend Server

**Status**: ✅ Running
**URL**: http://localhost:3001
**Health Check**: http://localhost:3001/health

### Test Backend

```bash
# Health check
curl http://localhost:3001/health

# Enhanced health check
curl http://localhost:3001/health | python3 -m json.tool

# Database health
curl http://localhost:3001/health/db

# Email reader status
curl http://localhost:3001/health/email-reader
```

---

## 🚀 Frontend Server

**Status**: Starting...
**URL**: http://localhost:3000

The frontend may take a moment to compile. Check the terminal output for status.

### Access Points

- **Landing Page**: http://localhost:3000
- **Sign In**: http://localhost:3000/auth/signin
- **Sign Up**: http://localhost:3000/auth/signup
- **Dashboard**: http://localhost:3000/dashboard
- **Admin Dashboard**: http://localhost:3000/admin

---

## 📊 New Features Available

### Enhanced Health Endpoint
```bash
curl http://localhost:3001/health
```

Returns comprehensive system status including:
- Database connectivity and latency
- Redis cache status
- Email reader status
- System uptime and version

### Admin Debugging Tools
```bash
# System diagnostics (requires admin auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/debug/diagnostics

# Query logs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/debug/query-logs

# Test connections
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/debug/test-db

curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/debug/test-redis
```

### Enhanced Analytics
```bash
# Comprehensive stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/analytics/enhanced

# Time-series data
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/analytics/timeseries?period=7d
```

---

## 🔍 Monitoring

### Check Backend Logs
The backend uses structured logging (Pino). Check terminal output for:
- Request logs
- Performance warnings (slow requests >1s)
- Error logs
- System status

### Check Frontend Logs
Check the frontend terminal for:
- Compilation status
- Build errors
- Runtime errors

---

## 🛑 Stopping the Servers

### Stop Backend
Press `Ctrl+C` in the backend terminal, or:
```bash
pkill -f "node.*backend"
```

### Stop Frontend
Press `Ctrl+C` in the frontend terminal, or:
```bash
pkill -f "next dev"
```

---

## 🐛 Troubleshooting

### Backend Not Starting
1. Check if port 3001 is available: `lsof -i :3001`
2. Check backend logs for errors
3. Verify database connection in `backend/.env`
4. Ensure dependencies are installed: `cd backend && npm install`

### Frontend Not Starting
1. Check if port 3000 is available: `lsof -i :3000`
2. Check frontend logs for compilation errors
3. Verify backend URL in `frontend/.env.local` or `next.config.js`
4. Clear Next.js cache: `rm -rf frontend/.next`

### Health Check Fails
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check database connection
3. Check Redis connection (optional)
4. Review backend logs

---

## ✅ Verification Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads in browser
- [ ] Can sign in/sign up
- [ ] Dashboard loads
- [ ] Admin features accessible (if admin)
- [ ] New health endpoint shows all services
- [ ] Performance monitoring active
- [ ] Logs showing structured format

---

**Last Updated**: February 8, 2026
**Status**: ✅ Backend Running | ⏳ Frontend Starting
