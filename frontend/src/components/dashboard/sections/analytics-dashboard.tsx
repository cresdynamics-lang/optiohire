import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, TrendingUp, Clock, Target, Activity, Bot, UserCheck } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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
  aiInsights: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1']

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isDark = false

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/hr/reports/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    )
  }

  if (error || !stats) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">Error loading analytics: {error}</div>
  }

  const funnelData = [
    { name: 'Applied', value: stats.funnel.applied },
    { name: 'Shortlisted', value: stats.funnel.shortlisted },
    { name: 'Hired', value: stats.funnel.hired },
    { name: 'Rejected', value: stats.funnel.rejected }
  ]

  const totalTimeToHire = stats.timeToHire.reduce((acc, curr) => acc + curr.avgDays, 0)
  const avgTimeToHire = stats.timeToHire.length > 0 ? (totalTimeToHire / stats.timeToHire.length).toFixed(1) : 'N/A'

  return (
    <div className="space-y-6 mb-8">
      {/* AI Insights Panel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 dark:from-indigo-950/40 dark:to-blue-950/40 dark:border-indigo-900/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
              <Bot className="w-5 h-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-indigo-800 dark:text-indigo-200 whitespace-pre-wrap leading-relaxed">
              {stats.aiInsights || 'No insights available right now.'}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Avg Time to Hire</span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {avgTimeToHire} <span className="text-base font-normal text-slate-500">days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Total Applications</span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stats.funnel.applied}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <UserCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Total Hires</span>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.funnel.hired}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Avg Hire Rate</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.funnel.applied > 0 ? ((stats.funnel.hired / stats.funnel.applied) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Hiring Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            {stats.velocity.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.velocity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} name="Apps" />
                  <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} name="Hires" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Candidate Funnel</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
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
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Health Rankings */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardHeader className="bg-slate-50  border-b border-border">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" /> Job Health Scores
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50  dark:text-slate-400 border-b border-border">
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
                <tr key={idx} className="bg-white dark:bg-slate-950 border-b  hover:bg-slate-50 dark:hover:bg-slate-900">
                  <td className="px-6 py-4 font-medium text-foreground">{job.jobTitle}</td>
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
    </div>
  )
}
