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
  ArrowLeft,
  BarChart3,
  PieChart
} from 'lucide-react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

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

interface TelemetryData {
  timeSeries: Array<{
    date: string
    count: number
    successCount: number
    errorCount: number
    avgResponseTime: number | null
  }>
  actionTypes: Array<{
    actionType: string
    count: number
    successCount: number
    errorCount: number
  }>
  statusCodes: Array<{
    category: string
    count: number
  }>
  topUsers: Array<{
    userEmail: string
    userName: string | null
    activityCount: number
    successCount: number
    errorCount: number
  }>
  responseTimeDistribution: Array<{
    timeRange: string
    count: number
  }>
  topEndpoints: Array<{
    endpoint: string
    method: string
    count: number
    avgResponseTime: number | null
    successCount: number
    errorCount: number
  }>
}

const COLORS = ['#2D2DDD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899']

export default function ActivityTrackingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [telemetryLoading, setTelemetryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [userIdFilter, setUserIdFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d')

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
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession || (user && user.role === 'admin')) {
      loadActivities()
      loadMetrics()
      loadTelemetry()
    }
  }, [user, page, actionFilter, userIdFilter, dateRange])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      if (actionFilter !== 'all') params.append('actionType', actionFilter)
      if (userIdFilter) params.append('userId', userIdFilter)

      const response = await fetch(`/api/admin/activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json().catch(() => ({
        activities: [],
        total: 0,
        error: 'Failed to parse response'
      }))
      
      // Always set activities, even if empty
      setActivities(data.activities || [])
      
      // Show error message if present but don't break UI
      if (data.error) {
        setError(data.error)
      } else if (!response.ok) {
        setError('Failed to load activities')
      } else {
        setError(null)
      }
    } catch (err: any) {
      console.error('Error loading activities:', err)
      setError(err.message || 'Failed to load activities')
      // Set empty array to prevent UI breakage
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/performance', {
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

  const loadTelemetry = async () => {
    try {
      setTelemetryLoading(true)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) return

      const now = new Date()
      const startDate = new Date()
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate.setDate(now.getDate() - 90)
          break
        default:
          startDate.setFullYear(2020) // All time
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        groupBy: dateRange === '7d' ? 'hour' : 'day'
      })

      const response = await fetch(`/api/admin/telemetry/activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      const data = await response.json()
      setTelemetry(data)
    } catch (err) {
      console.error('Error loading telemetry:', err)
    } finally {
      setTelemetryLoading(false)
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

  const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
  if (!adminSession && (!user || user.role !== 'admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Display */}
        {error && (
          <Card className="border-red-700/50 bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Activity Tracking & Performance
            </h1>
            <p className="text-neutral-400">
              Monitor user activity and system performance metrics with telemetry
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
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
              className="px-3 py-2 border border-neutral-700 bg-neutral-900 text-neutral-200 rounded text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <Button variant="outline" onClick={() => { loadActivities(); loadMetrics(); loadTelemetry() }} disabled={isLoading || telemetryLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading || telemetryLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Telemetry Charts */}
        {telemetry && !telemetryLoading && (
          <div className="space-y-6">
            {/* Activity Over Time - Line Chart */}
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Activity Over Time
                </CardTitle>
                <CardDescription>Activity trends showing requests, successes, and errors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={telemetry.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#2D2DDD" name="Total Requests" />
                    <Line type="monotone" dataKey="successCount" stroke="#10B981" name="Success" />
                    <Line type="monotone" dataKey="errorCount" stroke="#EF4444" name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Action Types Distribution - Pie Chart */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Action Types Distribution
                  </CardTitle>
                  <CardDescription>Breakdown of activity by action type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={telemetry.actionTypes}
                        dataKey="count"
                        nameKey="actionType"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {telemetry.actionTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Code Distribution - Pie Chart */}
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Status Code Distribution
                  </CardTitle>
                  <CardDescription>HTTP status code breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={telemetry.statusCodes}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {telemetry.statusCodes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Users - Bar Chart */}
            {telemetry.topUsers.length > 0 && (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Top Users by Activity
                  </CardTitle>
                  <CardDescription>Most active users in the selected time period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={telemetry.topUsers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="userEmail" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="activityCount" fill="#2D2DDD" name="Total Activity" />
                      <Bar dataKey="successCount" fill="#10B981" name="Success" />
                      <Bar dataKey="errorCount" fill="#EF4444" name="Errors" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Response Time Distribution - Bar Chart */}
            {telemetry.responseTimeDistribution.length > 0 && (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Response Time Distribution
                  </CardTitle>
                  <CardDescription>Distribution of API response times</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={telemetry.responseTimeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timeRange" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" name="Request Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Endpoints - Bar Chart */}
            {telemetry.topEndpoints.length > 0 && (
              <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Top Endpoints
                  </CardTitle>
                  <CardDescription>Most frequently accessed endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={telemetry.topEndpoints}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="endpoint" 
                        angle={-45}
                        textAnchor="end"
                        height={120}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#2D2DDD" name="Request Count" />
                      <Bar dataKey="successCount" fill="#10B981" name="Success" />
                      <Bar dataKey="errorCount" fill="#EF4444" name="Errors" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold">{metrics.total_requests}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
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
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-700 bg-neutral-900 text-neutral-200 rounded"
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
                className="px-3 py-2 border border-neutral-700 bg-neutral-900 text-neutral-200 rounded"
              />
              <Button onClick={loadActivities}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.track_id} className="bg-neutral-900 border-neutral-800">
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
                          activity.response_time_ms > 1000 ? 'bg-red-900/20 text-red-300 border-red-800' :
                          activity.response_time_ms > 500 ? 'bg-yellow-900/20 text-yellow-300 border-yellow-800' :
                          'bg-green-900/20 text-green-300 border-green-800'
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
          <Card className="bg-neutral-900 border-neutral-800">
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

