'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  className?: string
  delay?: number
}

export const MetricCard = memo(function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  delay = 0 
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.25)] transition-all duration-300 group hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_24px_58px_-32px_rgba(15,23,42,0.32)] dark:bg-gray-900 dark:border-gray-800",
        className
      )}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/60 to-transparent dark:from-slate-800/35" />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-figtree text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-gray-400">
                {title}
              </p>
              <motion.p 
                className="mt-2 font-figtree text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.65rem]"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.2 }}
              >
                {value}
              </motion.p>
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn(
                    "text-xs font-medium",
                    trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {trend.isPositive ? "+" : ""}{trend.value}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-inner shadow-slate-900/5 transition-colors duration-300 group-hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
              <Icon className="h-6 w-6 shrink-0 text-slate-700 dark:text-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
