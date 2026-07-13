import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazyPage } from './lib/lazy-page'
import { RootLayout } from './layouts/RootLayout'
import { AdminLayoutWrapper } from './layouts/AdminLayoutWrapper'
import { InstitutionLayoutWrapper } from './layouts/InstitutionLayoutWrapper'
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import JobDetailPage from './pages/JobDetailPage'

// ─── Marketing / Public ───────────────────────────────────────────────────
const JobsPage = lazyPage(() => import('@/app/jobs/page'))
const PricingPage = lazyPage(() => import('@/app/pricing/page'))
const AboutPage = lazyPage(() => import('@/app/about/page'))
const FeaturesPage = lazyPage(() => import('@/app/features/page'))
const SolutionsPage = lazyPage(() => import('@/app/solutions/page'))
const SecurityPage = lazyPage(() => import('@/app/security/page'))
const PrivacyPage = lazyPage(() => import('@/app/privacy/page'))
const TrustSecurityPage = lazyPage(() => import('@/app/trust-security/page'))
const WhyOptioHirePage = lazyPage(() => import('@/app/why-optiohire/page'))
const UseCasesPage = lazyPage(() => import('@/app/use-cases/page'))
const ContactPage = lazyPage(() => import('@/app/contact/page'))
const DemoPage = lazyPage(() => import('@/app/demo/page'))
const BlogPage = lazyPage(() => import('@/app/blog/page'))
const CustomersPage = lazyPage(() => import('@/app/customers/page'))
const CompliancePage = lazyPage(() => import('@/app/compliance/page'))
const ApplyPage = lazyPage(() => import('@/app/apply/[id]/page'))
const CompanyJobsPage = lazyPage(() => import('@/app/companies/[id]/jobs/page'))

// ─── Auth ─────────────────────────────────────────────────────────────────
const AuthOptionsPage = lazyPage(() => import('@/app/auth/options/page'))
const AuthGoogleCallbackPage = lazyPage(() => import('@/app/auth/google/callback/page'))
const HrAuthSigninPage = lazyPage(() => import('@/app/hr/auth/signin/page'))
const HrAuthSignupPage = lazyPage(() => import('@/app/hr/auth/signup/page'))
const HrAuthForgotPage = lazyPage(() => import('@/app/hr/auth/forgot-password/page'))
const HrAuthResetPage = lazyPage(() => import('@/app/hr/auth/reset-password/page'))
const HrAuthVerifyPage = lazyPage(() => import('@/app/hr/auth/verify-email/page'))
const HrAuthGoogleCallbackPage = lazyPage(() => import('@/app/hr/auth/google/callback/page'))
const CandidateAuthSigninPage = lazyPage(() => import('@/app/candidate/auth/signin/page'))
const CandidateAuthSignupPage = lazyPage(() => import('@/app/candidate/auth/signup/page'))
const CandidateAuthForgotPage = lazyPage(() => import('@/app/candidate/auth/forgot-password/page'))
const CandidateAuthResetPage = lazyPage(() => import('@/app/candidate/auth/reset-password/page'))
const CandidateAuthVerifyPage = lazyPage(() => import('@/app/candidate/auth/verify-email/page'))
const CandidateAuthGoogleCallbackPage = lazyPage(() => import('@/app/candidate/auth/google/callback/page'))
const ConsoleAuthSigninPage = lazyPage(() => import('@/app/console/auth/signin/page'))
const InstitutionsAuthSigninPage = lazyPage(() => import('@/app/institutions/auth/signin/page'))

