'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { OptimizedDashboardLayout } from '@/components/dashboard/optimized-dashboard-layout'

export default function JobsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const normalizedCompanyRole = user?.companyRole?.toLowerCase()
  const isJobSeeker =
    normalizedCompanyRole === 'candidate' ||
    normalizedCompanyRole === 'job_seeker' ||
    normalizedCompanyRole === 'jobseeker'

  useEffect(() => {
    if (loading && !user) return
    // STRICT: Admin should NOT access HR dashboard
    if (user && user.role === 'admin') {
      router.push('/admin')
      return
    }
    // Keep `/dashboard/jobs` available for job seekers: they now have a dedicated candidate jobs experience.
  }, [user, loading, router, isJobSeeker])

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D2DDD] border-t-transparent" />
      </div>
    )
  }

  return <OptimizedDashboardLayout />
}

