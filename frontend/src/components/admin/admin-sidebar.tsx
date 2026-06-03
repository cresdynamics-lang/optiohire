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
  X,
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
  { name: 'Candidates Pipeline', href: '/admin/candidates', icon: UserCheck },
  { name: 'Talent Pool', href: '/admin/talent-pool', icon: Users },
  { name: 'Certificates', href: '/admin/certificates', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Signups', href: '/admin/signups', icon: UserCheck },
  { name: 'Emails', href: '/admin/emails', icon: Mail },
  { name: 'Dead-letter Emails', href: '/admin/emails/dead-letter', icon: AlertTriangle },
  { name: 'Check & Send Emails', href: '/admin/check-emails', icon: Send },
  { name: 'System Status', href: '/admin/status', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Login Activity', href: '/admin/logins', icon: Key },
  { name: 'Activity', href: '/admin/activity', icon: Activity },
  { name: 'Help', href: '/admin/help', icon: HelpCircle },
  { name: 'Support Tickets', href: '/admin/support', icon: HelpCircle },
]

type AdminSidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const { signOut } = useAuth()

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Admin Panel</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => onOpenChange(false)}
          aria-label="Close admin menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
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
              prefetch={false}
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
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
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
