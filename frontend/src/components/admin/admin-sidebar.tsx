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
  ShieldAlert,
  Cpu
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  section?: string
  priority?: boolean
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Users', href: '/admin', icon: Users, exact: true },
      { name: 'Admins', href: '/admin?section=admins', icon: Shield, section: 'admins' },
      { name: 'Companies', href: '/admin/companies', icon: Building2 },
      { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    ]
  },
  {
    label: 'Talent & Pipeline',
    items: [
      { name: 'Applications', href: '/admin/applications', icon: FileText },
      { name: 'Candidates Pipeline', href: '/admin/candidates', icon: UserCheck },
      { name: 'Talent Pool', href: '/admin/talent-pool', icon: Users },
      { name: 'Certificates', href: '/admin/certificates', icon: FileText },
    ]
  },
  {
    label: 'System & Analytics',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, priority: true },
      { name: 'AI Usage', href: '/admin/ai-usage', icon: Cpu, priority: true },
      { name: 'Signups', href: '/admin/signups', icon: UserCheck },
    ]
  },
  {
    label: 'Email Operations',
    items: [
      { name: 'Emails', href: '/admin/emails', icon: Mail },
      { name: 'Dead-letter Emails', href: '/admin/emails/dead-letter', icon: AlertTriangle },
      { name: 'Check & Send Emails', href: '/admin/check-emails', icon: Send },
    ]
  },
  {
    label: 'Settings & Status',
    items: [
      { name: 'System Status', href: '/admin/status', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
      { name: 'Login Activity', href: '/admin/logins', icon: Key },
      { name: 'Activity', href: '/admin/activity', icon: Activity },
      { name: 'Support Tickets', href: '/admin/support', icon: HelpCircle },
      { name: 'Security Logs', href: '/admin/security-logs', icon: ShieldAlert },
    ]
  }
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
        'fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-background shadow-xl transition-transform duration-200 ease-out',
        open ? 'translate-x-0' : '-translate-x-full pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Admin Panel</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => onOpenChange(false)}
          aria-label="Close admin menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
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
                        ? item.priority ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
