'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Search, ArrowLeft, Trash2, Mail, Eye, Calendar, Globe, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

interface JobPosting {
  job_posting_id: string
  job_title: string
  status: string
  company_name: string
  company_domain: string
  created_at: string
  application_deadline: string | null
}

export default function AdminJobsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    loadJobs()
  }, [page, search, statusFilter, user, router])

  const loadJobs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/job-postings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login')
        return
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This will delete all associated applications.')) return

    try {
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated. Please log in again.')
        router.push('/admin/login')
        return
      }

      console.log('Deleting job with ID:', jobId)

      const response = await fetch(`/api/admin/job-postings/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = responseData?.error || `Failed to delete job (${response.status})`
        console.error('Delete failed:', response.status, errorMessage, responseData)
        
        if (response.status === 401 || response.status === 403) {
          setError('Admin access required. Please log in again.')
          router.push('/admin/login')
          return
        }
        
        // If job not found, still remove from UI (might have been deleted already)
        if (response.status === 404) {
          console.log('Job not found, removing from UI anyway')
          setJobs(prev => prev.filter(job => job.job_posting_id !== jobId))
          setError(null) // Don't show error if it's just not found
          return
        }
        
        setError(errorMessage)
        return
      }

      // Success - remove from UI immediately
      console.log('Delete successful, removing from UI')
      setJobs(prev => prev.filter(job => job.job_posting_id !== jobId))
      setTotal(prev => Math.max(0, prev - 1))
      
      // Reload to ensure consistency (use setTimeout to ensure state update happens first)
      setTimeout(() => {
        loadJobs()
      }, 100)
    } catch (error) {
      console.error('Error deleting job:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete job. Please try again.')
    }
  }

  const resendJobEmail = async (jobId: string) => {
    try {
      setError(null)
      setSuccessMessage(null)
      setSendingEmail(jobId)
      
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated. Please log in again.')
        router.push('/admin/login')
        return
      }

      console.log('Resending job creation email for job ID:', jobId)

      const response = await fetch(`/api/admin/job-postings/${jobId}/resend-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = responseData?.error || `Failed to resend email (${response.status})`
        console.error('Resend email failed:', response.status, errorMessage, responseData)
        
        if (response.status === 401 || response.status === 403) {
          setError('Admin access required. Please log in again.')
          router.push('/admin/login')
          return
        }
        
        setError(errorMessage)
        return
      }

      // Success
      const recipients = responseData?.recipients || []
      setSuccessMessage(`Email sent successfully to ${recipients.length} recipient(s): ${recipients.join(', ')}`)
      console.log('✅ Email sent successfully:', responseData)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (error) {
      console.error('Error resending email:', error)
      setError(error instanceof Error ? error.message : 'Failed to resend email. Please try again.')
    } finally {
      setSendingEmail(null)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Job Postings</h1>
            <p className="text-slate-600 dark:text-gray-400">View and manage all job postings</p>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-red-800 dark:text-red-300">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {successMessage && (
          <Card className="bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/60 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-green-800 dark:text-green-300">{successMessage}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccessMessage(null)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                <Input
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-md border border-slate-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-slate-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
                <option value="DRAFT">Draft</option>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Job Postings ({total})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {jobs.map((job) => (
                <Dialog key={job.job_posting_id}>
                  <Card className="border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group flex flex-col h-full relative">
                    <DialogTrigger asChild>
                      <div className="p-5 flex flex-col h-full w-full text-left outline-none">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-slate-100 dark:bg-gray-800 p-1.5 rounded-full text-slate-500 dark:text-gray-400">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center shrink-0">
                            <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate" title={job.job_title}>
                              {job.job_title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-gray-400 truncate" title={job.company_name}>
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{job.company_name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-auto">
                          <Badge 
                            variant={
                              job.status?.toUpperCase() === 'ACTIVE' ? 'active' :
                              job.status?.toUpperCase() === 'DRAFT' ? 'draft' :
                              job.status?.toUpperCase() === 'CLOSED' ? 'closed' :
                              'default'
                            }
                            className="text-[10px] tracking-wider font-semibold"
                          >
                            {job.status?.toUpperCase() || 'ACTIVE'}
                          </Badge>
                        </div>
                      </div>
                    </DialogTrigger>

                    {/* Expandable Details Modal */}
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Job Details</DialogTitle>
                        <DialogDescription>Full job posting information and administrative actions</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 pt-4">
                        <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
                          <div className="w-14 h-14 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center shrink-0">
                            <Briefcase className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                              {job.job_title}
                            </h3>
                            <Badge 
                              variant={
                                job.status?.toUpperCase() === 'ACTIVE' ? 'active' :
                                job.status?.toUpperCase() === 'DRAFT' ? 'draft' :
                                job.status?.toUpperCase() === 'CLOSED' ? 'closed' :
                                'default'
                              }
                            >
                              {job.status?.toUpperCase() || 'ACTIVE'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] uppercase font-semibold text-slate-400">Company</p>
                              <p className="text-slate-900 dark:text-white font-medium truncate">{job.company_name}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Globe className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] uppercase font-semibold text-slate-400">Domain</p>
                              <p className="text-slate-900 dark:text-white font-medium truncate">{job.company_domain}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-semibold text-slate-400">Created</p>
                              <p className="text-slate-900 dark:text-white font-medium">{new Date(job.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 text-slate-600 dark:text-gray-400">
                            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-semibold text-slate-400">Deadline</p>
                              <p className="text-slate-900 dark:text-white font-medium">
                                {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
                          <Button
                            variant="outline"
                            onClick={() => resendJobEmail(job.job_posting_id)}
                            disabled={sendingEmail === job.job_posting_id}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                          >
                            {sendingEmail === job.job_posting_id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Email
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            className="ml-auto"
                            onClick={() => deleteJob(job.job_posting_id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Card>
                </Dialog>
              ))}
            </div>

            {jobs.length === 0 && (
              <div className="py-12 text-center">
                <Briefcase className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-gray-400">No job postings found</p>
              </div>
            )}

            {total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-slate-500 dark:text-gray-400 font-medium">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage(p => p + 1)}
                  className="border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

