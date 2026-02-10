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
        "relative overflow-hidden group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D2DDD]/5 via-[#2D2DDD]/5 to-[#2D2DDD]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 font-figtree">
                {title}
              </p>
              <motion.p 
                className="text-2xl font-bold font-figtree text-[#2D2DDD] dark:text-white mt-2"
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
            <div className="p-3 rounded-lg bg-gradient-to-br from-[#2D2DDD]/10 to-[#2D2DDD]/10 dark:from-[#2D2DDD]/20 dark:to-[#2D2DDD]/20 group-hover:from-[#2D2DDD]/20 group-hover:to-[#2D2DDD]/20 transition-all duration-300">
              <Icon className="w-6 h-6 text-[#2D2DDD]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
