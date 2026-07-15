'use client'

import OptimizedDashboardLayout from '@/components/dashboard/optimized-dashboard-layout'
import { AnnouncementsPageContent } from '@/components/dashboard/announcements-page-content'

export default function HrAnnouncementsPage() {
  return (
    <OptimizedDashboardLayout>
      <AnnouncementsPageContent
        audience="employer"
        title="Announcements"
        subtitle="Product updates and hiring platform notices for your team."
      />
    </OptimizedDashboardLayout>
  )
}
