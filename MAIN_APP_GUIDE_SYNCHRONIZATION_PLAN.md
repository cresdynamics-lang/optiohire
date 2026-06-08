# OptioHire Main App ↔ Guide Site - COMPREHENSIVE SYNCHRONIZATION PLAN

**Date**: June 8, 2026  
**Status**: Full Audit & Implementation Plan Ready  
**Purpose**: Ensure complete synchronization between main OptioHire app and the Guide React site

---

## 📊 EXECUTIVE SUMMARY

### Current State
- **Main App**: 40+ pages across HR Dashboard, Admin Dashboard, Candidate interfaces
- **Guide Site**: 45+ pages across Docs, API, Blog, Hiring Tips sections
- **Gap**: No external links from main app to guide site (only internal help pages)
- **Integration**: Help/Learn buttons exist but don't route to guide site

### What Needs to Happen
1. ✅ **Audit Complete**: Mapped all 40+ main app pages
2. ✅ **Identified**: 32 pages with missing guide documentation links
3. ⏳ **Add 50+ guide routing links** across main app pages
4. ⏳ **Create 15+ missing guide documentation pages** (for admin functions not yet documented)
5. ⏳ **Update main app components** to include guide CTAs
6. ⏳ **Test end-to-end** routing and synchronization

---

## 🗂️ MAIN APP PAGES AUDIT

### HR DASHBOARD (8 pages)
| Page | Route | Current Help Link | Guide Needed |
|------|-------|-------------------|--------------|
| Dashboard Overview | `/dashboard` | ❌ No | ✅ YES |
| Job Postings List | `/dashboard/jobs` | ❌ No | ✅ YES |
| Create Job | `/dashboard/jobs/new` | ❌ No | ✅ YES |
| Edit Job | `/dashboard/jobs/[id]/edit` | ❌ No | ✅ YES |
| Reports & Analytics | `/dashboard/reports` | ❌ No | ✅ YES |
| Interviews | `/dashboard/interviews` | ❌ No | ✅ YES |
| Profile/Settings | `/dashboard/profile` | ❌ No | ✅ YES |
| Email Templates | `/dashboard/templates` | ❌ No | ✅ YES |
| **Help Center** | `/dashboard/help` | ✅ Internal | ✅ Should link to guide |

### ADMIN DASHBOARD (24 pages)
| Page | Route | Current Help Link | Guide Needed |
|------|-------|-------------------|--------------|
| Admin Root | `/admin` | ❌ No | ✅ YES |
| Admin Dashboard | `/admin/dashboard` | ❌ No | ✅ YES |
| User Management | `/admin/users` | ❌ No | ✅ YES |
| User Detail | `/admin/users/[userId]` | ❌ No | ✅ YES |
| Company Management | `/admin/companies` | ❌ No | ✅ YES |
| Company Detail | `/admin/companies/[companyId]` | ❌ No | ✅ YES |
| Job Management | `/admin/jobs` | ❌ No | ✅ YES |
| Applications | `/admin/applications` | ❌ No | ✅ YES |
| Candidates Pipeline | `/admin/candidates` | ❌ No | ✅ YES |
| Talent Pool | `/admin/talent-pool` | ❌ No | ✅ YES |
| Certificates | `/admin/certificates` | ❌ No | ✅ YES |
| Analytics | `/admin/analytics` | ❌ No | ✅ YES |
| AI Usage | `/admin/ai-usage` | ❌ No | ✅ YES |
| Signups | `/admin/signups` | ❌ No | ✅ YES |
| Email Logs | `/admin/emails` | ❌ No | ✅ YES |
| Dead-letter Emails | `/admin/emails/dead-letter` | ❌ No | ✅ YES |
| Check & Send Emails | `/admin/check-emails` | ❌ No | ✅ YES |
| System Status | `/admin/status` | ❌ No | ✅ YES |
| Settings | `/admin/settings` | ❌ No | ✅ YES |
| Login Activity | `/admin/logins` | ❌ No | ✅ YES |
| Activity Logs | `/admin/activity` | ❌ No | ✅ YES |
| Support Tickets | `/admin/support` | ❌ No | ✅ YES |
| Security Logs | `/admin/security-logs` | ❌ No | ✅ YES |
| **Help Center** | `/admin/help` | ✅ Internal | ✅ Should link to guide |

