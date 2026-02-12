'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LogIn, Search, ArrowLeft, Calendar, User, Globe, Monitor, RefreshCw, Loader2 } from 'lucide-react'

interface LoginActivity {
  track_id: string
  user_id: string
  user_email?: string
  user_name?: string
  session_id: string | null
  action_type: string
  endpoint: string | null
  method: string | null
  response_time_ms: number | null
  status_code: number | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, any>
  created_at: string
}

export default function AdminLoginsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [logins, setLogins] = useState<LoginActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('login')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    // STRICT: Only admin can access
    if (user && user.role !== 'admin') {
      router.push('/admin')
      return
    }
    if (!user) {
      router.push('/auth/signin')
      return
    }
    loadLogins()
  }, [page, search, actionFilter, user, router])

  const loadLogins = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const adminToken = localStorage.getItem('admin_token')
      const authToken = adminToken || token
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(actionFilter && { actionType: actionFilter }),
        ...(search && { search })
      })

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Admin-Email': user?.email || ''
        }
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/auth/signin')
        return
      }

      const data = await response.json()
      setLogins(data.activities || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error loading logins:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'logout':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'api_call':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'page_view':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status: number | null) => {
    if (!status) return 'bg-gray-500/20 text-gray-400'
    if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-400'
    if (status >= 400 && status < 500) return 'bg-yellow-500/20 text-yellow-400'
    if (status >= 500) return 'bg-red-500/20 text-red-400'
    return 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Login Activity</h1>
            <p className="text-gray-400">View all user login history and activity logs</p>
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email, name, IP address..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value)
                  setPage(1)
                }}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
              >
                <option value="login">Logins</option>
                <option value="logout">Logouts</option>
                <option value="api_call">API Calls</option>
                <option value="page_view">Page Views</option>
                <option value="">All Activities</option>
              </select>
              <Button
                onClick={loadLogins}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
          </div>
        ) : (
          <>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">
                  Activity Logs ({total})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logins.map((activity) => (
                    <div
                      key={activity.track_id}
                      className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <LogIn className="h-5 w-5 text-blue-500" />
                          <Badge className={getActionColor(activity.action_type)}>
                            {activity.action_type?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          {activity.status_code && (
                            <Badge className={getStatusColor(activity.status_code)}>
                              {activity.status_code}
                            </Badge>
                          )}
                          {activity.user_email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{activity.user_email}</span>
                              {activity.user_name && (
                                <span className="text-gray-500">({activity.user_name})</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
                          {activity.endpoint && (
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              <span className="font-mono text-xs">{activity.method} {activity.endpoint}</span>
                            </div>
                          )}
                          {activity.ip_address && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>{activity.ip_address}</span>
                            </div>
                          )}
                          {activity.response_time_ms !== null && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Response:</span>
                              <span>{activity.response_time_ms}ms</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(activity.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        {activity.user_agent && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            <span className="font-medium">User Agent:</span> {activity.user_agent}
                          </div>
                        )}

                        {activity.session_id && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            <span className="font-medium">Session:</span> {activity.session_id.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {logins.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <LogIn className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No activity logs found</p>
                  </div>
                )}

                {total > 50 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-gray-400">
                      Page {page} of {Math.ceil(total / 50)}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= Math.ceil(total / 50)}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
