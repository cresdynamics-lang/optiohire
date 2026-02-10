# OptioHire Application - Complete Scan Summary

## 📋 Overview
**OptioHire** is an AI-powered recruitment platform built as a monorepo with separate frontend (Next.js) and backend (Express/TypeScript) applications. The system automates candidate screening, resume parsing, AI scoring, and report generation.

---

## 🏗️ Architecture

### **Tech Stack**

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **State Management**: Zustand, React Context
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **3D Graphics**: Three.js (@react-three/fiber)

#### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Email**: Resend (primary), SendGrid (fallback), SMTP (Gmail)
- **AI Services**: 
  - Groq (primary - fast & cost-effective)
  - Google Gemini (advanced features)
- **File Processing**: PDF parsing (pdf-parse, mammoth for Word docs)
- **Storage**: Local filesystem + S3-compatible storage support

---

## 📁 Project Structure

```
optiohire/
├── frontend/              # Next.js 14 application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── admin/     # Admin dashboard
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── dashboard/ # HR user dashboard
│   │   │   └── api/       # Next.js API routes
│   │   ├── components/    # React components
│   │   │   ├── dashboard/ # Dashboard-specific components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   └── ...
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
│
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── api/           # Route controllers
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Business logic services
│   │   │   ├── ai/        # AI services (scoring, parsing, reports)
│   │   │   ├── emailService.ts
│   │   │   └── reports/   # Report generation
│   │   ├── repositories/  # Data access layer
│   │   ├── middleware/    # Auth, tracking middleware
│   │   ├── db/            # Database schema & migrations
│   │   ├── cron/          # Scheduled tasks
│   │   ├── server/        # Email reader service
│   │   └── utils/         # Utility functions
│   └── scripts/           # Utility scripts
│
└── deploy/                # Deployment scripts & configs
```

---

## 🗄️ Database Schema

### **Core Tables**

1. **users**
   - User authentication (email, password_hash)
   - Roles: `user`, `admin`
   - Company roles: `hr`, `hiring_manager`
   - Admin approval workflow support

2. **companies**
   - Company profiles linked to users
   - Email addresses (company_email, hr_email, hiring_manager_email)
   - Settings stored as JSONB

3. **job_postings**
   - Job listings with full-text search support
   - Skills array, deadlines, interview slots
   - Status: `ACTIVE`, `CLOSED`, `DRAFT`

4. **applications**
   - Candidate applications
   - AI scoring (0-100) and status (`SHORTLIST`, `FLAG`, `REJECT`)
   - Parsed resume JSONB storage
   - Interview scheduling fields

5. **reports**
   - Generated PDF reports (post-deadline analysis)
   - Linked to job postings

6. **recruitment_analytics**
   - Aggregated analytics per job posting
   - Processing status tracking

7. **user_preferences**
   - Email notification preferences
   - Report generation settings

8. **analytics_events**
   - Cookie-based event tracking
   - Session tracking

9. **audit_logs**
   - System action audit trail

10. **password_reset_tokens**
    - Password reset token management

---

## 🔐 Authentication & Authorization

### **Flow**
1. User signs up → Creates user + company record
2. JWT token issued on successful login
3. Token stored in localStorage (frontend)
4. Backend middleware validates token on protected routes
5. Admin users have separate access paths

### **Security Features**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Company-scoped data access
- Admin approval workflow
- Token expiration handling

---

## 🤖 AI Features

### **1. Resume Parsing** (`CVParser`)
- Extracts text from PDF/DOC/DOCX files
- Parses structured data (skills, experience, education)
- Uses Groq/Gemini for intelligent extraction
- Stores parsed data as JSONB

### **2. Candidate Scoring** (`AIScoringEngine`)
- Scores candidates 0-100 based on job requirements
- Considers:
  - Skills match percentage
  - Experience relevance
  - Job description alignment
  - Company context
- Status assignment:
  - `SHORTLIST` (score ≥ 80)
  - `FLAG` (score 50-79)
  - `REJECT` (score < 50)

### **3. Report Generation** (`reportGenerator`)
- Post-deadline analysis reports
- AI-generated insights and recommendations
- PDF generation with charts and statistics
- Automatic generation via cron scheduler

---

## 📧 Email System

### **Email Providers** (Priority Order)
1. **Resend** (Primary - domain verification support)
2. **SendGrid** (Fallback - HTTPS API)
3. **SMTP** (Gmail fallback)

### **Email Types**
- **HR Notifications**: New applicant alerts
- **Candidate Emails**: 
  - Shortlist notifications
  - Rejection notifications
  - Interview scheduling confirmations
- **System Emails**: Activation, password reset

### **Email Reader Service** (`email-reader.ts`)
- IMAP-based email monitoring
- Automatically processes incoming job applications
- Extracts CVs from email attachments
- Triggers AI scoring pipeline
- Moves processed emails to archive folder

---

## 🎯 Key Features

### **HR Dashboard**
- Job posting management (create, edit, view)
- Candidate list with AI scores
- Interview scheduling
- Report generation and viewing
- Analytics dashboard
- Profile management

### **Admin Dashboard**
- User management
- Company management
- System-wide analytics
- Job posting oversight
- Application monitoring
- Activity logs

### **Public Pages**
- Landing page with hero section
- Features page
- Pricing page
- How it works
- Trust & security
- Use cases
- Contact form

---

## 🔄 Data Flow