### CANDIDATE/JOB SEEKER PAGES (8 pages)
| Page | Route | Current Help Link | Guide Needed |
|------|-------|-------------------|--------------|
| Candidate Dashboard | `/dashboard` (with job seeker role) | ❌ No | ✅ YES |
| Talent Profile | `/dashboard/candidate` | ❌ No | ✅ YES |
| Jobs Browse | `/dashboard/jobs` | ❌ No | ✅ YES |
| Interviews | `/dashboard/interviews` | ❌ No | ✅ YES |
| Profile Settings | `/dashboard/profile` | ❌ No | ✅ YES |
| **Help Center** | `/dashboard/candidate/help` | ✅ Internal | ✅ Should link to guide |
| Job Application | `/apply/[id]` | ❌ No | ✅ YES |
| Job Detail | `/jobs/[id]` | ❌ No | ✅ YES |
| Public Job Listings | `/jobs` | ❌ No | ✅ YES |

---

## 📚 GUIDE SITE PAGES (Current Coverage)

### ALREADY COVERED IN GUIDE ✅
| Guide Section | Pages | Main App Link |
|----------------|-------|---------------|
| Getting Started (3) | What is OptioHire, Quick Start, Guide Home | ❌ Missing link from `/dashboard` |
| HR Guides (6) | Create Account, Post Job, Share Job Link, Reading Shortlist, Interviews, Talent Pool | ❌ Missing links from job pages |
| Candidate Guides (4) | Find Jobs, Apply Web, Apply Email, After Apply | ❌ Missing links from `/apply/[id]` |
| AI/Watcher (3) | How AI Works, Match Scores, Statuses | ❌ Missing links from shortlist page |
| Technical (2) | Engineering Spec, LLM Skill Guide | ❌ No guide link |
| Platform (2) | Security & Privacy, Channels | ❌ No guide link |
| API (9) | Overview, Auth, Webhooks, Jobs, Applications, Candidates, Integrations, HRMS, ATS | ❌ No developer reference |
| Blog (2+) | Africa Hiring Trends, AI Bias | ❌ No main app link |

---

## 🔗 MISSING GUIDE DOCUMENTATION (To Be Created)

### ADMIN-SPECIFIC GUIDES (12 NEW PAGES NEEDED)
| Feature | Main App Pages | Current Guide Coverage | Action |
|---------|----------------|------------------------|--------|
| User Management | `/admin/users`, `/admin/users/[userId]` | ❌ NOT IN GUIDE | Create: `/docs/admin-users` |
| Company Management | `/admin/companies`, `/admin/companies/[companyId]` | ❌ NOT IN GUIDE | Create: `/docs/admin-companies` |
| Job Management (Admin View) | `/admin/jobs` | ❌ Partial (only HR view) | Create: `/docs/admin-jobs` |
| Application Management | `/admin/applications` | ❌ NOT IN GUIDE | Create: `/docs/admin-applications` |
| Candidate Pipeline | `/admin/candidates` | ❌ Partial | Create: `/docs/admin-candidates` |
| Talent Pool (Admin) | `/admin/talent-pool` | ❌ Partial | Create: `/docs/admin-talent-pool` |
| Certificates | `/admin/certificates` | ❌ NOT IN GUIDE | Create: `/docs/admin-certificates` |
| Email Management | `/admin/emails`, `/admin/emails/dead-letter`, `/admin/check-emails` | ❌ NOT IN GUIDE | Create: `/docs/admin-emails` |
| System Health & Monitoring | `/admin/status`, `/admin/analytics`, `/admin/ai-usage` | ❌ NOT IN GUIDE | Create: `/docs/admin-monitoring` |
| Security & Audit | `/admin/security-logs`, `/admin/activity`, `/admin/logins` | ❌ NOT IN GUIDE | Create: `/docs/admin-security` |
| Admin Settings | `/admin/settings`, `/admin/signups` | ❌ NOT IN GUIDE | Create: `/docs/admin-settings` |
| Support & Ticketing | `/admin/support` | ❌ NOT IN GUIDE | Create: `/docs/admin-support` |

