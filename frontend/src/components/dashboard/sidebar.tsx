'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Briefcase, 
  BarChart3, 
  Settings, 
  ChevronRight,
  Calendar,
  Shield
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'

const sidebarItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'jobs',
    label: 'Job Postings',
    icon: Briefcase,
    href: '/dashboard/jobs',
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    href: '/dashboard/reports',
  },
  {
    id: 'interviews',
    label: 'Interviews',
    icon: Calendar,
    href: '/dashboard/interviews',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: Settings,
    href: '/dashboard/profile',
  },
]

const jobSeekerSidebarItems = [
  {
    id: 'overview',
    label: 'My Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    href: '/dashboard/jobs',
  },
  {
    id: 'interviews',
    label: 'Interviews',
    icon: Calendar,
    href: '/dashboard/interviews',
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: Settings,
    href: '/dashboard/profile',
  },
]

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = (user?.companyLogoUrl && user.companyLogoUrl.trim())
    ? user.companyLogoUrl.trim()
    : '/assets/logo/logo.png'

  const orgName =
    user?.companyName ||
    (user?.companyEmail ? user.companyEmail.split('@')[0] : null) ||
    'Your organisation'

  const profileLine =
    user?.name ||
    user?.email ||
    'HR workspace'
  const normalizedCompanyRole = user?.companyRole?.toLowerCase()
  const isJobSeeker =
    normalizedCompanyRole === 'candidate' ||
    normalizedCompanyRole === 'job_seeker' ||
    normalizedCompanyRole === 'jobseeker'
  const navItems = isJobSeeker ? jobSeekerSidebarItems : sidebarItems
  const displayOrgName = isJobSeeker ? (user?.name || 'Job Seeker Workspace') : orgName
  const displayProfileLine = isJobSeeker ? (user?.email || 'Candidate account') : profileLine

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative h-screen shrink-0 overflow-y-auto border-r border-slate-200/90 bg-white shadow-[4px_0_40px_-28px_rgba(15,23,42,0.18)] dark:bg-gray-950 dark:border-gray-800 sticky top-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      } transition-all duration-300`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.09),transparent_62%)]" aria-hidden />
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-slate-200/90 bg-white/95 p-4 backdrop-blur-sm sm:p-6 dark:border-gray-800 dark:bg-gray-950/95">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 rounded-2xl border border-slate-200/90 bg-white p-1 shadow-sm ring-4 ring-blue-500/5 dark:border-gray-700 dark:bg-gray-900">
              {mounted ? (
                <Image
                  src={logoSrc}
                  alt={`${displayOrgName} logo`}
                  fill
                  sizes="40px"
                  className="object-contain"
                  loading="lazy"
                  quality={85}
                />
              ) : (
                <span className="block h-full w-full rounded-xl bg-muted-foreground/15" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 space-y-1">
                <span
                  className={`inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    isJobSeeker
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/80 dark:text-blue-300'
                  }`}
                >
                  {isJobSeeker ? 'Job seeker' : 'Employer'}
                </span>
                <h2 className="truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                  {displayOrgName}
                </h2>
                <p className="truncate text-[11px] font-medium text-slate-500 dark:text-gray-400">
                  {displayProfileLine}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 sm:p-4">
          <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-1.5 shadow-inner shadow-slate-900/5 dark:border-gray-800 dark:bg-gray-900/40">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const IconComponent = item.icon
            if (!IconComponent) {
              console.error(`Icon component not found for ${item.id}`)
              return null
            }
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onSectionChange(item.id)}
                className={`min-h-[44px] w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:hover:bg-gray-800/80'
                }`}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
                {!isCollapsed && (
                  <>
                    <span className="font-figtree font-medium">{item.label}</span>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 ml-auto text-white" />
                    )}
                  </>
                )}
              </Link>
            )
          })}
          </div>

          {/* Admin Dashboard Link (only for admins) */}
          {user?.role === 'admin' && (
            <button
              onClick={() => router.push('/admin')}
              className={`mt-1 min-h-[44px] w-full flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 group ${
                pathname?.startsWith('/admin')
                  ? 'border-blue-200 bg-blue-50 text-blue-800 shadow-sm dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white dark:hover:border-gray-800 dark:hover:bg-gray-900/80'
              }`}
            >
              <Shield className={`w-5 h-5 flex-shrink-0 ${pathname?.startsWith('/admin') ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-800'}`} />
              {!isCollapsed && (
                <>
                  <span className="font-figtree font-medium">Admin Dashboard</span>
                  {pathname?.startsWith('/admin') && (
                    <ChevronRight className="w-4 h-4 ml-auto text-blue-700" />
                  )}
                </>
              )}
            </button>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="min-h-[44px] w-full"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default Sidebar
