'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import OptimizedDashboardLayout from '@/components/dashboard/optimized-dashboard-layout'
import { HrSettingsSection } from '@/components/dashboard/sections/hr-settings-section'

function HrSettingsInner() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/hr/auth/signin')
      return
    }
    if (user.role === 'admin') {
      router.replace('/admin')
      return
    }
    const role = (user.companyRole || user.role || '').toLowerCase()
    if (role === 'candidate' || role === 'job_seeker' || role === 'jobseeker') {
      router.replace('/candidate/settings')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D2DDD] border-t-transparent" />
      </div>
    )
  }

  return <HrSettingsSection />
}

export default function HrSettingsPage() {
  return (
    <OptimizedDashboardLayout>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D2DDD] border-t-transparent" />
          </div>
        }
      >
        <HrSettingsInner />
      </Suspense>
    </OptimizedDashboardLayout>
  )
}