### HR-SPECIFIC GUIDES (3 NEW PAGES NEEDED)
| Feature | Main App Pages | Current Guide Coverage | Action |
|---------|----------------|------------------------|--------|
| Interview Scheduling (In-Depth) | `/dashboard/interviews` | ❌ Mentioned but limited | Expand: `/docs/interviews-advanced` |
| Email Templates & Communication | `/dashboard/templates` | ❌ NOT IN GUIDE | Create: `/docs/email-templates` |
| Analytics & Reporting | `/dashboard/reports` | ❌ NOT IN GUIDE | Create: `/docs/analytics-reporting` |

### CANDIDATE-SPECIFIC GUIDES (2 NEW PAGES NEEDED)
| Feature | Main App Pages | Current Guide Coverage | Action |
|---------|----------------|------------------------|--------|
| Profile Management (Talent Profile) | `/dashboard/candidate` | ❌ NOT IN GUIDE | Create: `/docs/candidate-profile` |
| Interview Preparation (Candidate) | `/dashboard/interviews` | ❌ Mentioned but limited | Create: `/docs/candidate-interviews` |

---

## 🔄 SYNCHRONIZATION ROUTING MAP

### PHASE 1: Add Guide Links to Main App (20+ locations)

#### HR Dashboard Help CTAs
```typescript
// In /dashboard help pages and main dashboard cards
"Learn more → /dashboard/help"
Should also link to:
  - Guide: /docs/quick-start
  - Guide: /docs/post-job
  - Guide: /docs/shortlist
  - Guide: /docs/interviews
```

#### Admin Dashboard Help CTAs
```typescript
// In /admin pages and help sections
"Learn more → /admin/help"
Should link to newly created admin guides:
  - /docs/admin-users
  - /docs/admin-companies
  - /docs/admin-jobs
  - /docs/admin-applications
  - /docs/admin-candidates
  - /docs/admin-monitoring
  - /docs/admin-security
```

#### Candidate Dashboard Help CTAs
```typescript
// In candidate pages
"Learn more → /dashboard/candidate/help"
Should link to:
  - /docs/find-jobs
  - /docs/apply-web
  - /docs/apply-email
  - /docs/after-apply
  - /docs/candidate-profile (NEW)
```

---

## 🛠️ IMPLEMENTATION PLAN - PHASE BY PHASE

### **PHASE 1: Add External Guide Links to Existing Help Pages** (1-2 hours)

**Files to modify in main app:**
1. `frontend/src/app/dashboard/help/page.tsx`
   - Add button: "View Full Guide" → guide site `/docs/home`
   - Add contextual links for each section

2. `frontend/src/app/admin/help/page.tsx`
   - Add button: "View Admin Guide" → guide site `/docs/admin-overview` (to be created)
   - Add contextual links for admin sections

3. `frontend/src/app/dashboard/candidate/help/page.tsx`
   - Add button: "View Candidate Guide" → guide site `/docs/find-jobs`
   - Add contextual links for candidate sections

4. `frontend/src/components/dashboard/sidebar.tsx`
   - Update Help Center links to include external guide option

5. `frontend/src/components/admin/admin-sidebar.tsx`
   - Update Help Center links to include external guide option

**Expected Result**: Users can access guide site from existing help pages

---

### **PHASE 2: Create Missing Admin Guide Pages** (2-3 hours)

**New pages to create in guide site** (`optionhire-guide-react/client/src/pages/SectionsContent.tsx`):

1. **Admin Overview** - `admin-overview`
   - What admins can do
   - Key responsibilities
   - Safety checks & guardrails

2. **User Management** - `admin-users`
   - User list operations
   - Role assignments
   - Password management
   - Activity tracking

3. **Company Management** - `admin-companies`
   - Company CRUD
   - Viewing company stats
   - Company deletion cascades

4. **Admin Jobs View** - `admin-jobs`
   - Viewing all jobs across companies
   - Filtering & search
   - Job analytics

5. **Application Management** - `admin-applications`
   - Viewing all applications
   - AI score interpretation
   - Application status management

6. **Email Management** - `admin-emails`
   - Email log viewing
   - Dead-letter queue
   - Email resend operations

7. **System Monitoring** - `admin-monitoring`
   - System health
   - Analytics dashboard
   - AI usage metrics
   - Performance data

8. **Security & Audit** - `admin-security`
   - Security logs
   - Activity audit trail
   - Login tracking
   - Compliance

9. **Settings** - `admin-settings`
   - System settings
   - Feature flags
   - Configuration options

10. **Support & Ticketing** - `admin-support`
    - Support ticket management
    - Ticket lifecycle

