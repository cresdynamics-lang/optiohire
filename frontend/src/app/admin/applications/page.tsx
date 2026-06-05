'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FileText, Search, ArrowLeft, Trash2 } from 'lucide-react'

interface Application {
  application_id: string
  candidate_name: string
  email: string
  job_title: string
  company_name: string
  ai_status: string | null
  ai_score: number | null
  reasoning?: string | null
  created_at: string
}

export default function AdminApplicationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    // STRICT: Only admin can access
    if (user && user.role !== 'admin') {
      router.push('/admin') // Redirect to admin dashboard, not HR dashboard
      return
    }
    // Check for admin session first
    const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
    if (!adminSession && !user) {
      router.push('/admin/login')
      return
    }
    loadApplications()
  }, [page, search, statusFilter, user, router])

  const loadApplications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { ai_status: statusFilter })
      })

      const response = await fetch(`/api/admin/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }

      const data = await response.json()
      // Ensure ai_score is converted to number if it's a string
      const normalizedApplications = (data.applications || []).map((app: any) => ({
        ...app,
        ai_score: app.ai_score !== null && app.ai_score !== undefined 
          ? (typeof app.ai_score === 'number' ? app.ai_score : Number(app.ai_score))
          : null
      }))
      setApplications(normalizedApplications)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        loadApplications()
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SHORTLIST':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'FLAG':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'REJECT':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-200 text-slate-700 border-border'
    }
  }

  const getDecisionSummary = (status: string | null) => {
    const normalized = (status || 'PENDING').toUpperCase()
    if (normalized === 'SHORTLIST') {
      return { label: 'Selected', tone: 'text-emerald-700', note: 'Candidate is selected for the next stage.' }
    }
    if (normalized === 'REJECT') {
      return { label: 'Not selected', tone: 'text-red-700', note: 'Candidate is not selected based on AI evaluation.' }
    }
    if (normalized === 'FLAG') {
      return { label: 'Under review', tone: 'text-amber-700', note: 'Candidate needs manual review before a final decision.' }
    }
    return { label: 'Pending decision', tone: 'text-slate-700', note: 'AI decision is still pending.' }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Applications</h1>
            <p className="text-slate-600">View and manage all applications</p>
          </div>
        </div>

        <Card className="mb-6 border-border">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10 border-border bg-white text-foreground"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-md border border-border bg-white px-4 py-2 text-foreground"
              >
                <option value="">All Status</option>
                <option value="SHORTLIST">Shortlisted</option>
                <option value="FLAG">Flagged</option>
                <option value="REJECT">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Applications ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {applications.map((app) => (
                    <div
                      key={app.application_id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-4 hover:bg-accent"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-orange-400" />
                          <span className="font-semibold">{app.candidate_name || 'Unknown'}</span>
                          <Badge className={getStatusColor(app.ai_status || '')}>
                            {app.ai_status || 'PENDING'}
                          </Badge>
                          {app.ai_score !== null && app.ai_score !== undefined && typeof app.ai_score === 'number' && !isNaN(app.ai_score) && (
                            <span className="text-sm text-muted-foreground">
                              Score: {Number(app.ai_score).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="mb-2 rounded-md border border-border bg-background p-3">
                          <p className={`text-sm font-semibold ${getDecisionSummary(app.ai_status).tone}`}>
                            {getDecisionSummary(app.ai_status).label}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {getDecisionSummary(app.ai_status).note}
                          </p>
                          {app.ai_status?.toUpperCase() === 'REJECT' || app.ai_status?.toUpperCase() === 'FLAG' ? (
                            <p className="mt-2 text-xs text-slate-700">
                              <span className="font-semibold">Reason:</span>{' '}
                              {app.reasoning?.trim() ? app.reasoning : 'No reason was provided by the AI scorer.'}
                            </p>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <span className="text-muted-foreground">Email:</span> {app.email}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Job:</span> {app.job_title}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Company:</span> {app.company_name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Applied:</span> {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteApplication(app.application_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {applications.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No applications found
                  </div>
                )}

                {total > 20 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-muted-foreground">
                      Page {page} of {Math.ceil(total / 20)}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= Math.ceil(total / 20)}
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

