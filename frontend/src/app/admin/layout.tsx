'use client'

import { Suspense, Component, ReactNode, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { AlertCircle, Menu, RefreshCw, X, Moon, Sun } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

function AdminSidebarFallback() {
  return (
    <div
      className="fixed inset-y-0 left-0 z-50 flex h-full w-64 -translate-x-full flex-col border-r border-border bg-background"
      aria-hidden
    >
      <div className="h-16 border-b border-border" />
      <div className="flex-1 animate-pulse bg-slate-100" />
    </div>
  )
}

// Error Boundary Component
class AdminErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Admin ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
            </div>
            <p className="mb-4 text-slate-600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  if (typeof window !== 'undefined') {
                    window.location.reload()
                  }
                }}
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [navOpen, setNavOpen] = useState(true)

  // Auto-close sidebar on mobile/tablet on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setNavOpen(false)
    }
  }, [])

  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (navOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [navOpen])

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminErrorBoundary>
      <div className="relative min-h-screen bg-background  text-foreground ">
        {/* Menu opens the admin nav drawer; sidebar stays hidden until clicked */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-[60] h-11 w-11 shrink-0 rounded-full border-border dark:border-gray-800 bg-white  text-slate-700  shadow-sm hover:bg-background dark:hover:bg-gray-800"
          onClick={() => setNavOpen((o) => !o)}
          aria-expanded={navOpen}
          aria-label={navOpen ? 'Close admin menu' : 'Open admin menu'}
        >
          {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Theme Toggle in Admin Header */}
        <div className="fixed top-4 right-4 z-[60]">
          <ThemeToggle />
        </div>

        {navOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-slate-900/40"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          />
        ) : null}

        <Suspense fallback={<AdminSidebarFallback />}>
          <AdminErrorBoundary
            fallback={
              <div className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-background p-4">
                <p className="text-sm text-muted-foreground">Sidebar unavailable. Please refresh.</p>
              </div>
            }
          >
            <AdminSidebar open={navOpen} onOpenChange={setNavOpen} />
          </AdminErrorBoundary>
        </Suspense>

        <main className="min-h-screen overflow-auto bg-background  pt-16">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </AdminErrorBoundary>
  )
}
