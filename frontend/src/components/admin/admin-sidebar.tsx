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
  Cpu,
  GraduationCap,
  Radio,
  Megaphone
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
    label: 'Institutions',
    items: [
      { name: 'Institutions', href: '/admin/institutions', icon: GraduationCap },
      { name: 'Institution Requests', href: '/admin/institutions/requests', icon: Radio, priority: true },
      { name: 'Onboarding Forms', href: '/admin/institutions/onboarding', icon: Send },
    ]
  },
  {
    label: 'System & Analytics',
    items: [
      { name: 'Announcements', href: '/admin/announcements', icon: Megaphone, priority: true },
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
      { name: 'Guide (Full Docs)', href: 'https://guide.optiohire.com/?view=docs&page=home', icon: HelpCircle },
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
        'admin-neu neu-raised fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col rounded-none transition-transform duration-200 ease-out lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:pointer-events-auto pointer-events-none'
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <h2 className="text-lg font-bold tracking-tight text-[#3b4252]">Admin Panel</h2>
        <Button
          type="button"
          size="icon"
          className="neu-pressable h-9 w-9 shrink-0 rounded-full border-0 bg-transparent text-[#6b7280] shadow-none hover:bg-transparent lg:hidden"
          onClick={() => onOpenChange(false)}
          aria-label="Close admin menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a93a5]">
              {group.label}
            </h3>
            <div className="space-y-1.5">
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
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'neu-inset font-semibold text-[#2563eb]'
                        : 'neu-pressable text-[#5b6472] hover:text-[#3b4252]'
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
      <div className="p-4">
        <button
          type="button"
          className="neu-pressable flex w-full items-center justify-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-500"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
