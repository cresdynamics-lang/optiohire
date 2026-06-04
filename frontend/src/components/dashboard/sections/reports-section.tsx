'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Loader2,
  UserCheck,
  UserPlus,
  UserX,
  AlertTriangle,
  FileText,
  ExternalLink,
  TrendingUp,
  Clock,
  Target,
  Activity,
  Bot
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { JobPosting } from '@/types'
import { ApplicantReportModal } from '../applicant-report-modal'
import { createTimeoutSignal } from '@/lib/utils'
import { DetailedPerformanceDrawer } from './detailed-performance-drawer'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']

interface DashboardStats {
  funnel: {
    applied: number
    shortlisted: number
    interviewing: number
    offered: number
    hired: number
    rejected: number
    flagged: number
  }
  timeToHire: Array<{ jobTitle: string; avgDays: number }>
  jobRankings: Array<{
    jobTitle: string
    totalApplicants: number
    hireRate: number
    avgScore: number
    healthScore: number
    status: string
  }>
  velocity: Array<{ month: string; applications: number; hires: number }>
  aiInsights: Array<{ title: string; description: string; weight: 'critical'|'positive'|'warning'|'neutral' }> | string
}

interface JobReportItem {
  job: JobPosting
  totals: {
    total: number
    shortlisted: number
    flagged: number
    rejected: number
  }
  processingStatus?: 'processing' | 'in_progress' | 'finished'
  aiAnalysis?: string | null
}

type TimeRange = '7d' | '30d' | 'all'

const CustomXAxisTick = ({ x, y, payload, isDark }: any) => {
  const wrapText = (text: string, maxLength: number): string[] => {
    let cleaned = text.replace(/^Application\s+for\s+/i, '')
    if (cleaned.length <= maxLength) return [cleaned]
    const words = cleaned.split(/\s+/)
    if (words.length <= 2) {
      const mid = Math.ceil(cleaned.length / 2)
      const spaceIndex = cleaned.indexOf(' ', mid)
      if (spaceIndex > 0) {
        return [cleaned.substring(0, spaceIndex), cleaned.substring(spaceIndex + 1)]
      }
      return [cleaned]
    }
    let firstLine = ''
    let secondLine = ''
    let currentLength = 0
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const testLength = currentLength + (currentLength > 0 ? 1 : 0) + word.length
      if (testLength <= maxLength && i < words.length - 1) {
        firstLine += (firstLine ? ' ' : '') + word
        currentLength = testLength
      } else {
        secondLine = words.slice(i).join(' ')
        break
      }
    }
    return secondLine ? [firstLine, secondLine] : [firstLine || cleaned]
  }
  
  let maxLength = 20
  if (typeof window !== 'undefined') {
    const width = window.innerWidth
    if (width < 640) maxLength = 15
    else if (width < 1024) maxLength = 20
    else maxLength = 25
  }
  
  const lines = wrapText(payload.value, maxLength)
  const lineHeight = 12
  
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={index}
          x={0}
          y={index * lineHeight + 3}
          textAnchor="middle"
          fill={isDark ? '#E5E7EB' : '#374151'}
          fontSize={11}
        >
          {line}
        </text>
      ))}
    </g>
  )
}

