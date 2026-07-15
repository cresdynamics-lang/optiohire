'use client'

import OptimizedDashboardLayout from '@/components/dashboard/optimized-dashboard-layout'
import { AnnouncementsPageContent } from '@/components/dashboard/announcements-page-content'

export default function CandidateAnnouncementsPage() {
  return (
    <OptimizedDashboardLayout>
      <AnnouncementsPageContent
        audience="candidate"
        title="Announcements"
        subtitle="Platform updates, hiring tips, and important notices for job seekers."
      />
    </OptimizedDashboardLayout>
  )
}
