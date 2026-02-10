'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  status: 'processing' | 'in_progress' | 'finished'
  className?: string
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const statusConfig = {
    processing: {
      label: 'Processing',
      variant: 'warning' as const,
      icon: '⏳',
    },
    in_progress: {
      label: 'In Progress',
      variant: 'info' as const,
      icon: '🔄',
    },
    finished: {
      label: 'Finished',
      variant: 'success' as const,
      icon: '✅',
    },
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Badge
        variant={config.variant}
        className={cn(
          "flex items-center gap-2 px-3 py-1 text-sm font-medium font-figtree",
          className
        )}
      >
        <span className="text-base">{config.icon}</span>
        {config.label}
      </Badge>
    </motion.div>
  )
}
