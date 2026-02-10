'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2, 
  RefreshCw,
  Send,
  AlertTriangle,
  Filter,
  Search,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface EmailLog {
  email_id: string
  recipient_email: string
  recipient_name?: string
  subject: string
  email_type: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  provider: 'resend' | 'sendgrid' | 'smtp'
  provider_message_id?: string
  error_message?: string
  sent_at?: string
  delivered_at?: string
  created_at: string
}

interface EmailStats {
  total: string
  sent: string
  delivered: string
  failed: string
  bounced: string
  pending: string
}

export default function EmailManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

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
      loadEmails()
      loadStats()
    }
  }, [user, page, statusFilter, typeFilter])

  const loadEmails = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('emailType', typeFilter)
      if (searchTerm) params.append('recipient', searchTerm)

      const response = await fetch(`${backendUrl}/api/admin/emails?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to load emails')

      const data = await response.json()
      setEmails(data.emails || [])
      setTotal(data.total || 0)
    } catch (err: any) {
      console.error('Error loading emails:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/emails/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const handleResend = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/emails/${emailId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to resend email')

      await loadEmails()
      alert('Email resent successfully')
    } catch (err: any) {
      alert(err.message || 'Failed to resend email')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      sent: { color: 'bg-blue-500', icon: Send },
      delivered: { color: 'bg-green-500', icon: CheckCircle },
      failed: { color: 'bg-red-500', icon: XCircle },
      bounced: { color: 'bg-orange-500', icon: AlertTriangle },
      pending: { color: 'bg-yellow-500', icon: Clock }
    }
    const variant = variants[status] || variants.pending
    const Icon = variant.icon
    return (
      <Badge className={`${variant.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
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
              Email Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View email logs and manage email delivery
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
            <Button variant="outline" onClick={() => { loadEmails(); loadStats() }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sent</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bounced</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.bounced}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by recipient email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadEmails()}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="bounced">Bounced</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="all">All Types</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="application_notification">Application</option>
                  <option value="report">Report</option>
                  <option value="general">General</option>
                </select>
                <Button onClick={loadEmails}>Apply Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emails List */}
        <div className="space-y-4">
          {emails.map((email) => (
            <Card key={email.email_id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {email.subject}
                      </h3>
                      {getStatusBadge(email.status)}
                      <Badge variant="outline">{email.provider}</Badge>
                      <Badge variant="outline">{email.email_type}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{email.recipient_email}</span>
                        {email.recipient_name && (
                          <span className="text-gray-500">({email.recipient_name})</span>
                        )}
                      </div>
                      <div>
                        Created: {new Date(email.created_at).toLocaleString()}
                      </div>
                      {email.sent_at && (
                        <div>
                          Sent: {new Date(email.sent_at).toLocaleString()}
                        </div>
                      )}
                      {email.delivered_at && (
                        <div>
                          Delivered: {new Date(email.delivered_at).toLocaleString()}
                        </div>
                      )}
                      {email.provider_message_id && (
                        <div className="text-xs text-gray-500">
                          ID: {email.provider_message_id}
                        </div>
                      )}
                      {email.error_message && (
                        <div className="col-span-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300 text-xs">
                          Error: {email.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  {email.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(email.email_id)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Resend
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {emails.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No emails found
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {Math.ceil(total / 50)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 50)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