### **Application Processing Pipeline**
1. **Email Received** → Email reader detects new email
2. **CV Extraction** → PDF/DOC parsed to text
3. **Resume Parsing** → AI extracts structured data
4. **Job Matching** → Email subject/body matched to job posting
5. **AI Scoring** → Candidate scored against job requirements
6. **Database Storage** → Application record created/updated
7. **Notifications** → HR notified, candidate receives status email

### **Report Generation Flow**
1. **Deadline Trigger** → Cron detects job deadline passed
2. **Data Aggregation** → All applications fetched for job
3. **AI Analysis** → AI generates insights and recommendations
4. **PDF Generation** → Report PDF created with charts
5. **Storage** → PDF saved to storage (local/S3)
6. **Email Delivery** → Report sent to HR team

---

## 🚀 Deployment

### **Production Setup**
- **Server**: Digital Ocean (143.244.162.13)
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **SSL**: Let's Encrypt certificates
- **Auto-start**: Systemd service + PM2 startup

### **Deployment Scripts**
- `deploy.sh` - Main deployment script
- `deploy/` directory contains:
  - PM2 configuration
  - Nginx configuration
  - SSL setup scripts
  - Health check scripts
  - Email monitoring scripts

---

## 🔧 Configuration

### **Environment Variables** (Key)
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Token signing secret
- `RESEND_API_KEY` - Email service API key
- `GROQ_API_KEY` - AI service API key
- `IMAP_HOST/USER/PASS` - Email reader config
- `NEXT_PUBLIC_BACKEND_URL` - Frontend API endpoint

### **Feature Flags**
- `ENABLE_EMAIL_READER` - Toggle email monitoring
- `USE_RESEND` - Email provider selection
- `DISABLE_REPORT_SCHEDULER` - Cron control
- `AI_PROVIDER` - Groq vs Gemini selection

---

## 📊 API Endpoints

### **Authentication**
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

### **Job Postings**
- `GET /api/job-postings` - List job postings
- `POST /api/job-postings` - Create job posting
- `GET /api/job-postings/:id` - Get job details
- `PUT /api/job-postings/:id` - Update job posting

### **Applications**
- `GET /api/hr/candidates` - List candidates
- `GET /api/hr/candidates/:id` - Get candidate details
- `POST /applications/score` - Manual scoring trigger

### **Reports**
- `GET /api/hr/reports/:jobId` - Get report
- `POST /api/hr/reports/generate` - Generate report

### **Admin**
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List users
- `GET /api/admin/companies` - List companies

---

## 🧪 Testing

### **Test Setup**
- Jest configuration for frontend
- Test files in `__tests__/` directories
- API route tests
- Component tests with Testing Library

---

## 🎨 UI/UX Features

### **Design System**
- shadcn/ui component library
- Dark mode support (next-themes)
- Responsive design (mobile-first)
- Accessibility (ARIA labels, keyboard navigation)

### **Animations**
- Framer Motion for page transitions
- GSAP for complex animations
- Loading states and spinners
- Smooth scroll (Lenis)

### **Performance**
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Font optimization (next/font)
- Service worker for PWA support

---

## 🔍 Monitoring & Logging

### **Logging**
- Structured logging with custom logger
- Log levels: info, warn, error
- File-based logging for production

### **Health Checks**
- `/health` - Basic health check
- `/health/email-reader` - Email reader status
- `/health/db` - Database connection check

---

## 📝 Key Files Reference

### **Backend**
- `backend/src/server.ts` - Express server entry point
- `backend/src/middleware/auth.ts` - Authentication middleware
- `backend/src/lib/ai-scoring.ts` - AI scoring engine
- `backend/src/server/email-reader.ts` - Email monitoring service
- `backend/src/services/emailService.ts` - Email sending service
- `backend/src/db/complete_schema.sql` - Database schema

### **Frontend**
- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/app/page.tsx` - Landing page
- `frontend/src/app/dashboard/page.tsx` - HR dashboard
- `frontend/src/hooks/use-auth.tsx` - Authentication hook
- `frontend/src/components/dashboard/optimized-dashboard-layout.tsx` - Main dashboard

---

## 🚨 Known Issues & Considerations

1. **Email Reader**: Requires IMAP credentials, can be disabled
2. **AI Costs**: Groq is cost-effective, Gemini for advanced features
3. **File Storage**: Currently local filesystem, S3 support available
4. **Admin Access**: Special header-based bypass for admin emails
5. **Company Requirement**: Non-admin users must have company profile

---

## 🎯 Next Steps / Recommendations

1. **Security**
   - Rotate JWT_SECRET in production
   - Implement rate limiting
   - Add CSRF protection
   - Review admin bypass mechanism

2. **Performance**
   - Implement Redis caching
   - Add database connection pooling
   - Optimize AI API calls (batch processing)

3. **Features**
   - Webhook integrations
   - Advanced analytics dashboard
   - Bulk operations for HR
   - Mobile app support

4. **Monitoring**
   - Add error tracking (Sentry)
   - Implement APM (Application Performance Monitoring)
   - Set up alerting for critical failures

---

## 📚 Documentation Files

- `ADMIN_DASHBOARD_PLAN.md` - Admin features planning
- `RESEND_SETUP.md` - Email service setup guide
- `env.example` - Environment variables template
- `.cursor/rules/` - Cursor IDE rules for development

---

**Last Updated**: February 8, 2026
**Version**: 1.0.0
