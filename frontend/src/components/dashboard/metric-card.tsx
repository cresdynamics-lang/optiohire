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
  tone?: string
  delay?: number
}

export const MetricCard = memo(function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  tone = 'bg-slate-800',
  delay = 0 
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn(
        "relative overflow-hidden rounded-2xl border-0 shadow-sm transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20",
        tone,
        className
      )}>
        {/* Decorative subtle circles in background */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 rounded-full bg-white/10 blur-lg"></div>
        <CardContent className="relative p-6 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-figtree text-xs font-bold uppercase tracking-[0.08em] text-white/80">
                {title}
              </p>
              <motion.p 
                className="mt-2 font-figtree text-3xl font-bold tracking-tight text-white sm:text-4xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.2 }}
              >
                {value}
              </motion.p>
              {trend && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                  <span className="text-xs font-medium text-white/90">
                    {trend.isPositive ? "+" : ""}{trend.value} {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-lg p-2 bg-white/20 text-white transition-colors duration-300 group-hover:bg-white/30">
              <Icon className="h-6 w-6 shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
