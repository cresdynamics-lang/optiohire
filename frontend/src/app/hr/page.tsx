'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import OptimizedDashboardLayout from '@/components/dashboard/optimized-dashboard-layout'

export default function DashboardPage() {
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
    // Still resolving session (no JWT user yet)
    if (loading && !user) return

    // Redirect admin to admin dashboard
    if (user && user.role === 'admin') {
      router.replace('/admin')
      return
    }

    // Redirect candidate to candidate dashboard
    if (user && isJobSeeker) {
      router.replace('/candidate')
      return
    }

    // Job seekers should land on their dashboard overview (handled by OptimizedDashboardLayout)
    // Require company setup before dashboard (employers only; job seekers skip)
    if (
      user &&
      user.role !== 'admin' &&
      !isJobSeeker &&
      user.companyRole &&
      user.hasCompany === false &&
      !user.companyId
    ) {
      router.replace('/company-setup')
      return
    }
    
    // Only redirect to sign-in if there's no user AND no token
    if (!user) {
      const token = localStorage.getItem('token')
      if (!token) {
        router.replace('/auth/signin')
        return
      }
      const timeout = setTimeout(() => {
        const stillHasToken = localStorage.getItem('token')
        if (!stillHasToken) {
          router.replace('/auth/signin')
        }
      }, 2000)

      return () => clearTimeout(timeout)
    }
  }, [user, loading, router, isJobSeeker])

  return <OptimizedDashboardLayout />
}