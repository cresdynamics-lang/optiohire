'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Info, Bot } from 'lucide-react'

interface Insight {
  title: string
  description: string
  weight: 'critical' | 'positive' | 'warning' | 'neutral'
}

interface DetailedPerformanceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  insights: Insight[] | null
}

export function DetailedPerformanceDrawer({ open, onOpenChange, insights }: DetailedPerformanceDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto border-l border-slate-200 dark:border-slate-800 shadow-2xl z-[100]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-600" />
            AI Performance Report
          </SheetTitle>
          <SheetDescription>
            Detailed analysis and insights based on your recent hiring data.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pb-8">
          {!insights || insights.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <p>No insights generated yet.</p>
            </div>
          ) : (
            insights.map((insight, index) => {
              // Determine styles and icons based on weight
              let colorClasses = ''
              let Icon = Info

              switch (insight.weight) {
                case 'critical':
                  colorClasses = 'bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-200'
                  Icon = AlertCircle
                  break
                case 'positive':
                  colorClasses = 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-200'
                  Icon = CheckCircle
                  break
                case 'warning':
                  colorClasses = 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-200'
                  Icon = AlertCircle
                  break
                case 'neutral':
                default:
                  colorClasses = 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-200'
                  Icon = Info
                  break
              }

              return (
                <Card key={index} className={`shadow-sm border ${colorClasses}`}>
                  <CardContent className="p-4 flex gap-4 items-start">
                    <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                      <p className="text-sm opacity-90 leading-relaxed">{insight.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
