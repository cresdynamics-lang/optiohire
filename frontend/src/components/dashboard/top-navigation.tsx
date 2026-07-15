'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  BarChart3, 
  Calendar,
  Settings,
  Home,
  Bell
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
const quickNavItems = [
  {
    label: 'Home',
    icon: Home,
    href: '/hr',
    id: 'overview',
  },
  {
    label: 'Jobs',
    icon: Briefcase,
    href: '/hr/jobs',
    id: 'jobs',
  },
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/hr/reports',
    id: 'reports',
  },
  {
    label: 'Interviews',
    icon: Calendar,
    href: '/hr/interviews',
    id: 'interviews',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/hr/settings',
    id: 'settings',
  },
]

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  // Don't show on admin pages or auth pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <div className="flex items-center justify-between flex-1 w-full gap-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {quickNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                try {
                  router.push(item.href)
                } catch (error) {
                  console.error('Navigation error:', error)
                }
              }}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap',
                isActive 
                  ? 'bg-[#2D2DDD] text-white hover:bg-[#2D2DDD] shadow-none hover:shadow-none' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#2D2DDD] dark:hover:text-white'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg border border-border transition-colors bg-background shadow-sm hover:shadow">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full transform translate-x-1/3 -translate-y-1/3 border border-white dark:border-gray-900">
            3
          </span>
        </button>
      </div>
    </div>
  )
}

