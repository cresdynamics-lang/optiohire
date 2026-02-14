'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import dynamic from 'next/dynamic'

// Dynamically import the dashboard layout to prevent SSR issues (use default export to avoid undefined promise)
const OptimizedDashboardLayout = dynamic(
  () => import('@/components/dashboard/optimized-dashboard-layout'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
)

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while loading - give auth time to initialize
    if (loading) return
    
    // Redirect admin to admin dashboard
    if (user && user.role === 'admin') {
      router.push('/admin')
      return
    }
    
    // Only redirect to sign-in if there's no user AND no token
    // This prevents redirecting when API call is still in progress or failed
    if (!user) {
      const token = localStorage.getItem('token')
      if (!token) {
        // No token and no user - definitely need to sign in
        router.push('/auth/signin')
        return
      }
      // If token exists but no user, wait a bit more for auth to complete
      // The auth hook will set user from token eventually
      // Give it a moment before redirecting
      const timeout = setTimeout(() => {
        const stillNoUser = !user
        const stillHasToken = localStorage.getItem('token')
        if (stillNoUser && !stillHasToken) {
          router.push('/auth/signin')
        }
      }, 2000) // Wait 2 seconds for auth to complete
      
      return () => clearTimeout(timeout)
    }
  }, [user, loading, router])

  // Show loading while checking
  if (loading || (user && user.role === 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Show loading while redirecting (brief moment)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Render the dashboard layout - ErrorBoundary in layout.tsx will catch any errors
  return <OptimizedDashboardLayout />
}