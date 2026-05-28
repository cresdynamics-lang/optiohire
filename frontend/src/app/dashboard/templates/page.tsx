'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { OptimizedDashboardLayout } from '@/components/dashboard/optimized-dashboard-layout'

export default function TemplatesPage() {
  const { user, loading } = useAuth()
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

  useEffect(() => {
    if (loading && !user) return
    // STRICT: Admin should NOT access HR dashboard
    if (user && user.role === 'admin') {
      router.push('/admin')
      return
    }
    // Job seekers don't have templates
    if (user && isJobSeeker) {
      router.replace('/dashboard')
    }
  }, [user, loading, router, isJobSeeker])

  if (user?.role === 'admin' || (user && isJobSeeker)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D2DDD] border-t-transparent" />
      </div>
    )
  }

  return <OptimizedDashboardLayout />
}
