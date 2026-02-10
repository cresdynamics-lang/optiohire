'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Clock,
  Loader2, 
  RefreshCw,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle,
  User,
  Filter,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface ActivityLog {
  track_id: string
  user_id?: string
  user_email?: string
  user_name?: string
  action_type: string
  endpoint?: string
  method?: string
  response_time_ms?: number
  status_code?: number
  created_at: string
}

interface PerformanceMetrics {
  total_requests: string
  avg_response_time: string
  median_response_time: string
  p95_response_time: string
  success_count: string
  error_count: string
}

export default function ActivityTrackingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [userIdFilter, setUserIdFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    // Check for admin session first
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) {
      return // Admin session exists, allow access
    }
    
    // Fallback to regular auth check
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadActivities()
      loadMetrics()
    }
  }, [user, page, actionFilter, userIdFilter])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      if (actionFilter !== 'all') params.append('actionType', actionFilter)
      if (userIdFilter) params.append('userId', userIdFilter)

      const response = await fetch(`${backendUrl}/api/admin/activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to load activities')

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err: any) {
      console.error('Error loading activities:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      const data = await response.json()
      setMetrics(data.metrics)
    } catch (err) {
      console.error('Error loading metrics:', err)
    }
  }

  const getStatusBadge = (statusCode?: number) => {
    if (!statusCode) return null
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />{statusCode}</Badge>
    } else if (statusCode >= 400) {
      return <Badge className="bg-red-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />{statusCode}</Badge>
    }
    return <Badge variant="outline">{statusCode}</Badge>
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Activity Tracking & Performance
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor user activity and system performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={() => { loadActivities(); loadMetrics() }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold">{metrics.total_requests}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics.avg_response_time ? `${Math.round(Number(metrics.avg_response_time))}ms` : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Median Response</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics.median_response_time ? `${Math.round(Number(metrics.median_response_time))}ms` : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">P95 Response</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {metrics.p95_response_time ? `${Math.round(Number(metrics.p95_response_time))}ms` : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.success_count}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.error_count}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All Actions</option>
                <option value="api_call">API Calls</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="page_view">Page Views</option>
              </select>
              <input
                type="text"
                placeholder="Filter by User ID..."
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <Button onClick={loadActivities}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.track_id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{activity.action_type}</Badge>
                      {activity.method && (
                        <Badge variant="outline">{activity.method}</Badge>
                      )}
                      {getStatusBadge(activity.status_code)}
                      {activity.response_time_ms && (
                        <Badge variant="outline" className={
                          activity.response_time_ms > 1000 ? 'bg-red-100 text-red-700' :
                          activity.response_time_ms > 500 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          <Zap className="w-3 h-3 mr-1" />
                          {activity.response_time_ms}ms
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      {activity.user_email && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{activity.user_email}</span>
                          {activity.user_name && (
                            <span className="text-gray-500">({activity.user_name})</span>
                          )}
                        </div>
                      )}
                      {activity.endpoint && (
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <span className="font-mono text-xs">{activity.endpoint}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(activity.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activities.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No activities found
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={activities.length < 50}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

