'use client'

import { useState, useEffect, useCallback, useRef, Component, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { Bell, X, CheckCircle2, Briefcase } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationProvider, useNotifications } from '@/contexts/notification-context'
import { Sidebar } from './sidebar'
import { ChatbotWidget } from './chatbot-widget'

// Simple Error Boundary component
class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">Something went wrong. Please refresh the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}

// Shown only while auth is unknown (no token yet in client tree) — not a spinner
const DashboardChromeSkeleton = () => (
  <div className="flex min-h-screen flex-col lg:flex-row">
    <div className="hidden h-screen w-[min(18rem,calc(100vw-1.5rem))] max-w-[18rem] shrink-0 animate-pulse border-r border-slate-200 bg-slate-100   lg:block" />
    <div className="min-w-0 flex-1">
      <div className="h-14 animate-pulse border-b border-slate-200 bg-white  dark:bg-slate-950" />
      <div className="mx-auto max-w-[1440px] space-y-4 p-4 md:p-8">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200/80 /80" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200/70 /70" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Lightweight skeleton while lazy sections load (no blocking second “preload” gate)
const SectionLoader = ({ sectionName }: { sectionName: string }) => (
  <div className="space-y-6 px-1 py-2" aria-busy="true" aria-label={`Loading ${sectionName}`}>
    <div className="h-36 animate-pulse rounded-2xl bg-gradient-to-br from-slate-200/90 to-slate-100/80 dark:from-slate-800/90 dark:to-slate-900/80" />
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl bg-slate-200/70 /70"
          style={{ animationDelay: `${i * 75}ms` }}
        />
      ))}
    </div>
    <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60 /60" />
  </div>
)

// Safe fallback component for OverviewSection
const OverviewSectionFallback = function OverviewSectionFallback({ error }: { error?: any }) {
  return (
    <div className="p-6">
      <div className="text-center">
        <p className="text-red-500 mb-4">Failed to load overview section</p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          {error?.message || error?.toString() || 'Unknown error'}
        </p>
        <Button 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
          }} 
          className="bg-[#2D2DDD] hover:bg-[#2D2DDD] text-white shadow-none hover:shadow-none"
        >
          Reload Page
        </Button>
      </div>
    </div>
  )
}

// Lazy load all sections for optimal performance using Next.js dynamic imports
const LazyOverviewSection = dynamic(
  () => {
    return import('./sections/overview-section')
      .then((mod: any) => {
        // Validate module exists
        if (!mod || typeof mod !== 'object') {
          console.error('OverviewSection module is null/undefined or not an object')
          throw new Error('OverviewSection module not found')
        }
        
        // Validate export exists and is a function
        const OverviewSectionExport = mod.OverviewSection
        if (!OverviewSectionExport) {
          console.error('OverviewSection export is missing. Available exports:', Object.keys(mod))
          throw new Error('OverviewSection export not found')
        }
        
        if (typeof OverviewSectionExport !== 'function') {
          console.error('OverviewSection export is not a function:', typeof OverviewSectionExport)
          throw new Error('OverviewSection export is not a valid component')
        }
        
        // Return the component wrapped as default export
        return { default: OverviewSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading OverviewSection module:', err)
        // Return a safe fallback component that doesn't throw
        return { 
          default: function OverviewSectionErrorFallback() {
            return <OverviewSectionFallback error={err} />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="overview" />,
    ssr: false 
  }
)

const LazyJobSeekerOverviewSection = dynamic(
  () => {
    return import('./sections/job-seeker-overview-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('JobSeekerOverviewSection module not found')
        }
        const Export = mod.JobSeekerOverviewSection
        if (!Export || typeof Export !== 'function') {
          throw new Error('JobSeekerOverviewSection export not found')
        }
        return { default: Export }
      })
      .catch((err: any) => {
        console.error('Error loading JobSeekerOverviewSection:', err)
        return {
          default: function JobSeekerOverviewErrorFallback() {
            return <SectionLoader sectionName="dashboard" />
          },
        }
      })
  },
  {
    loading: () => <SectionLoader sectionName="dashboard" />,
    ssr: false,
  }
)

const LazyJobSeekerJobsSection = dynamic(
  () => {
    return import('./sections/job-seeker-jobs-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('JobSeekerJobsSection module not found')
        }
        const Export = mod.JobSeekerJobsSection
        if (!Export || typeof Export !== 'function') {
          throw new Error('JobSeekerJobsSection export not found')
        }
        return { default: Export }
      })
      .catch((err: any) => {
        console.error('Error loading JobSeekerJobsSection:', err)
        return {
          default: function JobSeekerJobsErrorFallback() {
            return <SectionLoader sectionName="jobs" />
          },
        }
      })
  },
  {
    loading: () => <SectionLoader sectionName="jobs" />,
    ssr: false,
  }
)

const LazyJobSeekerInterviewsSection = dynamic(
  () => {
    return import('./sections/job-seeker-interviews-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('JobSeekerInterviewsSection module not found')
        }
        const Export = mod.JobSeekerInterviewsSection
        if (!Export || typeof Export !== 'function') {
          throw new Error('JobSeekerInterviewsSection export not found')
        }
        return { default: Export }
      })
      .catch((err: any) => {
        console.error('Error loading JobSeekerInterviewsSection:', err)
        return {
          default: function JobSeekerInterviewsErrorFallback() {
            return <SectionLoader sectionName="interviews" />
          },
        }
      })
  },
  {
    loading: () => <SectionLoader sectionName="interviews" />,
    ssr: false,
  }
)

