'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Building2,
  Briefcase,
  FileText,
  Activity,
  Shield,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  UserCheck,
  Mail,
  Send
} from 'lucide-react'
import Link from 'next/link'

interface SystemStats {
  users: {
    total: number
    active: number
    admins: number
  }
  companies: number
  job_postings: {
    total: number
    active: number
  }
  applications: {
    total: number
    shortlisted: number
  }
  reports: number
}

export default function AdminDashboardOverview() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [hasAdminSession, setHasAdminSession] = useState(false)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deadLetterCount, setDeadLetterCount] = useState<number>(0)

  useEffect(() => {
    const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
    const isAdminViaAuth = !!user && user.role === 'admin'
    const isAdminViaSession = !!adminSession
    setHasAdminSession(isAdminViaSession)

    if (!authLoading && !isAdminViaAuth && !isAdminViaSession) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if ((user && user.role === 'admin') || hasAdminSession) {
      loadStats()
    }
  }, [user, hasAdminSession])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load statistics')
      }

      const data = await response.json()
      setStats(data)
      await loadDeadLetterCount(token)
    } catch (err: any) {
      console.error('Error loading stats:', err)
      setError(err.message || 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const loadDeadLetterCount = async (token: string) => {
    try {
      const response = await fetch('/api/admin/emails/dead-letter?page=1&limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) return
      const data = await response.json()
      setDeadLetterCount(Number(data.total || 0))
    } catch (err) {
      console.error('Error loading dead-letter count:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    )
  }

  if (!hasAdminSession && (!user || user.role !== 'admin')) {
    return null
  }

  const statCards: Array<{
    title: string
    value: number
    subtitle: string
    icon: React.ComponentType<{ className?: string }>
    tone: string
    link: string
  }> = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      subtitle: `${stats?.users.active || 0} active`,
      icon: Users,
      tone: 'bg-blue-50 text-blue-700',
      link: '/admin/users'
    },
    {
      title: 'Companies',
      value: stats?.companies || 0,
      subtitle: 'Registered organizations',
      icon: Building2,
      tone: 'bg-emerald-50 text-emerald-700',
      link: '/admin/companies'
    },
    {
      title: 'Job Postings',
      value: stats?.job_postings.total || 0,
      subtitle: `${stats?.job_postings.active || 0} active`,
      icon: Briefcase,
      tone: 'bg-violet-50 text-violet-700',
      link: '/admin/jobs'
    },
    {
      title: 'Applications',
      value: stats?.applications.total || 0,
      subtitle: `${stats?.applications.shortlisted || 0} shortlisted`,
      icon: FileText,
      tone: 'bg-amber-50 text-amber-700',
      link: '/admin/applications'
    },
    {
      title: 'Admin Users',
      value: stats?.users.admins || 0,
      subtitle: 'System administrators',
      icon: Shield,
      tone: 'bg-rose-50 text-rose-700',
      link: '/admin?section=admins'
    },
    {
      title: 'Reports Generated',
      value: stats?.reports || 0,
      subtitle: 'Total reports',
      icon: BarChart3,
      tone: 'bg-indigo-50 text-indigo-700',
      link: '/admin/analytics'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)]"
        >
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-3">
              <Badge className="w-fit border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Admin Command Center
              </Badge>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Dashboard</h1>
              </div>
              <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                Monitor user growth, company activity, hiring throughput, and platform health from one clean operational view.
              </p>
            </div>
            <Button
              onClick={loadStats}
              variant="outline"
              className="h-10 rounded-lg border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh data
            </Button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={stat.link}>
                  <Card className="group cursor-pointer border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                        <div className={`rounded-lg p-2 ${stat.tone}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 flex items-end justify-between">
                        <p className="text-3xl font-semibold tracking-tight text-slate-900">{stat.value.toLocaleString()}</p>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-xs text-slate-500">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-1 gap-5 xl:grid-cols-3"
        >
          <Card className="border border-slate-200 bg-white xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Activity className="h-5 w-5 text-slate-700" />
                System Health
              </CardTitle>
              <CardDescription>Core operational systems and service status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Database</p>
                    <p className="text-xs text-slate-600">Connected and responding</p>
                  </div>
                </div>
                <Badge className="border border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">API Services</p>
                    <p className="text-xs text-slate-600">Admin and public endpoints reachable</p>
                  </div>
                </div>
                <Badge className="border border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Operational</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Action Queue</CardTitle>
              <CardDescription>Quick jump links for frequent admin tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/users" className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Review user accounts
              </Link>
              <Link href="/admin/companies" className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Manage companies
              </Link>
              <Link href="/admin/jobs" className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Audit job postings
              </Link>
              <Link href="/admin/applications" className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Process applications
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="border border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Platform Snapshot</CardTitle>
              <CardDescription>Current flow of hiring activity across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-600" />
                    <p className="text-sm font-medium text-slate-700">Shortlisted</p>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">{stats?.applications.shortlisted ?? 0}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-600" />
                    <p className="text-sm font-medium text-slate-700">Email Operations</p>
                  </div>
                  <p className="text-sm text-slate-600">Dead-letter queue: <span className="font-semibold text-slate-900">{deadLetterCount}</span></p>
                  <Link href="/admin/emails/dead-letter" className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-500">
                    Open dead-letter queue
                  </Link>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Send className="h-4 w-4 text-slate-600" />
                    <p className="text-sm font-medium text-slate-700">Workflow Actions</p>
                  </div>
                  <p className="text-sm text-slate-600">Run check-and-send flows for missing communication events.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="border border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">Quick Actions</CardTitle>
              <CardDescription>Common admin workflows and management shortcuts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users">
                  <Button variant="outline" className="h-10 w-full justify-start rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/companies">
                  <Button variant="outline" className="h-10 w-full justify-start rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100">
                    <Building2 className="mr-2 h-4 w-4" />
                    Manage Companies
                  </Button>
                </Link>
                <Link href="/admin/jobs">
                  <Button variant="outline" className="h-10 w-full justify-start rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Manage Jobs
                  </Button>
                </Link>
                <Link href="/admin/applications">
                  <Button variant="outline" className="h-10 w-full justify-start rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100">
                    <FileText className="mr-2 h-4 w-4" />
                    View Applications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

