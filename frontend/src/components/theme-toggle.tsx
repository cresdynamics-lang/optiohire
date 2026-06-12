'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-11 w-11 rounded-xl bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-800 transition-all",
        className
      )}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-slate-700" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-200" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
