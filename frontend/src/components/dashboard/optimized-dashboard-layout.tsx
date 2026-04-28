'use client'

import { useState, useEffect, useCallback, Component, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toaster'
import { Bell, X, CheckCircle2 } from 'lucide-react'
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

// Loading component for sections
const SectionLoader = ({ sectionName }: { sectionName: string }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading {sectionName}...</p>
    </div>
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

function dashboardPageMeta(pathname: string | null, isJobSeeker: boolean) {
  const p = pathname || ''
  if (p.startsWith('/dashboard/profile')) {
    return isJobSeeker
      ? { eyebrow: 'Candidate', title: 'My profile' }
      : { eyebrow: 'Workspace', title: 'Profile & company' }
  }
  if (p.startsWith('/dashboard/jobs')) return { eyebrow: 'Hiring', title: 'Job postings' }
  if (p.startsWith('/dashboard/reports')) return { eyebrow: 'Hiring', title: 'Reports & analytics' }
  if (p.startsWith('/dashboard/interviews')) return { eyebrow: 'Hiring', title: 'Interviews' }
  return isJobSeeker
    ? { eyebrow: 'Candidate workspace', title: 'My dashboard' }
    : { eyebrow: 'Employer workspace', title: 'Dashboard' }
}

function DashboardContent() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isJobSeeker = user?.companyRole === 'candidate'
  const pageMeta = dashboardPageMeta(pathname, isJobSeeker)
  const [activeSection, setActiveSection] = useState('overview')
  const [isPreloading, setIsPreloading] = useState(true)
  const [preloadTime, setPreloadTime] = useState<number>(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications()

  // STRICT: Check if user has company (except admin)
  useEffect(() => {
    if (loading) return // Wait for auth to load
    
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // STRICT: Admin should ONLY access admin dashboard, not HR dashboard
    if (user.role === 'admin') {
      router.push('/admin')
      return
    }

    // STRICT: Require company setup before dashboard (e.g. Google sign-in). Keep token; redirect to company-setup.
    if (!isJobSeeker && user.hasCompany === false && !user.companyId) {
      router.replace('/company-setup')
      return
    }
    // If hasCompany is undefined but companyId exists, allow access (company exists)
    // This handles cases where hasCompany wasn't set but company was created
  }, [user, loading, router, isJobSeeker])

  // Job seekers should not use employer-only routes; normalize to dashboard home.
  useEffect(() => {
    if (loading || !user || !isJobSeeker) return
    const employerOnly =
      pathname === '/dashboard/jobs' ||
      pathname?.startsWith('/dashboard/jobs/') ||
      pathname === '/dashboard/reports' ||
      pathname?.startsWith('/dashboard/reports/') ||
      pathname === '/dashboard/interviews' ||
      pathname?.startsWith('/dashboard/interviews/')
    if (employerOnly) {
      router.replace('/dashboard')
    }
  }, [loading, user, isJobSeeker, pathname, router])

  // Sync active section with URL pathname
  useEffect(() => {
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      setActiveSection('overview')
      return
    }
    if (pathname === '/dashboard/profile' || pathname?.startsWith('/dashboard/profile/')) {
      setActiveSection('profile')
      return
    }
    if (!isJobSeeker) {
      if (pathname === '/dashboard/jobs' || pathname?.startsWith('/dashboard/jobs/')) {
        setActiveSection('jobs')
      } else if (pathname === '/dashboard/reports' || pathname?.startsWith('/dashboard/reports/')) {
        setActiveSection('reports')
      } else if (pathname === '/dashboard/interviews' || pathname?.startsWith('/dashboard/interviews/')) {
        setActiveSection('interviews')
      }
    }
  }, [pathname, isJobSeeker])

  // Preload critical data for instant rendering
  const preloadCriticalData = useCallback(async () => {
    if (!user) {
      setIsPreloading(false)
      return
    }
    
    const startTime = performance.now()
    
    try {
      setIsPreloading(true)
      
      // Preload components by importing them (with timeout to not block UI)
      // Wrap each import in a try-catch to prevent one failure from blocking others
      await Promise.race([
        Promise.allSettled([
          import('./sidebar').catch(err => {
            console.warn('Sidebar preload failed:', err)
            return null
          }),
          (isJobSeeker
            ? import('./sections/job-seeker-overview-section')
            : import('./sections/overview-section')
          ).catch(err => {
            console.warn('Dashboard overview preload failed:', err)
            return null
          }),
        ]),
        new Promise(resolve => setTimeout(resolve, 200)) // Max 200ms preload time
      ])
      
      const endTime = performance.now()
      setPreloadTime(endTime - startTime)
      
      if (endTime - startTime < 200) {
        console.log(`Dashboard preloaded in ${(endTime - startTime).toFixed(2)}ms`)
      }
    } catch (error) {
      console.error('Dashboard preloading failed:', error)
      // Don't block rendering on preload errors
    } finally {
      setIsPreloading(false)
    }
  }, [user, isJobSeeker])

  // Preload data on mount
  useEffect(() => {
    preloadCriticalData()
  }, [preloadCriticalData])

  // Optimized section rendering with lazy loading
  const renderSection = useCallback(() => {
    if (isPreloading || !user) {
      return <SectionLoader sectionName="dashboard" />
    }

    try {
      switch (activeSection) {
        case 'overview':
          return isJobSeeker ? <LazyJobSeekerOverviewSection /> : <LazyOverviewSection />
        case 'jobs':
          return <LazyJobsSection />
        case 'reports':
          return <LazyReportsSection />
        case 'interviews':
          return <LazyInterviewsSection />
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
  }, [activeSection, isPreloading, user, isJobSeeker, router])

  // Prefetch main dashboard routes once user is ready for snappier navigation
  useEffect(() => {
    if (!user) return
    try {
      router.prefetch('/dashboard')
      if (!isJobSeeker) {
        router.prefetch('/dashboard/jobs')
        router.prefetch('/dashboard/reports')
        router.prefetch('/dashboard/interviews')
      }
      router.prefetch('/dashboard/profile')
    } catch (e) {
      console.warn('Dashboard prefetch failed:', e)
    }
  }, [router, user, isJobSeeker])

  // Optimized section change handler - now includes URL navigation
  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section)
    // Update URL using Next.js router for proper client-side navigation
    const sectionMap: Record<string, string> = isJobSeeker
      ? {
          overview: '/dashboard',
          profile: '/dashboard/profile',
        }
      : {
          overview: '/dashboard',
          jobs: '/dashboard/jobs',
          reports: '/dashboard/reports',
          interviews: '/dashboard/interviews',
          profile: '/dashboard/profile',
        }
    const newPath = sectionMap[section] || '/dashboard'
    router.push(newPath)
  }, [router, isJobSeeker])

  // Don't render until user is loaded and validated
  // Only block if hasCompany is explicitly false AND no companyId exists
  // If companyId exists, allow access even if hasCompany is undefined/false
  if (loading || !user || (user.role !== 'admin' && !isJobSeeker && user.hasCompany === false && !user.companyId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen bg-slate-50 text-foreground [background-image:radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_42%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]"
    >
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden
        />
      )}
      
      {/* Sidebar - hidden on mobile, visible on tablet and up; w-64 so column is always reserved */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex h-[100dvh] max-h-[100dvh] w-[min(18rem,calc(100vw-1.5rem))] max-w-[18rem] flex-shrink-0 transform transition-transform duration-300 supports-[padding:max(0px)]:pl-[env(safe-area-inset-left)] ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <ErrorBoundary fallback={<div className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-screen p-4 flex items-center justify-center"><p className="text-gray-600 dark:text-gray-400">Sidebar unavailable. Refresh the page.</p></div>}>
          <Sidebar
            activeSection={activeSection}
            onSectionChange={(section) => {
              handleSectionChange(section)
              setIsMobileMenuOpen(false)
            }}
          />
        </ErrorBoundary>
      </aside>
      
      <main className="flex-1 overflow-auto w-full lg:w-auto bg-transparent">
        {/* Top bar: wayfinding + notifications */}
        <div className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/90 pt-[env(safe-area-inset-top)] shadow-sm shadow-slate-900/5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 p-3 sm:gap-3 sm:p-4 md:px-6 md:py-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex-shrink-0 lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:scale-[0.98]"
                  aria-label="Menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-[11px]">
                  {pageMeta.eyebrow}
                </p>
                <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  {pageMeta.title}
                </h1>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
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
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
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
                  <div className="max-h-[400px] overflow-y-auto bg-white dark:bg-gray-900">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
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
                                    <p className={`text-sm font-medium text-gray-900 dark:text-white ${
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
        <div className="mx-auto w-full max-w-[1440px] px-3 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-6 md:p-8 lg:px-10 lg:pb-12">
          <ErrorBoundary fallback={<SectionLoader sectionName={activeSection} />}>
          {renderSection()}
          </ErrorBoundary>
        </div>
      </main>
      
      {/* Toast Notification System */}
      <Toaster />
      <ChatbotWidget />
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