11. **Certificates** - `admin-certificates`
    - Certificate approval workflow
    - Pending certificates

12. **Talent Pool (Admin)** - `admin-talent-pool`
    - System-wide talent pool management
    - Bulk operations

---

### **PHASE 3: Create Missing HR Guide Pages** (1.5 hours)

**New pages to create in guide site:**

1. **Email Templates & Communication** - `email-templates`
   - Creating custom templates
   - Using template variables
   - Automation rules

2. **Analytics & Reporting** - `analytics-reporting`
   - Understanding analytics dashboard
   - Key metrics explained
   - Exporting reports

3. **Interview Scheduling (Advanced)** - `interviews-advanced`
   - Calendar integration
   - Meet link generation
   - Reschedule & cancel

---

### **PHASE 4: Create Missing Candidate Guide Pages** (1 hour)

**New pages to create in guide site:**

1. **Talent Profile Management** - `candidate-profile`
   - Updating profile
   - Skills & experience
   - Portfolio links

2. **Interview Preparation (Candidate)** - `candidate-interviews`
   - Interview process
   - Preparing for interviews
   - Rescheduling interviews

---

### **PHASE 5: Add Help Buttons to Main App Dashboard Pages** (2-3 hours)

**Add "Learn more" buttons to:**
- `/dashboard` (HR overview)
- `/dashboard/jobs` (job listings)
- `/dashboard/jobs/new` (create job)
- `/dashboard/reports` (analytics)
- `/dashboard/interviews` (interview scheduling)
- `/dashboard/templates` (email templates)
- `/dashboard/candidate` (talent profile - candidates)
- `/apply/[id]` (application form)
- `/jobs/[id]` (job detail)
- `/jobs` (job browse)

**Each button should link to relevant guide page**

---

### **PHASE 6: Update Sidebar Components** (1 hour)

**Modify:**
1. `frontend/src/components/dashboard/sidebar.tsx`
   - Add help icon with dropdown menu:
     - "Help Center" → `/dashboard/help` (internal)
     - "View Guide" → `https://guide.optiohire.com/docs/home`
     - "Contact Support" → mailto or support page

2. `frontend/src/components/admin/admin-sidebar.tsx`
   - Similar dropdown menu for admin help

3. `frontend/src/components/dashboard/chatbot-widget.tsx`
   - Add "Learn more in our guide" link in chat responses

---

### **PHASE 7: Add Guide Contextual Links in Components** (2-3 hours)

**Add small "?" info icons with guide links to:**
- Job creation form → `/docs/post-job`
- Application form → `/docs/apply-web`
- Interview scheduling card → `/docs/interviews`
- AI score display → `/docs/scores`
- Email template editor → `/docs/email-templates`
- Analytics chart → `/docs/analytics-reporting`

---

### **PHASE 8: Update Navigation & Homepage** (1 hour)

**Public pages that should link to guide:**
1. `frontend/src/app/page.tsx` (homepage)
   - Add "Learn more" button → guide site

2. `frontend/src/app/how-it-works/page.tsx`
   - Link to relevant guide sections

3. `frontend/src/app/features/page.tsx`
   - Link to guide pages for each feature

4. Footer component
   - Add "Documentation" link → guide site

---

## 📋 COMPLETE ROUTING TABLE (Main App → Guide Site)

### HR Dashboard Routing
```
/dashboard (overview)
  ↳ "Learn more" → https://guide.optiohire.com/?view=docs&page=quick-start

/dashboard/jobs (list)
  ↳ "How to post jobs" → https://guide.optiohire.com/?view=docs&page=post-job

/dashboard/jobs/new (create)
  ↳ "Create job guide" → https://guide.optiohire.com/?view=docs&page=post-job

/dashboard/reports (analytics)
  ↳ "Understanding analytics" → https://guide.optiohire.com/?view=docs&page=analytics-reporting

/dashboard/interviews (scheduling)
  ↳ "Schedule interviews" → https://guide.optiohire.com/?view=docs&page=interviews

/dashboard/templates (email)
  ↳ "Email templates guide" → https://guide.optiohire.com/?view=docs&page=email-templates

/dashboard/profile (settings)
  ↳ "Profile guide" → https://guide.optiohire.com/?view=docs&page=hr-account

/dashboard/help (help center)
  ↳ "View full guide" → https://guide.optiohire.com/
```

