'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

function AdminSidebarFallback() {
  return (
    <div
      className="flex h-full w-64 shrink-0 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
      aria-hidden
    >
      <div className="h-16 border-b border-gray-200 dark:border-gray-800" />
      <div className="flex-1 animate-pulse bg-gray-100 dark:bg-gray-800/50" />
    </div>
  )
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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<AdminSidebarFallback />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