// ─── HR Portal ────────────────────────────────────────────────────────────
const HrPage = lazyPage(() => import('@/app/hr/page'))
const HrJobsPage = lazyPage(() => import('@/app/hr/jobs/page'))
const HrJobsNewPage = lazyPage(() => import('@/app/hr/jobs/new/page'))
const HrJobsEditPage = lazyPage(() => import('@/app/hr/jobs/[id]/edit/page'))
const HrProfilePage = lazyPage(() => import('@/app/hr/profile/page'))
const HrReportsPage = lazyPage(() => import('@/app/hr/reports/page'))
const HrInterviewsPage = lazyPage(() => import('@/app/hr/interviews/page'))
const HrTemplatesPage = lazyPage(() => import('@/app/hr/templates/page'))
const HrLeaderboardPage = lazyPage(() => import('@/app/hr/leaderboard/page'))
const HrHelpPage = lazyPage(() => import('@/app/hr/help/page'))
const HrJobShortlistedPage = lazyPage(() => import('@/app/hr/job/[jobId]/shortlisted/page'))
const HrJobCandidatePage = lazyPage(() => import('@/app/hr/job/[jobId]/candidate/[applicantId]/page'))

// ─── Candidate Portal ─────────────────────────────────────────────────────
const CandidatePage = lazyPage(() => import('@/app/candidate/page'))
const CandidateJobsPage = lazyPage(() => import('@/app/candidate/jobs/page'))
const CandidateProfilePage = lazyPage(() => import('@/app/candidate/profile/page'))
const CandidateSettingsPage = lazyPage(() => import('@/app/candidate/settings/page'))
const CandidateInterviewsPage = lazyPage(() => import('@/app/candidate/interviews/page'))
const CandidateLeaderboardPage = lazyPage(() => import('@/app/candidate/leaderboard/page'))
const CandidateHelpPage = lazyPage(() => import('@/app/candidate/help/page'))

// ─── Institutions ─────────────────────────────────────────────────────────
const InstitutionsOnboardPage = lazyPage(() => import('@/app/institutions/onboard/[token]/page'))
const InstitutionOverviewPage = lazyPage(() => import('@/app/institutions/[institutionId]/overview/page'))
const InstitutionOnboardingPage = lazyPage(() => import('@/app/institutions/[institutionId]/onboarding/page'))
const InstitutionRosterPage = lazyPage(() => import('@/app/institutions/[institutionId]/roster/page'))
const InstitutionTrackerPage = lazyPage(() => import('@/app/institutions/[institutionId]/tracker/page'))
const InstitutionNotificationsPage = lazyPage(() => import('@/app/institutions/[institutionId]/notifications/page'))
const InstitutionCohortsPage = lazyPage(() => import('@/app/institutions/[institutionId]/cohorts/page'))
const InstitutionSettingsPage = lazyPage(() => import('@/app/institutions/[institutionId]/settings/page'))
const InstitutionIndexPage = lazyPage(() => import('@/app/institutions/[institutionId]/page'))

// ─── Admin ────────────────────────────────────────────────────────────────
const AdminLoginPage = lazyPage(() => import('@/app/admin/login/page'))
const AdminPage = lazyPage(() => import('@/app/admin/page'))
const AdminDashboardPage = lazyPage(() => import('@/app/admin/dashboard/page'))
const AdminUsersPage = lazyPage(() => import('@/app/admin/users/page'))
const AdminUserDetailPage = lazyPage(() => import('@/app/admin/users/[userId]/page'))
const AdminCompaniesPage = lazyPage(() => import('@/app/admin/companies/page'))
const AdminCompanyDetailPage = lazyPage(() => import('@/app/admin/companies/[companyId]/page'))
const AdminJobsPage = lazyPage(() => import('@/app/admin/jobs/page'))
const AdminApplicationsPage = lazyPage(() => import('@/app/admin/applications/page'))
const AdminCandidatesPage = lazyPage(() => import('@/app/admin/candidates/page'))
const AdminAnalyticsPage = lazyPage(() => import('@/app/admin/analytics/page'))
const AdminAiUsagePage = lazyPage(() => import('@/app/admin/ai-usage/page'))
const AdminSettingsPage = lazyPage(() => import('@/app/admin/settings/page'))
const AdminEmailsPage = lazyPage(() => import('@/app/admin/emails/page'))
const AdminEmailsDeadLetterPage = lazyPage(() => import('@/app/admin/emails/dead-letter/page'))
const AdminInstitutionsPage = lazyPage(() => import('@/app/admin/institutions/page'))
const AdminInstitutionsOnboardingPage = lazyPage(() => import('@/app/admin/institutions/onboarding/page'))
const AdminSupportPage = lazyPage(() => import('@/app/admin/support/page'))
const AdminActivityPage = lazyPage(() => import('@/app/admin/activity/page'))
const AdminLoginsPage = lazyPage(() => import('@/app/admin/logins/page'))
const AdminSecurityLogsPage = lazyPage(() => import('@/app/admin/security-logs/page'))
const AdminSignupsPage = lazyPage(() => import('@/app/admin/signups/page'))
const AdminReportsPage = lazyPage(() => import('@/app/admin/reports/page'))
const AdminStatusPage = lazyPage(() => import('@/app/admin/status/page'))
const AdminHelpPage = lazyPage(() => import('@/app/admin/help/page'))
const AdminCheckEmailsPage = lazyPage(() => import('@/app/admin/check-emails/page'))
const AdminCertificatesPage = lazyPage(() => import('@/app/admin/certificates/page'))
const AdminTalentPoolPage = lazyPage(() => import('@/app/admin/talent-pool/page'))
const AdminHiredPage = lazyPage(() => import('@/app/admin/hired/page'))