const LazyJobsSection = dynamic(
  () => {
    return import('./sections/jobs-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('JobsSection module not found')
        }
        const JobsSectionExport = mod.JobsSection
        if (!JobsSectionExport || typeof JobsSectionExport !== 'function') {
          throw new Error('JobsSection not found in module')
        }
        return { default: JobsSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading JobsSection:', err)
        return {
          default: function JobsSectionErrorFallback() {
            return <SectionLoader sectionName="jobs" />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="jobs" />,
    ssr: false 
  }
)

const LazyReportsSection = dynamic(
  () => {
    return import('./sections/reports-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('ReportsSection module not found')
        }
        const ReportsSectionExport = mod.ReportsSection
        if (!ReportsSectionExport || typeof ReportsSectionExport !== 'function') {
          throw new Error('ReportsSection not found in module')
        }
        return { default: ReportsSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading ReportsSection:', err)
        return {
          default: function ReportsSectionErrorFallback() {
            return <SectionLoader sectionName="reports" />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="reports" />,
    ssr: false 
  }
)

const LazyInterviewsSection = dynamic(
  () => {
    return import('./sections/interviews-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('InterviewsSection module not found')
        }
        const InterviewsSectionExport = mod.InterviewsSection
        if (!InterviewsSectionExport || typeof InterviewsSectionExport !== 'function') {
          throw new Error('InterviewsSection not found in module')
        }
        return { default: InterviewsSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading InterviewsSection:', err)
        return {
          default: function InterviewsSectionErrorFallback() {
            return <SectionLoader sectionName="interviews" />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="interviews" />,
    ssr: false 
  }
)

const LazyProfileSection = dynamic(
  () => {
    return import('./sections/profile-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('ProfileSection module not found')
        }
        const ProfileSectionExport = mod.ProfileSection
        if (!ProfileSectionExport || typeof ProfileSectionExport !== 'function') {
          throw new Error('ProfileSection not found in module')
        }
        return { default: ProfileSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading ProfileSection:', err)
        return {
          default: function ProfileSectionErrorFallback() {
            return <SectionLoader sectionName="profile" />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="profile" />,
    ssr: false 
  }
)

const LazyCreateJobSection = dynamic(
  () => {
    return import('./sections/create-job-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('CreateJobSection module not found')
        }
        const CreateJobSectionExport = mod.CreateJobSection
        if (!CreateJobSectionExport || typeof CreateJobSectionExport !== 'function') {
          throw new Error('CreateJobSection not found in module')
        }
        return { default: CreateJobSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading CreateJobSection:', err)
        return {
          default: function CreateJobSectionErrorFallback() {
            return <SectionLoader sectionName="new-job" />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="new-job" />,
    ssr: false 
  }
)

const LazyTemplatesSection = dynamic(
  () => {
    return import('./sections/templates-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('TemplatesSection module not found')
        }
        const TemplatesSectionExport = mod.TemplatesSection
        if (!TemplatesSectionExport || typeof TemplatesSectionExport !== 'function') {
          throw new Error('TemplatesSection not found in module')
        }
        return { default: TemplatesSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading TemplatesSection:', err)
        return {
          default: function TemplatesSectionErrorFallback() {
            return <SectionLoader sectionName="templates" />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="templates" />,
    ssr: false 
  }
)

const LazyEditJobSection = dynamic(
  () => {
    return import('./sections/edit-job-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('EditJobSection module not found')
        }
        const EditJobSectionExport = mod.EditJobSection
        if (!EditJobSectionExport || typeof EditJobSectionExport !== 'function') {
          throw new Error('EditJobSection not found in module')
        }
        return { default: EditJobSectionExport }
      })
      .catch((err: any) => {
        console.error('Error loading EditJobSection:', err)
        return {
          default: function EditJobSectionErrorFallback() {
            return <SectionLoader sectionName="edit-job" />
          }
        }
      })
  },
  { 
    loading: () => <SectionLoader sectionName="edit-job" />,
    ssr: false 
  }
)

const LazyTalentProfileSection = dynamic(
  () => {
    return import('./sections/talent-profile-section')
      .then((mod: any) => {
        if (!mod || typeof mod !== 'object') {
          throw new Error('TalentProfileSection module not found')
        }
        const Export = mod.TalentProfileSection
        if (!Export || typeof Export !== 'function') {
          throw new Error('TalentProfileSection export not found')
        }
        return { default: Export }
      })
      .catch((err: any) => {
        console.error('Error loading TalentProfileSection:', err)
        return {
          default: function TalentProfileErrorFallback() {
            return <SectionLoader sectionName="talent-profile" />
          },
        }
      })
  },
  {
    loading: () => <SectionLoader sectionName="talent-profile" />,
    ssr: false,
  }
)

function dashboardPageMeta(pathname: string | null, isJobSeeker: boolean) {
  const p = pathname || ''
  if (p.startsWith('/hr/profile') || p.startsWith('/candidate/settings')) {
    return isJobSeeker
      ? { eyebrow: 'Candidate', title: 'My profile' }
      : { eyebrow: 'Workspace', title: 'Profile & company' }
  }
  if (p.startsWith('/candidate/profile')) {
    return { eyebrow: 'Candidate workspace', title: 'Talent Profile' }
  }
  if (p.startsWith('/hr/jobs/new')) {
    return { eyebrow: 'Hiring', title: 'Create new job' }
  }
  if (p.includes('/edit') && p.startsWith('/hr/jobs/')) {
    return { eyebrow: 'Hiring', title: 'Edit job posting' }
  }
  if (p.startsWith('/hr/jobs') || p.startsWith('/candidate/jobs')) {
    return isJobSeeker
      ? { eyebrow: 'Candidate workspace', title: 'Jobs' }
      : { eyebrow: 'Hiring', title: 'Job postings' }
  }
  if (p.startsWith('/hr/reports')) return { eyebrow: 'Hiring', title: 'Reports & analytics' }
  if (p.startsWith('/hr/templates')) return { eyebrow: 'Workspace', title: 'Email Templates' }
  if (p.startsWith('/hr/interviews') || p.startsWith('/candidate/interviews')) {
    return isJobSeeker
      ? { eyebrow: 'Candidate workspace', title: 'Interviews' }
      : { eyebrow: 'Hiring', title: 'Interviews' }
  }
  return isJobSeeker
    ? { eyebrow: 'Candidate workspace', title: 'My dashboard' }
    : { eyebrow: 'Employer workspace', title: 'Dashboard' }
}

function DashboardContent() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const normalizedCompanyRole = user?.companyRole?.toLowerCase()
  const normalizedRole = user?.role?.toLowerCase()
  const isJobSeeker =
    normalizedCompanyRole === 'candidate' ||
    normalizedCompanyRole === 'job_seeker' ||
    normalizedCompanyRole === 'jobseeker' ||
    normalizedRole === 'candidate' ||
    normalizedRole === 'job_seeker' ||
    normalizedRole === 'jobseeker'
  const pageMeta = dashboardPageMeta(pathname, isJobSeeker)
  const [activeSection, setActiveSection] = useState('overview')
  /** Nav drawer closed by default on all breakpoints; open via menu icon only. */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications()
  /** Avoid firing duplicate client navigations on every paint — feels like the site is “constantly refreshing”. */
  const redirectOnceRef = useRef<{ signIn?: boolean; admin?: boolean; companySetup?: boolean }>({})

  // STRICT: Check if user has company (except admin)
  useEffect(() => {
    if (loading && !user) return

    if (!user) {
      if (!redirectOnceRef.current.signIn) {
        redirectOnceRef.current.signIn = true
        router.replace('/auth/options?mode=signin')
      }
      return
    }
    redirectOnceRef.current.signIn = false

    // STRICT: Admin should ONLY access admin dashboard, not HR dashboard
    if (user.role === 'admin') {
      if (!redirectOnceRef.current.admin) {
        redirectOnceRef.current.admin = true
        router.replace('/admin')
      }
      return
    }
    redirectOnceRef.current.admin = false

    // STRICT: Require company setup before dashboard (e.g. Google sign-in). Keep token; redirect to company-setup.
    if (!isJobSeeker && user.hasCompany === false && !user.companyId) {
      if (!redirectOnceRef.current.companySetup) {
        redirectOnceRef.current.companySetup = true
        router.replace('/company-setup')
      }
      return
    }
    redirectOnceRef.current.companySetup = false
    // If hasCompany is undefined but companyId exists, allow access (company exists)
    // This handles cases where hasCompany wasn't set but company was created
  }, [user, loading, router, isJobSeeker])

  // Sync active section with URL pathname
  useEffect(() => {
    if (pathname === '/dashboard' || pathname === '/dashboard/' || pathname === '/hr' || pathname === '/hr/' || pathname === '/candidate' || pathname === '/candidate/') {
      setActiveSection('overview')
      return
    }
    if (pathname === '/dashboard/candidate' || pathname?.startsWith('/dashboard/candidate/') || pathname === '/candidate/profile' || pathname?.startsWith('/candidate/profile/')) {
      setActiveSection('talent-profile')
      return
    }
    if (pathname === '/dashboard/profile' || pathname?.startsWith('/dashboard/profile/') || pathname === '/hr/profile' || pathname?.startsWith('/hr/profile/') || pathname === '/candidate/settings' || pathname?.startsWith('/candidate/settings/')) {
      setActiveSection('profile')
      return
    }
    if (pathname === '/dashboard/jobs/new' || pathname === '/hr/jobs/new') {
      setActiveSection('create-job')
      return
    }
    if (pathname?.includes('/edit') && (pathname?.startsWith('/dashboard/jobs/') || pathname?.startsWith('/hr/jobs/'))) {
      setActiveSection('edit-job')
      return
    }
    if (pathname === '/dashboard/jobs' || pathname?.startsWith('/dashboard/jobs/') || pathname === '/hr/jobs' || pathname?.startsWith('/hr/jobs/') || pathname === '/candidate/jobs' || pathname?.startsWith('/candidate/jobs/')) {
      setActiveSection('jobs')
      return
    }
    if (pathname === '/dashboard/interviews' || pathname?.startsWith('/dashboard/interviews/') || pathname === '/hr/interviews' || pathname?.startsWith('/hr/interviews/') || pathname === '/candidate/interviews' || pathname?.startsWith('/candidate/interviews/')) {
      setActiveSection('interviews')
      return
    }
    if (!isJobSeeker && (pathname === '/dashboard/reports' || pathname?.startsWith('/dashboard/reports/') || pathname === '/hr/reports' || pathname?.startsWith('/hr/reports/'))) {
      setActiveSection('reports')
      return
    }
    if (!isJobSeeker && (pathname === '/dashboard/templates' || pathname?.startsWith('/dashboard/templates/') || pathname === '/hr/templates' || pathname?.startsWith('/hr/templates/'))) {
      setActiveSection('templates')
    }
  }, [pathname, isJobSeeker])

  // Optimized section rendering with lazy loading (no artificial preload gate — avoids double loading UX)
  const renderSection = useCallback(() => {
    if (!user) {
      return <SectionLoader sectionName="dashboard" />
    }

    try {
      switch (activeSection) {
        case 'overview':
          return isJobSeeker ? <LazyJobSeekerOverviewSection /> : <LazyOverviewSection />
        case 'talent-profile':
          return <LazyTalentProfileSection />
        case 'jobs':
          return isJobSeeker ? <LazyJobSeekerJobsSection /> : <LazyJobsSection />
        case 'create-job':
          return <LazyCreateJobSection />
        case 'edit-job':
          return <LazyEditJobSection />
        case 'reports':
          return <LazyReportsSection />
        case 'templates':
          return <LazyTemplatesSection />
        case 'interviews':
          return isJobSeeker ? <LazyJobSeekerInterviewsSection /> : <LazyInterviewsSection />
        case 'profile':
          return <LazyProfileSection />
        default:
          return isJobSeeker ? <LazyJobSeekerOverviewSection /> : <LazyOverviewSection />
      }
    } catch (error) {
      console.error('Error rendering section:', error)
      return (
        <div className="p-6 text-center">
          <p className="text-red-500 mb-4">Failed to render {activeSection} section</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button 
            onClick={() => router.refresh()} 
            className="bg-[#2D2DDD] hover:bg-[#2D2DDD] text-white shadow-none hover:shadow-none"
          >
            Reload Page
          </Button>
        </div>
      )
    }
  }, [activeSection, user, isJobSeeker, router])

  // Defer a single prefetch so the first dashboard paint is not competing with five parallel prefetches
  useEffect(() => {
    if (!user) return
    const t = window.setTimeout(() => {
      try {
        void router.prefetch(isJobSeeker ? '/candidate/jobs' : '/hr/jobs')
        if (!isJobSeeker) void router.prefetch('/hr/jobs/new')
      } catch {
        /* ignore */
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [router, user, isJobSeeker])

  // Optimized section change handler - now includes URL navigation
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section)
    // Update URL using Next.js router for proper client-side navigation
    const sectionMap: Record<string, string> = isJobSeeker
      ? {
          overview: '/candidate',
          'talent-profile': '/candidate/profile',
          jobs: '/candidate/jobs',
          interviews: '/candidate/interviews',
          profile: '/candidate/settings',
        }
      : {
          overview: '/hr',
          jobs: '/hr/jobs',
          'create-job': '/hr/jobs/new',
          'edit-job': pathname || '/hr/jobs',
          reports: '/hr/reports',
          interviews: '/hr/interviews',
          profile: '/hr/profile',
        }
    const newPath = sectionMap[section] || (isJobSeeker ? '/candidate' : '/hr')
    router.push(newPath)
  }, [router, isJobSeeker, pathname])

  // No session: redirect runs in useEffect — avoid skeleton (reads as “stuck loading”) during client nav / sign-out
  if (!user) {
    return <div className="min-h-screen bg-slate-50 dark:bg-gray-950" aria-hidden />
  }

  // Company setup redirect in flight — minimal pulse (effect calls router.replace)
  if (user.role !== 'admin' && !isJobSeeker && user.hasCompany === false && !user.companyId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 [background-image:linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] dark:[background-image:none]">
        <DashboardChromeSkeleton />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-gray-950 text-foreground [background-image:radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_42%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] dark:[background-image:radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_42%)]" >
      {isSidebarOpen && !isJobSeeker && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        id="dashboard-sidebar"
        role="navigation"
        aria-label="Dashboard navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(18rem,calc(100vw-1.5rem))] max-w-[18rem] flex-shrink-0 border-r border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 transform transition-transform duration-300 ease-out supports-[padding:max(0px)]:pl-[env(safe-area-inset-left)]  dark:bg-slate-950 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <ErrorBoundary fallback={<div className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-screen p-4 flex items-center justify-center"><p className="text-gray-600 dark:text-gray-400">Sidebar unavailable. Refresh the page.</p></div>}>
          <Sidebar
            onSectionChange={(section) => {
              handleSectionChange(section)
              setIsSidebarOpen(false)
            }}
          />
        </ErrorBoundary>
      </aside>
      
      <main 
        className={`min-w-0 flex-1 overflow-auto bg-transparent transition-all duration-300 ease-out ${
          isSidebarOpen && isJobSeeker ? 'translate-x-[18rem] md:translate-x-0 md:ml-[18rem]' : ''
        }`}
      >
        {/* Top bar: wayfinding + notifications */}
        <div className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 pt-[env(safe-area-inset-top)] shadow-sm shadow-slate-900/[0.06] backdrop-blur-xl  dark:bg-slate-950/90">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2D2DDD]/35 to-transparent" aria-hidden />
          <div className="relative flex items-center justify-between gap-2 p-3 sm:gap-3 sm:p-4 md:px-6 md:py-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((open) => !open)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:scale-[0.98]   dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isSidebarOpen}
                  aria-controls="dashboard-sidebar"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <div className="min-w-0">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px] dark:text-slate-400">
                    {pageMeta.eyebrow}
                  </p>
                  {!isJobSeeker && (
                    <span className="rounded-full bg-[#2D2DDD]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2D2DDD] ring-1 ring-[#2D2DDD]/25">
                      Hiring
                    </span>
                  )}
                </div>
                <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-50">
                  {pageMeta.title}
                </h1>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
              {!isJobSeeker && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl border-slate-200 sm:hidden "
                    aria-label="Job postings"
                  >
                    <Link href="/hr/jobs" prefetch={false}>
                      <Briefcase className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="hidden h-9 rounded-lg bg-[#2D2DDD] px-3 text-xs font-semibold text-white shadow-none hover:bg-[#2525c4] sm:inline-flex md:h-10 md:px-4 md:text-sm"
                  >
                    <Link href="/hr/jobs/new" prefetch={false}>
                      <Briefcase className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
                      Post a role
                    </Link>
                  </Button>
                </>
              )}
              {/* Notifications Bell - Moved to far right */}
              <Popover open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="relative h-11 min-h-[44px] w-11 min-w-[44px] rounded-xl border border-slate-200 bg-white p-0 shadow-sm hover:bg-slate-50"
                  >
                    <Bell className="w-5 h-5 text-slate-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[100] w-[min(calc(100vw-2rem),20rem)] max-h-[min(70vh,28rem)] overflow-hidden border border-gray-200 bg-white p-0 shadow-xl backdrop-blur-none dark:border-gray-700 dark:bg-gray-900 sm:w-80"
                  align="end"
                  sideOffset={8}
                >
                  <div className="p-4 border-b border-border bg-background">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      {notifications.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="h-9 min-h-[44px] touch-manipulation text-xs text-[#2D2DDD] hover:text-[#2D2DDD] hover:bg-[#2D2DDD]/10 sm:h-8 sm:min-h-0"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto bg-background">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                              !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'error' ? 'bg-red-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              } ${notification.read ? 'opacity-50' : ''}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium text-foreground ${
                                      notification.read ? 'opacity-60' : ''
                                    }`}>
                                      {notification.title}
                                    </p>
                                    <p className={`text-xs text-gray-600 dark:text-gray-400 mt-1 ${
                                      notification.read ? 'opacity-60' : ''
                                    }`}>
                                      {notification.description}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                      {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <button
                                      type="button"
                                      onClick={() => markAsRead(notification.id)}
                                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-200 touch-manipulation dark:hover:bg-gray-700 sm:min-h-0 sm:min-w-0 sm:p-1"
                                      title="Mark as read"
                                    >
                                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeNotification(notification.id)}
                                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-200 touch-manipulation dark:hover:bg-gray-700 sm:min-h-0 sm:min-w-0 sm:p-1"
                                    title="Dismiss"
                                  >
                                    <X className="h-4 w-4 text-gray-400" />
                                  </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="relative z-20 mx-auto w-full max-w-[1440px] px-3 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-6 md:p-8 lg:px-10 lg:pb-12">
          <ErrorBoundary fallback={<SectionLoader sectionName={activeSection} />}>
            <div className="min-w-0">
              {renderSection()}
            </div>
          </ErrorBoundary>
        </div>
      </main>
      
      {/* Toast Notification System */}
      <Toaster />
      {!isJobSeeker && <ChatbotWidget />}
    </div>
  )
}

export function OptimizedDashboardLayout() {
  return (
    <NotificationProvider>
      <DashboardContent />
    </NotificationProvider>
  )
}

export default OptimizedDashboardLayout
