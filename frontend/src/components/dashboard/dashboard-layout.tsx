'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { OverviewSection } from './sections/overview-section'
import { JobsSection } from './sections/jobs-section'
import { ReportsSection } from './sections/reports-section'
import { InterviewsSection } from './sections/interviews-section'
import { SettingsSection } from './sections/settings-section'

export function DashboardLayout() {
  const [activeSection, setActiveSection] = useState('overview')

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />
      case 'jobs':
        return <JobsSection />
      case 'reports':
        return <ReportsSection />
      case 'interviews':
        return <InterviewsSection />
      case 'settings':
        return <SettingsSection />
      default:
        return <OverviewSection />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}