// ─── Misc ─────────────────────────────────────────────────────────────────
const DashboardPage = lazyPage(() => import('@/app/dashboard/page'))
const CompanySetupPage = lazyPage(() => import('@/app/company-setup/page'))
const NotFoundPage = lazyPage(() => import('@/app/not-found'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Marketing
      { index: true, element: <HomePage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/:slug', element: <JobDetailPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'features', element: <FeaturesPage /> },
      { path: 'solutions', element: <SolutionsPage /> },
      { path: 'security', element: <SecurityPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'trust-security', element: <TrustSecurityPage /> },
      { path: 'why-optiohire', element: <WhyOptioHirePage /> },
      { path: 'use-cases', element: <UseCasesPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'demo', element: <DemoPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'compliance', element: <CompliancePage /> },
      { path: 'apply/:id', element: <ApplyPage /> },
      { path: 'companies/:id/jobs', element: <CompanyJobsPage /> },

      // Auth
      { path: 'auth/options', element: <AuthOptionsPage /> },
      { path: 'auth/google/callback', element: <AuthGoogleCallbackPage /> },
      { path: 'hr/auth/signin', element: <HrAuthSigninPage /> },
      { path: 'hr/auth/signup', element: <HrAuthSignupPage /> },
      { path: 'hr/auth/forgot-password', element: <HrAuthForgotPage /> },
      { path: 'hr/auth/reset-password', element: <HrAuthResetPage /> },
      { path: 'hr/auth/verify-email', element: <HrAuthVerifyPage /> },
      { path: 'hr/auth/google/callback', element: <HrAuthGoogleCallbackPage /> },
      { path: 'candidate/auth/signin', element: <CandidateAuthSigninPage /> },
      { path: 'candidate/auth/signup', element: <CandidateAuthSignupPage /> },
      { path: 'candidate/auth/forgot-password', element: <CandidateAuthForgotPage /> },
      { path: 'candidate/auth/reset-password', element: <CandidateAuthResetPage /> },
      { path: 'candidate/auth/verify-email', element: <CandidateAuthVerifyPage /> },
      { path: 'candidate/auth/google/callback', element: <CandidateAuthGoogleCallbackPage /> },
      { path: 'console/auth/signin', element: <ConsoleAuthSigninPage /> },
      { path: 'institutions/auth/signin', element: <InstitutionsAuthSigninPage /> },

      // HR
      { path: 'hr', element: <HrPage /> },
      { path: 'hr/jobs', element: <HrJobsPage /> },
      { path: 'hr/jobs/new', element: <HrJobsNewPage /> },
      { path: 'hr/jobs/:id/edit', element: <HrJobsEditPage /> },
      { path: 'hr/profile', element: <HrProfilePage /> },
      { path: 'hr/reports', element: <HrReportsPage /> },
      { path: 'hr/interviews', element: <HrInterviewsPage /> },
      { path: 'hr/templates', element: <HrTemplatesPage /> },
      { path: 'hr/leaderboard', element: <HrLeaderboardPage /> },
      { path: 'hr/help', element: <HrHelpPage /> },
      { path: 'hr/job/:jobId/shortlisted', element: <HrJobShortlistedPage /> },
      { path: 'hr/job/:jobId/candidate/:applicantId', element: <HrJobCandidatePage /> },

      // Candidate
      { path: 'candidate', element: <CandidatePage /> },
      { path: 'candidate/jobs', element: <CandidateJobsPage /> },
      { path: 'candidate/profile', element: <CandidateProfilePage /> },
      { path: 'candidate/settings', element: <CandidateSettingsPage /> },
      { path: 'candidate/interviews', element: <CandidateInterviewsPage /> },
      { path: 'candidate/leaderboard', element: <CandidateLeaderboardPage /> },
      { path: 'candidate/help', element: <CandidateHelpPage /> },

      // Institutions
      { path: 'institutions/onboard/:token', element: <InstitutionsOnboardPage /> },
      {
        path: 'institutions/:institutionId',
        element: <InstitutionLayoutWrapper />,
        children: [
          { index: true, element: <InstitutionIndexPage /> },
          { path: 'overview', element: <InstitutionOverviewPage /> },
          { path: 'onboarding', element: <InstitutionOnboardingPage /> },
          { path: 'roster', element: <InstitutionRosterPage /> },
          { path: 'tracker', element: <InstitutionTrackerPage /> },
          { path: 'notifications', element: <InstitutionNotificationsPage /> },
          { path: 'cohorts', element: <InstitutionCohortsPage /> },
          { path: 'settings', element: <InstitutionSettingsPage /> },
        ],
      },

      // Admin
      {
        path: 'admin',
        element: <AdminLayoutWrapper />,
        children: [
          { path: 'login', element: <AdminLoginPage /> },
          { index: true, element: <AdminPage /> },
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'users/:userId', element: <AdminUserDetailPage /> },
          { path: 'companies', element: <AdminCompaniesPage /> },
          { path: 'companies/:companyId', element: <AdminCompanyDetailPage /> },
          { path: 'jobs', element: <AdminJobsPage /> },
          { path: 'applications', element: <AdminApplicationsPage /> },
          { path: 'candidates', element: <AdminCandidatesPage /> },
          { path: 'analytics', element: <AdminAnalyticsPage /> },
          { path: 'ai-usage', element: <AdminAiUsagePage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
          { path: 'emails', element: <AdminEmailsPage /> },
          { path: 'emails/dead-letter', element: <AdminEmailsDeadLetterPage /> },
          { path: 'institutions', element: <AdminInstitutionsPage /> },
          { path: 'institutions/onboarding', element: <AdminInstitutionsOnboardingPage /> },
          { path: 'support', element: <AdminSupportPage /> },
          { path: 'activity', element: <AdminActivityPage /> },
          { path: 'logins', element: <AdminLoginsPage /> },
          { path: 'security-logs', element: <AdminSecurityLogsPage /> },
          { path: 'signups', element: <AdminSignupsPage /> },
          { path: 'reports', element: <AdminReportsPage /> },
          { path: 'status', element: <AdminStatusPage /> },
          { path: 'help', element: <AdminHelpPage /> },
          { path: 'check-emails', element: <AdminCheckEmailsPage /> },
          { path: 'certificates', element: <AdminCertificatesPage /> },
          { path: 'talent-pool', element: <AdminTalentPoolPage /> },
          { path: 'hired', element: <AdminHiredPage /> },
        ],
      },

      // Misc
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'company-setup', element: <CompanySetupPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Legacy redirects
  { path: '/favicon.ico', element: <Navigate to="/assets/logo/optiohire_mark_dark.png" replace /> },
])
