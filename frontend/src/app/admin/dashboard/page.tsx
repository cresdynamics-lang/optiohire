'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
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
  UserCheck,
  Mail,
  Send,
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
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deadLetterCount, setDeadLetterCount] = useState<number>(0)
  const statsLoadedRef = useRef(false)

  const hasAdminSession =
    typeof window !== 'undefined' && !!localStorage.getItem('admin_session')

  useEffect(() => {
    const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
    const isAdminViaAuth = !!user && user.role === 'admin'
    const isAdminViaSession = !!adminSession

    if (!authLoading && !isAdminViaAuth && !isAdminViaSession) {
      router.push('/admin/login')
    }
  }, [user?.id, user?.role, authLoading, router])

  const loadDeadLetterCount = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/admin/emails/dead-letter?page=1&limit=1', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) return
      const data = await response.json()
      setDeadLetterCount(Number(data.total || 0))
    } catch (err) {
      console.error('Error loading dead-letter count:', err)
    }
  }, [])

  const loadStats = useCallback(async () => {
    const firstLoad = !statsLoadedRef.current
    try {
      if (firstLoad) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load statistics')
      }

      const data = await response.json()
      setStats(data)
      statsLoadedRef.current = true
      void loadDeadLetterCount(token)
    } catch (err: any) {
      console.error('Error loading stats:', err)
      setError(err.message || 'Failed to load statistics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [loadDeadLetterCount])

  useEffect(() => {
    if (authLoading) return
    if (!((user && user.role === 'admin') || hasAdminSession)) return
    void loadStats()
  }, [user?.id, user?.role, authLoading, hasAdminSession, loadStats])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  if (!hasAdminSession && (!user || user.role !== 'admin')) {
    return null
  }

  if (loading && stats === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
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
      tone: 'bg-slate-800', // Deep Blue/Navy
      link: '/admin/users',
    },
    {
      title: 'Companies',
      value: stats?.companies || 0,
      subtitle: 'Registered organizations',
      icon: Building2,
      tone: 'bg-red-600', // Crimson
      link: '/admin/companies',
    },
    {
      title: 'Job Postings',
      value: stats?.job_postings.total || 0,
      subtitle: `${stats?.job_postings.active || 0} active`,
      icon: Briefcase,
      tone: 'bg-emerald-600', // Green
      link: '/admin/jobs',
    },
    {
      title: 'Applications',
      value: stats?.applications.total || 0,
      subtitle: `${stats?.applications.shortlisted || 0} shortlisted`,
      icon: FileText,
      tone: 'bg-amber-500', // Yellow/Amber
      link: '/admin/applications',
    },
    {
      title: 'Admin Users',
      value: stats?.users.admins || 0,
      subtitle: 'System administrators',
      icon: Shield,
      tone: 'bg-purple-600', // Purple
      link: '/admin?section=admins',
    },
    {
      title: 'Reports Generated',
      value: stats?.reports || 0,
      subtitle: 'Total reports',
      icon: BarChart3,
      tone: 'bg-teal-500', // Teal/Light Blue
      link: '/admin/analytics',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.85)]">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl">Dashboard</h1>
              </div>
              <p className="max-w-2xl text-sm text-zinc-400 md:text-base">
                Monitor user growth, company activity, hiring throughput, and platform health from one clean
                operational view.
              </p>
            </div>
            <Button
              onClick={() => void loadStats()}
              variant="outline"
              className="h-10 rounded-lg border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh data
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-800/60 bg-red-950/40 p-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title}>
                <Link href={stat.link}>
                  <Card className={`group cursor-pointer border-0 ${stat.tone} shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 overflow-hidden relative`}>
                    {/* Decorative subtle circles in background to match premium feel */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 rounded-full bg-white/10 blur-lg"></div>
                    
                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg p-2 bg-white/20 text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">{stat.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="mb-2 flex items-end justify-between">
                        <p className="text-4xl font-bold tracking-tight text-white">
                          {stat.value.toLocaleString()}
                        </p>
                        <ArrowRight className="h-5 w-5 text-white/80 transition-transform group-hover:translate-x-1" />
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-white/70"></div>
                         <p className="text-xs font-medium text-white/80">{stat.subtitle}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="border border-zinc-800 bg-zinc-900/80 xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Activity className="h-5 w-5 text-zinc-400" />
                System Health
              </CardTitle>
              <CardDescription>Core operational systems and service status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">Database</p>
                    <p className="text-xs text-zinc-400">Connected and responding</p>
                  </div>
                </div>
                <Badge className="border border-emerald-800 bg-emerald-950/70 text-emerald-300 hover:bg-emerald-950">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-emerald-800/40 bg-emerald-950/30 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">API Services</p>
                    <p className="text-xs text-zinc-400">Admin and public endpoints reachable</p>
                  </div>
                </div>
                <Badge className="border border-emerald-800 bg-emerald-950/70 text-emerald-300 hover:bg-emerald-950">
                  Operational
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-800 bg-zinc-900/80">
            <CardHeader>
              <CardTitle className="text-zinc-100">Action Queue</CardTitle>
              <CardDescription>Quick jump links for frequent admin tasks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/admin/users"
                className="block rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Review user accounts
              </Link>
              <Link
                href="/admin/companies"
                className="block rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Manage companies
              </Link>
              <Link
                href="/admin/jobs"
                className="block rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Audit job postings
              </Link>
              <Link
                href="/admin/applications"
                className="block rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
              >
                Process applications
              </Link>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-zinc-800 bg-zinc-900/80">
            <CardHeader>
              <CardTitle className="text-zinc-100">Platform Snapshot</CardTitle>
              <CardDescription>Current flow of hiring activity across the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-300">Shortlisted</p>
                  </div>
                  <p className="text-2xl font-semibold text-zinc-100">{stats?.applications.shortlisted ?? 0}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-300">Email Operations</p>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Dead-letter queue: <span className="font-semibold text-zinc-100">{deadLetterCount}</span>
                  </p>
                  <Link
                    href="/admin/emails/dead-letter"
                    className="mt-2 inline-block text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    Open dead-letter queue
                  </Link>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Send className="h-4 w-4 text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-300">Workflow Actions</p>
                  </div>
                  <p className="text-sm text-zinc-400">Run check-and-send flows for missing communication events.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-zinc-800 bg-zinc-900/80">
            <CardHeader>
              <CardTitle className="text-zinc-100">Quick Actions</CardTitle>
              <CardDescription>Common admin workflows and management shortcuts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users">
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-800"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/companies">
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-800"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Manage Companies
                  </Button>
                </Link>
                <Link href="/admin/jobs">
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-800"
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Manage Jobs
                  </Button>
                </Link>
                <Link href="/admin/applications">
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-lg border-zinc-700 bg-zinc-950/40 text-zinc-200 hover:bg-zinc-800"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Applications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
