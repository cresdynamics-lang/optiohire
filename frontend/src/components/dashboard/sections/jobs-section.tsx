'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Plus, 
  Calendar,
  Users,
  UserCheck,
  ExternalLink,
  Edit,
  Trash2,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react'
import { JobDetailsModal } from '../job-details-modal'
import { JobPosting } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { useJobsRealtime, useApplicantsRealtime, useAnalyticsRealtime } from '@/hooks/use-realtime-data'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface JobWithApplicants extends JobPosting {
  job_posting_id?: string | number
  applicantStats: {
    total: number
    shortlisted: number
    flagged: number
    rejected: number
    pending: number
  }
  analytics?: string | null
  processingStatus?: 'processing' | 'in_progress' | 'finished'
}

export function JobsSection() {
  const { user } = useAuth()
  const router = useRouter()
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [jobs, setJobs] = useState<JobWithApplicants[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null)

  // Real-time updates for jobs and applicants
  useJobsRealtime(() => {
    console.log('Real-time job update detected, refreshing jobs...')
    refreshJobs()
  })
 
  useApplicantsRealtime(() => {
    console.log('Real-time applicant update detected, refreshing jobs...')
    refreshJobs()
  })
 
  useAnalyticsRealtime(() => {
    console.log('Real-time analytics update detected, refreshing jobs...')
    refreshJobs()
  })

  // Load jobs from database on component mount
  useEffect(() => {
    const loadJobs = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }
      
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('Loading jobs for user:', user.id)
        
        // Use frontend API route to fetch jobs
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Not authenticated')
          setIsLoading(false)
          return
        }

        const response = await fetch('/api/job-postings', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 404) {
            // No jobs found - this is okay, just show empty state
            setJobs([])
            setError(null)
            setIsLoading(false)
            return
          } else if (response.status === 401 || response.status === 403) {
            setError(
              response.status === 403
                ? 'Your account does not yet have employer access to manage job postings.'
                : 'Unable to verify your session for job postings right now. Please retry.'
            )
          } else {
            const errorData = await response.json().catch(() => ({}))
            // If it's a permission error, show helpful message
            if (errorData.error?.includes('Company profile required') || errorData.error?.includes('Access denied')) {
              setError('Your account needs a company profile. Please contact support.')
            } else {
              setError(errorData.error || 'Failed to load job postings')
            }
          }
          setIsLoading(false)
          return
        }

        const data = await response.json()
        const jobPostings = data.jobs || []
        
        console.log('Found job postings:', jobPostings.length, jobPostings)
        
        // Backend API already returns jobs with applicant stats
        const jobsWithApplicants: JobWithApplicants[] = jobPostings.map((job: any) => {
          const jobId = job.job_posting_id || job.id
          return {
            ...job,
            id: jobId,
            job_posting_id: jobId,
            job_title: job.job_title || 'Untitled Job',
            job_description: job.job_description || '',
            required_skills: Array.isArray(job.required_skills) ? job.required_skills : (job.skills_required ? (Array.isArray(job.skills_required) ? job.skills_required : [job.skills_required]) : []),
            meeting_link: job.meeting_link || job.interview_meeting_link || null,
            interview_meeting_link: job.interview_meeting_link || job.meeting_link || null,
            application_deadline: job.application_deadline || null,
            status: job.status || 'ACTIVE',
            created_at: job.created_at || new Date().toISOString(),
            applicantStats: {
              total: Number(job.applicant_count || 0),
              shortlisted: Number(job.shortlisted_count || 0),
              rejected: Number(job.rejected_count || 0),
              flagged: Number(job.flagged_count || 0),
              pending: Math.max(0, Number(job.applicant_count || 0) - 
                Number(job.shortlisted_count || 0) - 
                Number(job.rejected_count || 0) - 
                Number(job.flagged_count || 0)),
            }
          }
        })
        
        console.log('Processed jobs with applicants:', jobsWithApplicants.length)
        setJobs(jobsWithApplicants)
      } catch (err: any) {
        console.error('Error loading jobs:', err)
        const errorMessage = err?.message || 'An error occurred while loading jobs'
        setError(errorMessage)
        // Don't show error if it's just no jobs found
        if (errorMessage.includes('No company found') || errorMessage.includes('404')) {
          setJobs([])
          setError(null)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadJobs()
  }, [user?.id, user?.email])

  // Add a refresh function that can be called externally
  const refreshJobs = async () => {
    console.log('Manual refresh triggered')
    if (!user) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Use frontend API route to fetch jobs
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Not authenticated')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/job-postings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          // No jobs found - this is okay, just show empty state
          setJobs([])
          setError(null)
          setIsLoading(false)
          return
        } else if (response.status === 401 || response.status === 403) {
          setError(
            response.status === 403
              ? 'Your account does not yet have employer access to manage job postings.'
              : 'Unable to verify your session for job postings right now. Please retry.'
          )
        } else {
          const errorData = await response.json().catch(() => ({}))
          // If it's a permission error, show helpful message
          if (errorData.error?.includes('Company profile required') || errorData.error?.includes('Access denied')) {
            setError('Your account needs a company profile. Please contact support.')
          } else {
            setError(errorData.error || 'Failed to load job postings')
          }
        }
        setIsLoading(false)
        return
      }

      const data = await response.json()
      const jobPostings = data.jobs || []
      
      console.log('Refreshed job postings:', jobPostings.length)
      
      // Backend API already returns jobs with applicant stats
      const jobsWithApplicants: JobWithApplicants[] = jobPostings.map((job: any) => {
        const jobId = job.job_posting_id || job.id
        return {
          ...job,
          id: jobId,
          job_posting_id: jobId,
          job_title: job.job_title || 'Untitled Job',
          job_description: job.job_description || '',
          required_skills: Array.isArray(job.required_skills) ? job.required_skills : (job.skills_required ? (Array.isArray(job.skills_required) ? job.skills_required : [job.skills_required]) : []),
          meeting_link: job.meeting_link || job.interview_meeting_link || null,
          interview_meeting_link: job.interview_meeting_link || job.meeting_link || null,
          application_deadline: job.application_deadline || null,
          status: job.status || 'ACTIVE',
          created_at: job.created_at || new Date().toISOString(),
          applicantStats: {
            total: Number(job.applicant_count || 0),
            shortlisted: Number(job.shortlisted_count || 0),
            rejected: Number(job.rejected_count || 0),
            flagged: Number(job.flagged_count || 0),
            pending: Math.max(0, Number(job.applicant_count || 0) - 
              Number(job.shortlisted_count || 0) - 
              Number(job.rejected_count || 0) - 
              Number(job.flagged_count || 0)),
          }
        }
      })
      
      setJobs(jobsWithApplicants)
    } catch (err: any) {
        console.error('Error refreshing jobs:', err)
      const errorMessage = err?.message || 'An error occurred while refreshing jobs'
      setError(errorMessage)
      // Don't show error if it's just no jobs found
      if (errorMessage.includes('No company found') || errorMessage.includes('404')) {
        setJobs([])
        setError(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setIsDetailsModalOpen(true)
    }
  }

  const handleEditJob = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}/edit`)
  }

  const handleSaveJob = async (jobId: string, updatedData: Partial<JobPosting>) => {
    try {
      setError(null)
      
      const { error } = await supabase
        .from('job_postings')
        .update(updatedData)
        .eq('id', jobId)
      
      if (error) {
        throw error
      }
      
      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...updatedData } : job
      ))
      console.log('Job updated in database:', updatedData)
    } catch (err) {
      console.error('Error updating job:', err)
      setError('Failed to update job posting')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      setError(null)
      console.log('Attempting to delete job:', jobId)
      
      // First, verify the job exists and belongs to the user's company
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!company) {
        throw new Error('Company not found for user')
      }
      
      // Check if job exists and belongs to user's company
      const { data: existingJob, error: fetchError } = await supabase
        .from('job_postings')
        .select('id, company_id')
        .eq('id', jobId)
        .eq('company_id', company.id)
        .single()
      
      if (fetchError || !existingJob) {
        console.warn('Job not found or does not belong to user:', jobId)
        // Still update UI in case it was already deleted
        setJobs(prev => prev.filter(job => job.id !== jobId))
        return
      }
      
      // Now attempt to delete
      const { data, error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)
        .eq('company_id', company.id) // Extra security check
        .select()
      
      console.log('Delete result:', { data, error })
      
      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }
      
      if (!data || data.length === 0) {
        console.warn('No rows were deleted - job might not exist or already deleted')
        // Still update UI in case it was already deleted
        setJobs(prev => prev.filter(job => job.id !== jobId))
        return
      }
      
      // Update local state
      setJobs(prev => prev.filter(job => job.id !== jobId))
      console.log('Job successfully deleted from database:', jobId)
      
      // Refresh jobs from database to ensure consistency
      setTimeout(async () => {
        try {
          if (!user) return
          
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', user.id)
            .single()
          
          if (company) {
            const { data: jobPostings } = await supabase
              .from('job_postings')
              .select('*')
              .eq('company_id', company.id)
              .order('created_at', { ascending: false })
            
            setJobs(jobPostings || [])
            console.log('Jobs refreshed after deletion')
          }
        } catch (refreshErr) {
          console.error('Error refreshing jobs after deletion:', refreshErr)
        }
      }, 1000)
    } catch (err) {
      console.error('Error deleting job:', err)
      setError(`Failed to delete job posting: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] sm:p-8 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/70 to-transparent dark:from-slate-800/50" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">Hiring</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
            Job postings
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-gray-400">
            Create roles, share them with candidates, and track your pipeline in one place.
          </p>
        </div>
        <div className="flex w-full flex-row gap-2 sm:w-auto sm:gap-3">
          <Button 
            variant="outline" 
            onClick={refreshJobs}
            disabled={isLoading}
            size="sm"
            type="button"
            className="min-h-[44px] flex-1 touch-manipulation rounded-xl border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 sm:min-h-9 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin-smooth' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            type="button"
            className="min-h-[44px] flex-1 touch-manipulation rounded-xl bg-slate-900 text-white shadow-sm shadow-slate-500/20 hover:bg-slate-800 sm:min-h-9 sm:w-auto dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={() => router.push('/dashboard/jobs/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create new job
          </Button>        </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}


      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <div className="animate-spin-smooth rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job postings...</p>
          </div>
        </motion.div>
      )}

      {/* Jobs List */}
      {!isLoading && (
        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No job postings yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Get started by creating your first job posting. You'll be able to manage applicants and track your recruitment pipeline.
              </p>
              <Button 
                type="button"
                onClick={() => router.push('/dashboard/jobs/new')}
                className="min-h-[44px] touch-manipulation rounded-xl bg-blue-600 px-6 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 sm:min-h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Job
              </Button>
            </motion.div>
          ) : (
            jobs.map((job: JobWithApplicants, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
                        <Card className="border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2 gap-y-2">
                      <h3 className="text-xl font-semibold font-figtree">{job.job_title}</h3>
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
                    <p className="text-gray-600 dark:text-gray-400 font-figtree font-light mb-4 line-clamp-2">
                      {job.job_description?.substring(0, 150)}{job.job_description && job.job_description.length > 150 ? '...' : ''}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{job.applicantStats?.total || 0} applicants</span>
                      </div>
                      {job.applicantStats?.shortlisted > 0 && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">{job.applicantStats.shortlisted} shortlisted</span>
                        </div>
                      )}
                      {job.application_deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:min-w-[140px]">
                    <Link
                      href={`/dashboard/job/${String(job.id || job.job_posting_id || '')}/shortlisted`}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="w-full"
                    >
                      <Button 
                        type="button"
                        variant="default" 
                        size="sm"
                      className="min-h-[44px] w-full touch-manipulation rounded-xl bg-slate-900 text-white hover:bg-slate-800 sm:min-h-9 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Candidates
                      <ArrowUpRight className="ml-auto h-4 w-4" />
                    </Button>
                    </Link>
                    <div className="flex flex-row gap-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditJob(job.id)}
                        className="min-h-[44px] flex-1 touch-manipulation border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 sm:min-h-9 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(job.id)}
                        className="min-h-[44px] flex-1 touch-manipulation rounded-xl bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 sm:min-h-9 sm:w-auto dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => setJobToDelete(job)}
                        className="min-h-[44px] w-full touch-manipulation text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 sm:min-h-9 sm:w-auto dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <JobDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedJob(null)
        }}
        jobPosting={selectedJob}
        onEdit={handleEditJob}
      />

      {/* Delete Confirmation Dialog */}
      {jobToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setJobToDelete(null)}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Job Posting</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the job posting for:
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900">{jobToDelete.job_title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {jobToDelete.job_description.substring(0, 100)}...
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setJobToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteJob(jobToDelete.id)
                  setJobToDelete(null)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Job
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
