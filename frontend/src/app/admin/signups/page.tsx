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
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Mail,
  Building2,
  Calendar,
  AlertTriangle,
  Users,
  CheckSquare,
  XSquare,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface PendingSignup {
  queue_id: string
  user_id: string
  email: string
  name: string
  company_name: string
  company_email: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  user_created_at: string
}

export default function SignupQueuePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [signups, setSignups] = useState<PendingSignup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSignups, setSelectedSignups] = useState<Set<string>>(new Set())
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')

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
      loadSignups()
    }
  }, [user, statusFilter])

  const loadSignups = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const status = statusFilter === 'all' ? '' : statusFilter
      const response = await fetch(`${backendUrl}/api/admin/users/pending?status=${status}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to load signups')

      const data = await response.json()
      setSignups(data.signups || [])
    } catch (err: any) {
      console.error('Error loading signups:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      setProcessing(userId)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to approve signup')

      await loadSignups()
      setSelectedSignups(new Set())
    } catch (err: any) {
      alert(err.message || 'Failed to approve signup')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      setProcessing(userId)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) throw new Error('Failed to reject signup')

      await loadSignups()
      setSelectedSignups(new Set())
      setShowRejectModal(false)
      setRejectReason('')
    } catch (err: any) {
      alert(err.message || 'Failed to reject signup')
    } finally {
      setProcessing(null)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedSignups.size === 0) {
      alert('Please select signups to approve')
      return
    }

    try {
      setProcessing('bulk')
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/users/bulk-approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds: Array.from(selectedSignups) })
      })

      if (!response.ok) throw new Error('Failed to bulk approve')

      await loadSignups()
      setSelectedSignups(new Set())
    } catch (err: any) {
      alert(err.message || 'Failed to bulk approve')
    } finally {
      setProcessing(null)
    }
  }

  const handleBulkReject = async () => {
    if (selectedSignups.size === 0) {
      alert('Please select signups to reject')
      return
    }

    if (!rejectReason.trim()) {
      setShowRejectModal(true)
      return
    }

    try {
      setProcessing('bulk')
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/users/bulk-reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds: Array.from(selectedSignups), reason: rejectReason })
      })

      if (!response.ok) throw new Error('Failed to bulk reject')

      await loadSignups()
      setSelectedSignups(new Set())
      setShowRejectModal(false)
      setRejectReason('')
    } catch (err: any) {
      alert(err.message || 'Failed to bulk reject')
    } finally {
      setProcessing(null)
    }
  }

  const toggleSelect = (userId: string) => {
    const newSelected = new Set(selectedSignups)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedSignups(newSelected)
  }

  const toggleSelectAll = () => {
    const pendingSignups = signups.filter(s => s.status === 'pending')
    if (selectedSignups.size === pendingSignups.length) {
      setSelectedSignups(new Set())
    } else {
      setSelectedSignups(new Set(pendingSignups.map(s => s.user_id)))
    }
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

  const pendingSignups = signups.filter(s => s.status === 'pending')
  const approvedSignups = signups.filter(s => s.status === 'approved')
  const rejectedSignups = signups.filter(s => s.status === 'rejected')

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
              Signup Queue Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve pending user signups
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
            <Button variant="outline" onClick={loadSignups} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingSignups.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedSignups.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedSignups.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
              >
                Pending ({pendingSignups.length})
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('approved')}
              >
                Approved ({approvedSignups.length})
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('rejected')}
              >
                Rejected ({rejectedSignups.length})
              </Button>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                All ({signups.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {statusFilter === 'pending' && pendingSignups.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedSignups.size === pendingSignups.length ? (
                      <>
                        <XSquare className="w-4 h-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Select All
                      </>
                    )}
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSignups.size} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    onClick={handleBulkApprove}
                    disabled={selectedSignups.size === 0 || processing === 'bulk'}
                  >
                    {processing === 'bulk' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Selected
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedSignups.size > 0) {
                        setShowRejectModal(true)
                      }
                    }}
                    disabled={selectedSignups.size === 0 || processing === 'bulk'}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signups List */}
        <div className="space-y-4">
          {signups.map((signup) => (
            <Card key={signup.queue_id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {statusFilter === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedSignups.has(signup.user_id)}
                      onChange={() => toggleSelect(signup.user_id)}
                      className="mt-2"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {signup.name || 'No Name'}
                      </h3>
                      <Badge
                        variant={
                          signup.status === 'pending' ? 'default' :
                          signup.status === 'approved' ? 'default' :
                          'destructive'
                        }
                        className={
                          signup.status === 'pending' ? 'bg-yellow-500' :
                          signup.status === 'approved' ? 'bg-green-500' :
                          'bg-red-500'
                        }
                      >
                        {signup.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{signup.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Building2 className="w-4 h-4" />
                        <span>{signup.company_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{signup.company_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(signup.created_at).toLocaleDateString()}</span>
                      </div>
                      {signup.rejection_reason && (
                        <div className="col-span-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300">
                          <strong>Rejection Reason:</strong> {signup.rejection_reason}
                        </div>
                      )}
                      {signup.reviewed_at && (
                        <div className="col-span-2 text-xs text-gray-500">
                          Reviewed on {new Date(signup.reviewed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  {signup.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(signup.user_id)}
                        disabled={processing === signup.user_id}
                      >
                        {processing === signup.user_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setShowRejectModal(true)
                          setSelectedSignups(new Set([signup.user_id]))
                        }}
                        disabled={processing === signup.user_id}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {signups.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No signups found
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reject Signup</CardTitle>
                <CardDescription>
                  Please provide a reason for rejection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectReason('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedSignups.size === 1) {
                        handleReject(Array.from(selectedSignups)[0], rejectReason)
                      } else {
                        handleBulkReject()
                      }
                    }}
                    disabled={!rejectReason.trim()}
                  >
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

