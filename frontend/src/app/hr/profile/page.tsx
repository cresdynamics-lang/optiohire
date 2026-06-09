'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { OptimizedDashboardLayout } from '@/components/dashboard/optimized-dashboard-layout'

export default function ProfilePage() {
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
    if (user && isJobSeeker) {
      router.replace('/candidate/settings')
      return
    }
    // STRICT: Admin should NOT access HR dashboard
    if (user && user.role === 'admin') {
      router.push('/admin')
      return
    }
  }, [user, loading, router])

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D2DDD] border-t-transparent" />
      </div>
    )
  }

  return <OptimizedDashboardLayout />
}