export function ReportsSection() {
  const { user } = useAuth()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const [items, setItems] = useState<JobReportItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [isDesktop, setIsDesktop] = useState(false)
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          setIsLoading(false)
          return
        }

        // Fetch both reports and stats
        const [reportsRes, statsRes] = await Promise.all([
          fetch('/api/job-postings', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            signal: createTimeoutSignal(10000),
          }),
          fetch('/api/hr/reports/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        if (reportsRes.ok) {
          const data = await reportsRes.json()
          const jobs = data.jobs || []
          const reportItems: JobReportItem[] = jobs.map((job: any) => ({
            job: {
              id: job.job_posting_id || job.id,
              job_title: job.job_title,
              status: job.status || 'active',
              created_at: job.created_at
            },
            totals: {
              total: job.applicant_count || 0,
              shortlisted: job.shortlisted_count || 0,
              flagged: job.flagged_count || 0,
              rejected: job.rejected_count || 0
            }
          }))
          setItems(reportItems)
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

      } catch (err: any) {
        console.error('Error loading data:', err)
        setError('Failed to load reports and analytics')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [user])

  const filteredItems = useMemo(() => {
    if (timeRange === 'all') return items

    const now = new Date()
    const days = timeRange === '7d' ? 7 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return items.filter((item) => {
      const createdAt = item.job.created_at ? new Date(item.job.created_at) : null
      if (!createdAt || Number.isNaN(createdAt.getTime())) return false
      return createdAt >= cutoff
    })
  }, [items, timeRange])

  const chartData = useMemo(() => {
    return filteredItems.map((item) => {
      const shortlisted = Math.max(0, item.totals.shortlisted || 0)
      const flagged = Math.max(0, item.totals.flagged || 0)
      const rejected = Math.max(0, item.totals.rejected || 0)
      const total = item.totals.total
      
      const hasShortlisted = shortlisted > 0
      const hasFlagged = flagged > 0
      const hasRejected = rejected > 0
      const segmentCount = [hasShortlisted, hasFlagged, hasRejected].filter(Boolean).length
      
      return {
        jobTitle: item.job.job_title,
        total,
        shortlisted,
        flagged,
        rejected,
        hireRate: total > 0 ? Number(((shortlisted / total) * 100).toFixed(1)) : 0,
        _hasShortlisted: hasShortlisted,
        _hasFlagged: hasFlagged,
        _hasRejected: hasRejected,
        _segmentCount: segmentCount,
      }
    })
  }, [filteredItems])

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin-smooth rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </motion.div>
    )
  }

  const funnelData = stats ? [
    { name: 'Applied', value: stats.funnel.applied },
    { name: 'Shortlisted', value: stats.funnel.shortlisted },
    { name: 'Hired', value: stats.funnel.hired },
    { name: 'Rejected', value: stats.funnel.rejected }
  ] : []

  const totalTimeToHire = stats ? stats.timeToHire.reduce((acc, curr) => acc + curr.avgDays, 0) : 0
  const avgTimeToHire = stats && stats.timeToHire.length > 0 ? (totalTimeToHire / stats.timeToHire.length).toFixed(1) : 'N/A'

  // Extract insights properly if it's an array
  let insightsArr: any[] = []
  if (stats?.aiInsights) {
    if (Array.isArray(stats.aiInsights)) {
      insightsArr = stats.aiInsights
    } else if (typeof stats.aiInsights === 'string') {
      try {
        insightsArr = JSON.parse(stats.aiInsights)
      } catch (e) {
        insightsArr = [{ title: 'Insights', description: stats.aiInsights, weight: 'neutral' }]
      }
    }
  }

  return (
    <div className="min-w-0 space-y-8 pb-12">
      <DetailedPerformanceDrawer 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        insights={insightsArr.length > 0 ? insightsArr : null} 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] sm:p-8 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/70 to-transparent dark:from-slate-800/50" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">Insights</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
              Reports & analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-gray-400">
              Pipeline composition and hiring signals across your roles — refine faster with clearer numbers.
            </p>
          </div>
          
          <Button 
            onClick={() => setIsDrawerOpen(true)}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
          >
            <Bot className="w-4 h-4 mr-2" />
            Generate Detailed Performance Report
          </Button>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {stats && (
        <>
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Avg Time to Hire</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {avgTimeToHire} <span className="text-base font-normal text-slate-500">days</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50">
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Applications</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.funnel.applied}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-green-50 dark:from-slate-900 dark:to-green-900/10">
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-2">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Total Hires</span>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {stats.funnel.hired}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-900/10">
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">Avg Hire Rate</span>
                </div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {stats.funnel.applied > 0 ? ((stats.funnel.hired / stats.funnel.applied) * 100).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Job performance chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        <Card className="bg-white border border-slate-200 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.42)] dark:bg-slate-900 dark:border-slate-700">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-figtree font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                Job Performance Overview
              </CardTitle>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-slate-300">
                Horizontal stacked comparison of shortlisted, flagged, and rejected applicants per job.
              </p>
            </div>
            <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full bg-slate-100 border border-slate-300 p-1 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              {[
                { id: '7d', label: 'Last 7 days' },
                { id: '30d', label: 'Last 30 days' },
                { id: 'all', label: 'All time' },
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setTimeRange(range.id as TimeRange)}
                  className={`min-h-[40px] touch-manipulation px-3 py-2 text-xs sm:min-h-0 sm:py-1.5 sm:text-sm rounded-full transition-all ${
                    timeRange === range.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-[280px] sm:h-[320px] lg:h-[450px]">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-gray-600 dark:text-slate-300 font-figtree">
                  No job posts in the selected time range.
                </p>
              </div>
            ) : (
              <div className="h-full w-full rounded-xl bg-slate-50 border border-slate-200 p-3 sm:p-4 shadow-inner dark:bg-slate-950/40 dark:border-slate-800/80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 8, right: 40, bottom: 40, left: 16 }}
                    barCategoryGap={isDesktop ? '5%' : '20%'}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11 }}
                      axisLine={{ stroke: isDark ? '#1F2937' : '#D1D5DB' }}
                      tickLine={{ stroke: isDark ? '#1F2937' : '#D1D5DB' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: isDark ? '#E5E7EB' : '#374151', fontSize: 10 }}
                      axisLine={{ stroke: isDark ? '#1F2937' : '#D1D5DB' }}
                      tickLine={{ stroke: isDark ? '#1F2937' : '#D1D5DB' }}
                      tickFormatter={(value) => `${value}%`}
                      domain={[0, 100]}
                    />
                    <XAxis
                      dataKey="jobTitle"
                      interval={0}
                      angle={0}
                      height={80}
                      axisLine={{ stroke: isDark ? '#1F2937' : '#D1D5DB' }}
                      tickLine={{ stroke: isDark ? '#1F2937' : '#D1D5DB' }}
                      tick={<CustomXAxisTick isDark={isDark} />}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        border: '1px solid rgba(148, 163, 184, 0.4)',
                        borderRadius: 12,
                        padding: '10px 12px',
                      }}
                      labelStyle={{ color: '#E5E7EB', fontSize: 12 }}
                      itemStyle={{ fontSize: 11 }}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: 12, color: '#E5E7EB', fontSize: 11 }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="shortlisted"
                      stackId="a"
                      fill="#4CBB17"
                      name="Shortlisted"
                      maxBarSize={isDesktop ? 130 : 60}
                      isAnimationActive={false}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="flagged"
                      stackId="a"
                      fill="#F4BE0B"
                      name="Flagged"
                      maxBarSize={isDesktop ? 130 : 60}
                      isAnimationActive={false}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="rejected"
                      stackId="a"
                      fill="#FF0000"
                      name="Rejected"
                      maxBarSize={isDesktop ? 130 : 60}
                      isAnimationActive={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="hireRate"
                      stroke="#0f172a"
                      strokeWidth={2}
                      dot={{ r: 3, stroke: '#E5E7EB', strokeWidth: 1, fill: '#0f172a' }}
                      activeDot={{ r: 5 }}
                      name="Hire rate (%)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Job report cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
      >
        <Card className="border border-slate-200 bg-white shadow-[0_22px_55px_-42px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-figtree font-semibold flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              Job Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-figtree font-light">
                  No job posts yet.
                </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, index) => (
                    <motion.div
                      key={item.job.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                    <Card className="border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 h-full flex flex-col">
                      <CardContent className="p-5 flex flex-col flex-1">
                        <div className="mb-4">
                          <h3 className="text-base font-semibold font-figtree line-clamp-2 min-h-[40px]">
                            {item.job.job_title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.job.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center dark:border-slate-800 dark:bg-slate-800/50">
                            <span className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Total</span>
                            <span className="block text-lg font-bold text-slate-900 dark:text-white">{item.totals.total}</span>
                          </div>
                          <div className="rounded-lg border border-green-100 bg-green-50 p-2 text-center dark:border-green-900/20 dark:bg-green-900/10">
                            <span className="block text-[10px] uppercase font-bold text-green-600 mb-0.5">Shortlisted</span>
                            <span className="block text-lg font-bold text-green-700">{item.totals.shortlisted}</span>
                          </div>
                          <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-2 text-center dark:border-yellow-900/20 dark:bg-yellow-900/10">
                            <span className="block text-[10px] uppercase font-bold text-yellow-600 mb-0.5">Flagged</span>
                            <span className="block text-lg font-bold text-yellow-700">{item.totals.flagged}</span>
                          </div>
                          <div className="rounded-lg border border-red-100 bg-red-50 p-2 text-center dark:border-red-900/20 dark:bg-red-900/10">
                            <span className="block text-[10px] uppercase font-bold text-red-600 mb-0.5">Rejected</span>
                            <span className="block text-lg font-bold text-red-700">{item.totals.rejected}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            className="w-full h-9 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            onClick={() => {
                              setSelectedJobPosting(item.job)
                              setIsReportModalOpen(true)
                            }}
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                            View Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {stats && (
        <>
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <PieChart className="w-4 h-4" /> Candidate Funnel
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {stats.funnel.applied === 0 ? (
                  <div className="text-sm text-slate-500">No applications</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={funnelData.filter(d => d.value > 0)}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Hiring Velocity
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {stats.velocity.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.velocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} name="Apps" />
                      <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} name="Hires" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Job Health Rankings */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" /> Job Health Scores
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Job Title</th>
                    <th className="px-6 py-3 font-medium text-right">Applicants</th>
                    <th className="px-6 py-3 font-medium text-right">Hire Rate</th>
                    <th className="px-6 py-3 font-medium text-right">Health Score</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.jobRankings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No active jobs</td>
                    </tr>
                  )}
                  {stats.jobRankings.map((job, idx) => (
                    <tr key={idx} className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{job.jobTitle}</td>
                      <td className="px-6 py-4 text-right">{job.totalApplicants}</td>
                      <td className="px-6 py-4 text-right">{job.hireRate}%</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold">{job.healthScore}</span>/100
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          job.status === 'Excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          job.status === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Applicant Report Modal */}
      <ApplicantReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false)
          setSelectedJobPosting(null)
        }}
        jobPosting={selectedJobPosting}
      />
    </div>
  )
}
