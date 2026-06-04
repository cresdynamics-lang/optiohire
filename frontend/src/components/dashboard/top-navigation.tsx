'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  BarChart3, 
  Calendar,
  Settings,
  Home,
  Monitor,
  Sun,
  Moon,
  Bell
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

const quickNavItems = [
  {
    label: 'Home',
    icon: Home,
    href: '/dashboard',
    id: 'overview',
  },
  {
    label: 'Jobs',
    icon: Briefcase,
    href: '/dashboard/jobs',
    id: 'jobs',
  },
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/dashboard/reports',
    id: 'reports',
  },
  {
    label: 'Interviews',
    icon: Calendar,
    href: '/dashboard/interviews',
    id: 'interviews',
  },
  {
    label: 'Profile',
    icon: Settings,
    href: '/dashboard/profile',
    id: 'profile',
  },
]

export function TopNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

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
        {/* Theme Toggle */}
        <div className="flex bg-slate-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={cn('p-1.5 rounded-md transition-colors', theme === 'system' ? 'bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 text-[#2D2DDD] dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}
            title="System Theme"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn('p-1.5 rounded-md transition-colors', theme === 'light' ? 'bg-white dark:bg-gray-700 shadow-sm border border-[#2D2DDD] text-[#2D2DDD]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}
            title="Light Theme"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn('p-1.5 rounded-md transition-colors', theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow-sm border border-[#2D2DDD] text-[#2D2DDD]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}
            title="Dark Theme"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors bg-white dark:bg-gray-900 shadow-sm hover:shadow">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full transform translate-x-1/3 -translate-y-1/3 border border-white dark:border-gray-900">
            3
          </span>
        </button>
      </div>
    </div>
  )
}

