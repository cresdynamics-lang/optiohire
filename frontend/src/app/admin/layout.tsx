'use client'

import { Suspense, Component, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

function AdminSidebarFallback() {
  return (
    <div
      className="flex h-full w-64 shrink-0 flex-col bg-neutral-950 border-r border-neutral-800"
      aria-hidden
    >
      <div className="h-16 border-b border-neutral-800" />
      <div className="flex-1 animate-pulse bg-neutral-900/70" />
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
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-white">
                Something went wrong
              </h2>
            </div>
            <p className="text-neutral-300 mb-4">
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
                <RefreshCw className="w-4 h-4 mr-2" />
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

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminErrorBoundary>
      <div className="dark flex min-h-screen bg-neutral-950 text-neutral-100">
        <Suspense fallback={<AdminSidebarFallback />}>
          <AdminErrorBoundary
            fallback={
              <div className="flex h-full w-64 shrink-0 flex-col bg-neutral-950 border-r border-neutral-800 p-4">
                <p className="text-sm text-neutral-400">
                  Sidebar unavailable. Please refresh.
                </p>
              </div>
            }
          >
            <AdminSidebar />
          </AdminErrorBoundary>
        </Suspense>
        <main className="flex-1 overflow-auto bg-neutral-950">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </main>
      </div>
    </AdminErrorBoundary>
  )
}
