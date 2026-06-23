'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, Plus, Calendar, Users, UserCheck, ExternalLink, Edit, Trash2, RefreshCw, ArrowUpRight, 
  LayoutGrid, Table as TableIcon, List, ChevronLeft, ChevronRight, MoreVertical, Sparkles 
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { JobDetailsModal } from '../job-details-modal'
import { JobPosting } from '@/types'

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
}

export function JobsSection() {
  const { user } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'linear' | 'table'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [jobs, setJobs] = useState<JobWithApplicants[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null)
  const [showFirstJobModal, setShowFirstJobModal] = useState(false)

  const loadJobs = useCallback(async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/job-postings', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      const data = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to load job postings')
      }

      const jobPostings = data.jobs || []
      
      if (jobPostings.length === 0) {
        const hasSeenPrompt = localStorage.getItem('hasSeenFirstJobPrompt')
        if (!hasSeenPrompt) {
          setShowFirstJobModal(true)
        }
      }

      setJobs(jobPostings.map((job: any) => ({
        ...job,
        id: job.job_posting_id || job.id,
        applicantStats: {
          total: Number(job.applicant_count || 0),
          shortlisted: Number(job.shortlisted_count || 0),
          rejected: Number(job.rejected_count || 0),
          flagged: Number(job.flagged_count || 0),
          pending: Math.max(0, Number(job.applicant_count || 0) - Number(job.shortlisted_count || 0) - Number(job.rejected_count || 0) - Number(job.flagged_count || 0)),
        }
      })))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => { loadJobs() }, [loadJobs])
  useJobsRealtime(loadJobs)
  useApplicantsRealtime(loadJobs)
  useAnalyticsRealtime(loadJobs)

  const totalPages = Math.ceil(jobs.length / itemsPerPage)
  const paginatedJobs = useMemo(() => jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [jobs, currentPage])

  const handleViewDetails = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) { setSelectedJob(job); setIsDetailsModalOpen(true); }
  }

  const handleEditJob = (jobId: string) => router.push(`/hr/jobs/${jobId}/edit`)

  const handleDeleteJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/job-postings/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to delete job')
      setJobs(prev => prev.filter(j => j.id !== jobId))
    } catch (err) {
      setError('Failed to delete job')
    }
  }

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const newStatus = currentStatus?.toLowerCase() === 'active' ? 'paused' : 'active'
      const response = await fetch(`/api/job-postings/${jobId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!response.ok) throw new Error('Failed to update status')
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
    } catch (err) {
      setError('Failed to update job status')
    }
  }

  const Pagination = () => {
    if (totalPages <= 1) return null
    return (
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Hiring</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Job postings</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={loadJobs} disabled={isLoading} size="sm" className="rounded-xl"><RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</Button>
            <Button variant="default" size="sm" className="rounded-xl bg-[#2D2DDD] hover:bg-[#2D2DDD]/90 text-white" onClick={() => router.push('/hr/jobs/new')}><Plus className="w-4 h-4 mr-2" /> New Job</Button>
          </div>
        </div>
      </motion.div>

      {/* View Toggle Row */}
      {!isLoading && jobs.length > 0 && (
        <div className="flex justify-end mb-[-12px]">
          <div className="flex bg-slate-100 /50 p-1 rounded-xl border border-slate-200/50 ">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('grid')} 
              className={`h-8 w-10 rounded-lg p-0 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2D2DDD]' : 'text-slate-500 hover:text-slate-900'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('linear')} 
              className={`h-8 w-10 rounded-lg p-0 transition-all ${viewMode === 'linear' ? 'bg-white shadow-sm text-[#2D2DDD]' : 'text-slate-500 hover:text-slate-900'}`}
              title="Linear View"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('table')} 
              className={`h-8 w-10 rounded-lg p-0 transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#2D2DDD]' : 'text-slate-500 hover:text-slate-900'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-[#2D2DDD]" /></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-red-200/90 shadow-sm mt-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <RefreshCw className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold font-figtree text-slate-900 mb-2">Error Loading Jobs</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            {error}
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="rounded-xl px-8 h-12 text-base shadow-sm" 
            onClick={loadJobs}
          >
            <RefreshCw className="w-5 h-5 mr-2" /> 
            Try Again
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm mt-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="w-10 h-10 text-[#2D2DDD]" />
          </div>
          <h3 className="text-2xl font-bold font-figtree text-slate-900 mb-2">Post Your First Job</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            You haven't posted any jobs yet. Create your first job posting to start receiving AI-screened applications.
          </p>
          <Button 
            size="lg" 
            className="rounded-xl bg-[#2D2DDD] hover:bg-[#2D2DDD]/90 text-white px-8 h-12 text-base shadow-lg shadow-[#2D2DDD]/20" 
            onClick={() => router.push('/hr/jobs/new')}
          >
            <Plus className="w-5 h-5 mr-2" /> 
            Create Job Posting
          </Button>
        </div>
      ) : viewMode === 'grid' || viewMode === 'linear' ? (
        <div className="space-y-6">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {paginatedJobs.map((job, index) => (
              <motion.div 
                key={job.id} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group relative"
              >
                <Card 
                  className={`cursor-pointer border-slate-200 bg-white transition-all hover:border-[#2D2DDD]/30 hover:shadow-md overflow-hidden flex ${viewMode === 'linear' ? 'flex-col sm:flex-row' : 'flex-col'}`}
                  onClick={() => handleViewDetails(job.id)}
                >
                  <div className={`${viewMode === 'linear' ? 'w-full sm:w-1/3 sm:min-w-[250px] sm:max-w-[300px] sm:border-r sm:border-b-0' : 'w-full h-32'} bg-gradient-to-br from-indigo-50 to-blue-50 relative border-b border-slate-100 flex items-center justify-center overflow-hidden shrink-0`}>
                    {job.job_poster_url ? (
                      <img 
                        src={job.job_poster_url} 
                        alt={`${job.job_title} poster`} 
                        className="w-full h-full object-cover absolute inset-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`flex flex-col items-center justify-center p-6 ${job.job_poster_url ? 'hidden' : ''}`}>
                      <Briefcase className="w-6 h-6 text-[#2D2DDD]/40 mb-1" />
                      <span className="text-xs font-medium text-slate-400 text-center">Add a job poster (recommended)</span>
                    </div>
                  </div>
                  <CardContent className={`p-6 flex-1 flex flex-col ${viewMode === 'linear' ? 'justify-center' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl text-foreground group-hover:text-[#2D2DDD] transition-colors">
                          {job.job_title}
                        </h3>
                        <Badge variant={job.status?.toLowerCase() as any} className="text-[10px] px-2 py-0">
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={() => handleEditJob(job.id)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" /> Edit Posting
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(job.id, job.status || '')} className="cursor-pointer">
                              <RefreshCw className="w-4 h-4 mr-2" /> {job.status?.toUpperCase() === 'ACTIVE' ? 'Pause Posting' : 'Activate Posting'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setJobToDelete(job)} 
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 max-w-3xl leading-relaxed">
                      {job.job_description || 'No description provided for this position.'}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-50 ">
                      <div className="flex flex-wrap items-center gap-6 text-slate-400">
                        <div className="flex items-center gap-2" title="Total Applicants">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {job.applicantStats.total} applicants
                          </span>
                        </div>
                        {job.application_deadline && (
                          <div className="flex items-center gap-2" title="Deadline">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest hidden md:inline">
                          Ref: {String(job.id).slice(0, 8)}
                        </span>
                      </div>

                      <Link href={`/hr/job/${job.id}/shortlisted`} onClick={(e) => e.stopPropagation()}>
                        <Button 
                          className="w-full sm:w-auto rounded-lg bg-slate-900 text-white hover:bg-[#2D2DDD] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-all shadow-sm group/btn"
                        >
                          View Candidates
                          <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Pagination />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden  ">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="font-bold">Job Title</TableHead>
                <TableHead className="text-center font-bold">Applicants</TableHead>
                <TableHead className="text-center font-bold">Shortlisted</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-semibold">{job.job_title}</TableCell>
                  <TableCell className="text-center">{job.applicantStats.total}</TableCell>
                  <TableCell className="text-center text-green-600 font-bold">{job.applicantStats.shortlisted}</TableCell>
                  <TableCell><Badge variant={job.status?.toLowerCase() as any}>{job.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/hr/job/${job.id}/shortlisted`)}><ArrowUpRight className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t"><Pagination /></div>
        </div>
      )}

      <JobDetailsModal isOpen={isDetailsModalOpen} onClose={() => { setIsDetailsModalOpen(false); setSelectedJob(null); }} jobPosting={selectedJob} onEdit={handleEditJob} />
      
      {jobToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setJobToDelete(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-background rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-2 text-red-600">Delete Job Posting?</h3>
            <p className="text-slate-500 mb-6">Are you sure you want to delete <strong>{jobToDelete.job_title}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setJobToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { handleDeleteJob(jobToDelete.id); setJobToDelete(null); }}>Delete Permanently</Button>
            </div>
          </motion.div>
        </div>
      )}

      {showFirstJobModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
            localStorage.setItem('hasSeenFirstJobPrompt', 'true');
            setShowFirstJobModal(false);
          }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Sparkles className="w-8 h-8 text-[#2D2DDD]" />
            </div>
            <h3 className="text-2xl font-bold font-figtree text-slate-900 mb-3 text-center">Welcome to OptioHire!</h3>
            <p className="text-slate-500 mb-8 text-center leading-relaxed">
              Create your first job posting to start receiving AI-screened applications. We'll guide you through setting up requirements, descriptions, and more.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                size="lg"
                className="w-full rounded-xl bg-[#2D2DDD] hover:bg-[#2D2DDD]/90 text-white h-12 text-base shadow-lg shadow-[#2D2DDD]/20" 
                onClick={() => {
                  localStorage.setItem('hasSeenFirstJobPrompt', 'true');
                  setShowFirstJobModal(false);
                  router.push('/hr/jobs/new');
                }}
              >
                <Plus className="w-5 h-5 mr-2" /> 
                Create First Job
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-slate-500 hover:text-slate-700 h-12"
                onClick={() => {
                  localStorage.setItem('hasSeenFirstJobPrompt', 'true');
                  setShowFirstJobModal(false);
                }}
              >
                Skip for now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
