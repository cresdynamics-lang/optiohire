'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  Shield,
  BarChart3,
  Settings,
  LogOut,
  Mail,
  Key,
  Activity,
  UserCheck,
  HelpCircle,
  Send,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const navigation: Array<{
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  section?: string
}> = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin', icon: Users, exact: true },
  { name: 'Admins', href: '/admin?section=admins', icon: Shield, section: 'admins' },
  { name: 'Companies', href: '/admin/companies', icon: Building2 },
  { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
  { name: 'Applications', href: '/admin/applications', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Signups', href: '/admin/signups', icon: UserCheck },
  { name: 'Emails', href: '/admin/emails', icon: Mail },
  { name: 'Dead-letter Emails', href: '/admin/emails/dead-letter', icon: AlertTriangle },
  { name: 'Check & Send Emails', href: '/admin/check-emails', icon: Send },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Login Activity', href: '/admin/logins', icon: Key },
  { name: 'Activity', href: '/admin/activity', icon: Activity },
  { name: 'Help', href: '/admin/help', icon: HelpCircle },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const { signOut } = useAuth()

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isAdminRoot = pathname === '/admin'
          const isActive =
            pathname === item.href ||
            (item.section === 'admins' && isAdminRoot && section === 'admins') ||
            (item.exact && isAdminRoot && !section)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}




