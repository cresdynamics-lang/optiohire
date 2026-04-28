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
        "relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)] transition-all duration-300 group hover:border-blue-200/70 hover:shadow-[0_22px_56px_-38px_rgba(37,99,235,0.28)] dark:bg-gray-900 dark:border-gray-800",
        className
      )}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_52%)] opacity-90" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2563eb]/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-[#2563eb]/15" />
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
                    {trend.isPositive ? "+" : ""}{trend.value}%
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-blue-100/90 bg-blue-50/90 p-3 shadow-inner shadow-blue-900/5 transition-colors duration-300 group-hover:bg-blue-100/90 dark:border-blue-900/60 dark:bg-blue-950/60 dark:shadow-none">
              <Icon className="h-6 w-6 shrink-0 text-blue-700 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