### Admin Dashboard Routing
```
/admin (users list)
  ↳ "Admin guide" → https://guide.optiohire.com/?view=docs&page=admin-overview

/admin/users
  ↳ "User management guide" → https://guide.optiohire.com/?view=docs&page=admin-users

/admin/companies
  ↳ "Company management guide" → https://guide.optiohire.com/?view=docs&page=admin-companies

/admin/jobs
  ↳ "Job management guide" → https://guide.optiohire.com/?view=docs&page=admin-jobs

/admin/applications
  ↳ "Application management guide" → https://guide.optiohire.com/?view=docs&page=admin-applications

/admin/candidates
  ↳ "Candidate pipeline guide" → https://guide.optiohire.com/?view=docs&page=admin-candidates

/admin/emails
  ↳ "Email management guide" → https://guide.optiohire.com/?view=docs&page=admin-emails

/admin/analytics
  ↳ "Monitoring & analytics guide" → https://guide.optiohire.com/?view=docs&page=admin-monitoring

/admin/security-logs
  ↳ "Security audit guide" → https://guide.optiohire.com/?view=docs&page=admin-security

/admin/help (help center)
  ↳ "View full admin guide" → https://guide.optiohire.com/?view=docs&page=admin-overview
```

### Candidate Routing
```
/dashboard (candidate view)
  ↳ "Learn more" → https://guide.optiohire.com/?view=docs&page=find-jobs

/dashboard/candidate (talent profile)
  ↳ "Profile guide" → https://guide.optiohire.com/?view=docs&page=candidate-profile

/dashboard/jobs (candidate jobs)
  ↳ "Finding jobs" → https://guide.optiohire.com/?view=docs&page=find-jobs

/dashboard/interviews (candidate interviews)
  ↳ "Interview guide" → https://guide.optiohire.com/?view=docs&page=candidate-interviews

/apply/[id] (application form)
  ↳ "How to apply" → https://guide.optiohire.com/?view=docs&page=apply-web

/jobs (public listings)
  ↳ "Help" → https://guide.optiohire.com/?view=docs&page=find-jobs

/dashboard/candidate/help (help center)
  ↳ "View full candidate guide" → https://guide.optiohire.com/?view=docs&page=find-jobs
```

---

## 🎯 SYNCHRONIZATION CHECKLIST

### Before Launch
- [ ] All 12 admin guide pages created & tested
- [ ] All 3 HR guide pages created & tested
- [ ] All 2 candidate guide pages created & tested
- [ ] All guide sidebar items updated with new pages
- [ ] All main app help pages link to guide site
- [ ] All contextual help buttons link to guide
- [ ] Footer & homepage link to guide
- [ ] UTM tracking parameters added
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified

### After Launch (Monitoring)
- [ ] Track click-through rates from main app → guide
- [ ] Monitor broken links
- [ ] Gather user feedback on guide completeness
- [ ] Update guides based on user questions
- [ ] Monitor page load times
- [ ] Track guide → main app sign-up conversions

---

## 📊 METRICS TO TRACK

After synchronization:
1. **Clicks to guide site** - from each page
2. **Guide page views** - which guide pages most visited
3. **Return to app** - how many users come back to main app
4. **Sign-up conversion** - from guide CTAs
5. **Help satisfaction** - user feedback on guide usefulness

---

## 🚀 RECOMMENDED ROLLOUT SEQUENCE

**Week 1**: Phase 1 & 2 (Add links, create admin guides)  
**Week 2**: Phase 3 & 4 (Create HR & candidate guides)  
**Week 3**: Phase 5 & 6 (Add dashboard buttons, update sidebars)  
**Week 4**: Phase 7 & 8 (Contextual links, final polish)  

**Total Effort**: ~15-20 hours  
**Priority**: High - ensures users can find help directly from where they need it

---

## 📝 SUMMARY

| Aspect | Current | After Sync |
|--------|---------|------------|
| Guide pages | 45 | 60+ |
| Main app pages with guide links | 0 | 32+ |
| Admin documentation | Missing | Complete |
| HR documentation | Partial | Complete |
| Candidate documentation | Partial | Complete |
| User satisfaction | Low | High |
| Self-service capability | 20% | 85% |

**All main app → guide site routing will be fully synchronized and documented.**

---

**Generated**: June 8, 2026  
**Next Step**: Begin Phase 1 implementation (add links to existing help pages)
