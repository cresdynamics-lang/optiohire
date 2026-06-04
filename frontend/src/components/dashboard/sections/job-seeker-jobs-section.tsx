import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Briefcase, Sparkles, TrendingUp, Upload, FileText, Link2, CheckCircle2, Clock3, AlertTriangle, XCircle, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

type CandidateJob = {
  job_posting_id: string
  job_title: string
  job_description: string
  skills_required: string[] | string | null
  application_deadline: string | null
  company_name: string | null
  job_poster_url?: string | null
}

type CandidateApplication = {
  application_id: string
  created_at: string
  updated_at?: string | null
  ai_score?: number | null
  ai_status?: 'SHORTLIST' | 'FLAG' | 'REJECT' | null
  reasoning?: string | null
  phone?: string | null
  resume_url?: string | null
  parsed_resume_json?: {
    links?: {
      resumeUrl?: string | null
      linkedinUrl?: string | null
      githubUrl?: string | null
      otherUrl?: string | null
    }
    document?: {
      name?: string | null
      mimeType?: string | null
    }
    note?: string | null
  } | null
  job_posting_id: string
  job_title: string
  company_name?: string | null
}

const truncateWords = (text: string, limit: number) => {
  const words = text.split(/\s+/)
  if (words.length <= limit) return text
  return words.slice(0, limit).join(' ') + '...'
}

export function JobSeekerJobsSection() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<CandidateJob[]>([])
  const [loading, setLoading] = useState(false)
  const [submittingJobId, setSubmittingJobId] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [formByJobId, setFormByJobId] = useState<
    Record<
      string,
      {
        resumeUrl: string
        resumeFileName: string
        resumeMimeType: string
        linkedinUrl: string
        githubUrl: string
        otherUrl: string
        phone: string
        message: string
      }
    >
  >({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [uploadingJobId, setUploadingJobId] = useState<string | null>(null)
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null)

  // Filters and Pagination State
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const jobsPerPage = 5

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setStatusMessage(null)
        const token = localStorage.getItem('token')
        if (!token) {
          setStatusMessage('Please sign in to view jobs.')
          return
        }
        const response = await fetch('/api/candidate/jobs', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load jobs')
        }
        const data = await response.json()
        setJobs(data.jobs || [])

        const appResponse = await fetch('/api/candidate/applications', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (appResponse.ok) {
          const appData = await appResponse.json()
          setApplications(appData.applications || [])
        }
      } catch (error: any) {
        setStatusMessage(error?.message || 'Unable to load jobs right now.')
      } finally {
        // Keep jobs section interactive; no loading lock.
      }
    }
    void loadJobs()
  }, [])

  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return jobs
      .map((job) => ({
        ...job,
        skills: Array.isArray(job.skills_required)
          ? job.skills_required
          : typeof job.skills_required === 'string'
            ? job.skills_required.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
      }))
      .filter((job) => 
        job.job_title.toLowerCase().includes(query) || 
        (job.company_name || '').toLowerCase().includes(query) ||
        job.job_description.toLowerCase().includes(query)
      )
  }, [jobs, searchQuery])

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage
    return filteredJobs.slice(startIndex, startIndex + jobsPerPage)
  }, [filteredJobs, currentPage])

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const updateForm = (jobId: string, key: string, value: string) => {
    setFormByJobId((prev) => ({
      ...prev,
      [jobId]: {
        resumeUrl: prev[jobId]?.resumeUrl || '',
        resumeFileName: prev[jobId]?.resumeFileName || '',
        resumeMimeType: prev[jobId]?.resumeMimeType || '',
        linkedinUrl: prev[jobId]?.linkedinUrl || '',
        githubUrl: prev[jobId]?.githubUrl || '',
        otherUrl: prev[jobId]?.otherUrl || '',
        phone: prev[jobId]?.phone || '',
        message: prev[jobId]?.message || '',
        [key]: value,
      },
    }))
  }

  const applyToJob = async (jobId: string) => {
    const form = formByJobId[jobId] || {
      resumeUrl: '',
      resumeFileName: '',
      resumeMimeType: '',
      linkedinUrl: '',
      githubUrl: '',
      otherUrl: '',
      phone: '',
      message: '',
    }
    try {
      setSubmittingJobId(jobId)
      setStatusMessage(null)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Please sign in before applying.')
      const response = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobPostingId: jobId,
          resumeUrl: form.resumeUrl,
          resumeFileName: form.resumeFileName,
          resumeMimeType: form.resumeMimeType,
          linkedinUrl: form.linkedinUrl,
          githubUrl: form.githubUrl,
          otherUrl: form.otherUrl,
          phone: form.phone,
          message: form.message,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Application failed')
      }
      setStatusMessage('Application submitted successfully. You can update it anytime by re-submitting.')
      setExpandedJobId(null)
      const refreshToken = localStorage.getItem('token')
      if (refreshToken) {
        const appResponse = await fetch('/api/candidate/applications', {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            'Content-Type': 'application/json',
          },
        })
        if (appResponse.ok) {
          const appData = await appResponse.json()
          setApplications(appData.applications || [])
        }
      }
    } catch (error: any) {
      setStatusMessage(error?.message || 'Could not submit application.')
    } finally {
      setSubmittingJobId(null)
    }
  }

  const uploadDocument = async (jobId: string, file: File) => {
    try {
      setUploadingJobId(jobId)
      setStatusMessage(null)

      const token = localStorage.getItem('token')
      if (!token) throw new Error('Please sign in before uploading a document.')

      const formData = new FormData()
      formData.append('document', file)

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/upload/candidate-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to upload document')
      }

      const data = await response.json()
      updateForm(jobId, 'resumeUrl', data.url || '')
      updateForm(jobId, 'resumeFileName', data.originalName || file.name || '')
      updateForm(jobId, 'resumeMimeType', data.mimetype || file.type || '')
      setStatusMessage('Document uploaded. It has been attached to your application.')
    } catch (error: any) {
      setStatusMessage(error?.message || 'Unable to upload document right now.')
    } finally {
      setUploadingJobId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/70 to-transparent" aria-hidden />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
            <Sparkles className="h-3.5 w-3.5" />
            Candidate Jobs
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Open roles you can apply to</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Apply using your CV link, LinkedIn, GitHub, and any additional portfolio link. Your latest submission is saved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search jobs by title, company, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
          <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
            <TrendingUp className="h-3.5 w-3.5" />
            AI watcher continuously reviews submitted evidence and updates employer decisions.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">Application History</CardTitle>
          <CardDescription className="text-slate-600">
            Track watcher decisions and recruiter pipeline progress for your submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-sm text-slate-600">No applications submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 8).map((application) => {
                const status = (application.ai_status || 'PENDING').toUpperCase()
                const statusUi =
                  status === 'SHORTLIST'
                    ? { label: 'Shortlisted', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                    : status === 'FLAG'
                      ? { label: 'Under Review', icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border-amber-200' }
                      : status === 'REJECT'
                        ? { label: 'Not Selected', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' }
                        : { label: 'Submitted', icon: Clock3, className: 'bg-slate-100 text-slate-700 border-slate-200' }
                const StatusIcon = statusUi.icon
                return (
                  <div
                    key={application.application_id}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{application.job_title}</p>
                        <p className="text-xs text-slate-500">
                          {application.company_name || 'Employer'} - {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof application.ai_score === 'number' ? (
                          <span className="text-xs font-medium text-slate-600">Score: {Math.round(application.ai_score)}</span>
                        ) : null}
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusUi.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusUi.label}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedApplicationId(
                              expandedApplicationId === application.application_id ? null : application.application_id
                            )
                          }
                          className="h-8 border-slate-300 px-2"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedApplicationId === application.application_id ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </div>

                    {expandedApplicationId === application.application_id ? (
                      <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-700">Resume:</span>{' '}
                          {application.resume_url ? (
                            <a
                              href={application.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-800 underline"
                            >
                              Open resume/document
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                        {application.parsed_resume_json?.document?.name ? (
                          <p>
                            <span className="font-semibold text-slate-700">Document:</span>{' '}
                            {application.parsed_resume_json.document.name}
                          </p>
                        ) : null}
                        <p>
                          <span className="font-semibold text-slate-700">LinkedIn:</span>{' '}
                          {application.parsed_resume_json?.links?.linkedinUrl || 'Not provided'}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">GitHub:</span>{' '}
                          {application.parsed_resume_json?.links?.githubUrl || 'Not provided'}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Other link:</span>{' '}
                          {application.parsed_resume_json?.links?.otherUrl || 'Not provided'}
                        </p>
                        {application.parsed_resume_json?.note ? (
                          <p>
                            <span className="font-semibold text-slate-700">Candidate note:</span>{' '}
                            {application.parsed_resume_json.note}
                          </p>
                        ) : null}
                        {application.reasoning ? (
                          <p>
                            <span className="font-semibold text-slate-700">Watcher reasoning:</span>{' '}
                            {application.reasoning.slice(0, 220)}
                            {application.reasoning.length > 220 ? '...' : ''}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {statusMessage ? (
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-5 text-sm text-slate-700">{statusMessage}</CardContent>
        </Card>
      ) : null}

      {filteredJobs.length === 0 ? (
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-5 text-sm text-slate-600">
            {searchQuery ? `No jobs found matching "${searchQuery}".` : 'No active job postings are available right now.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {paginatedJobs.map((job) => {
              const form = formByJobId[job.job_posting_id] || {
                resumeUrl: '',
                resumeFileName: '',
                resumeMimeType: '',
                linkedinUrl: '',
                githubUrl: '',
                otherUrl: '',
                phone: '',
                message: '',
              }
              const isExpanded = expandedJobId === job.job_posting_id
              const isSubmitting = submittingJobId === job.job_posting_id
              const isUploading = uploadingJobId === job.job_posting_id
              const hasApplicationEvidence = Boolean(
                form.resumeUrl || form.linkedinUrl || form.githubUrl || form.otherUrl
              )
              return (
                <Card 
                  key={job.job_posting_id} 
                  className={`group border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden ${isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
                >
                  {/* Job Poster & Fallback */}
                  <div className="w-full h-32 bg-slate-100 flex items-center justify-center overflow-hidden relative border-b border-slate-100">
                    {job.job_poster_url ? (
                      <img src={job.job_poster_url} alt={`${job.job_title} Poster`} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Briefcase className="h-8 w-8 text-slate-400" />
                          <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">{job.company_name || 'OptioHire'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardHeader className="space-y-2 pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-base text-slate-900 line-clamp-1">
                        <Briefcase className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        {job.job_title}
                      </CardTitle>
                      {!isExpanded && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 flex-shrink-0">
                          Open
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex flex-col gap-1 text-slate-600">
                      <span className="font-medium text-slate-700">{job.company_name || 'OptioHire Employer'}</span>
                      {job.application_deadline ? (
                        <span className="text-xs">Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                      ) : null}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {isExpanded ? job.job_description : truncateWords(job.job_description, 20)}
                    </p>
                    {job.skills.length > 0 && !isExpanded ? (
                      <div className="flex flex-wrap gap-1.5">
                        {job.skills.slice(0, 3).map((skill) => (
                          <Badge key={`${job.job_posting_id}-${skill}`} variant="outline" className="text-[10px] py-0">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-xs text-slate-400">+{job.skills.length - 3}</span>
                        )}
                      </div>
                    ) : job.skills.length > 0 && isExpanded ? (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={`${job.job_posting_id}-${skill}`} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    
                    {!isExpanded && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setExpandedJobId(job.job_posting_id)}
                        className="w-full bg-[#2D2DDD] text-white hover:bg-[#2525c4] mt-2"
                      >
                        Apply Now
                      </Button>
                    )}

                    {isExpanded ? (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="text-sm font-semibold text-slate-900 mb-4">Submit your application</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Email</label>
                              <Input value={user?.email || ''} readOnly disabled className="bg-slate-50" />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">CV / Resume Document</label>
                              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300">
                                <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-600">
                                  <span className="inline-flex items-center gap-2 font-medium">
                                    <Upload className="h-4 w-4 text-indigo-500" />
                                    {isUploading ? 'Uploading...' : 'Upload File'}
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.webp"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        void uploadDocument(job.job_posting_id, file)
                                      }
                                      e.currentTarget.value = ''
                                    }}
                                  />
                                </label>
                                {form.resumeFileName ? (
                                  <div className="mt-3 flex items-center justify-between bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md border border-emerald-100">
                                    <span className="text-xs font-medium truncate flex-1">{form.resumeFileName}</span>
                                    <CheckCircle2 className="h-4 w-4 ml-2 flex-shrink-0" />
                                  </div>
                                ) : (
                                  <p className="mt-2 text-[10px] text-slate-500">PDF, DOCX, JPG (Max 10MB)</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Or Paste CV Link</label>
                              <div className="relative">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                  placeholder="https://..."
                                  value={form.resumeUrl}
                                  onChange={(e) => updateForm(job.job_posting_id, 'resumeUrl', e.target.value)}
                                  className="pl-9"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">LinkedIn</label>
                                <Input
                                  placeholder="linkedin.com/in/..."
                                  value={form.linkedinUrl}
                                  onChange={(e) => updateForm(job.job_posting_id, 'linkedinUrl', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">GitHub</label>
                                <Input
                                  placeholder="github.com/..."
                                  value={form.githubUrl}
                                  onChange={(e) => updateForm(job.job_posting_id, 'githubUrl', e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Other Link / Portfolio</label>
                              <Input
                                placeholder="Portfolio or website"
                                value={form.otherUrl}
                                onChange={(e) => updateForm(job.job_posting_id, 'otherUrl', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone (Optional)</label>
                              <Input
                                placeholder="+1 234 567 8900"
                                value={form.phone}
                                onChange={(e) => updateForm(job.job_posting_id, 'phone', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Note to Employer (Optional)</label>
                              <Textarea
                                placeholder="Why are you a good fit?"
                                value={form.message}
                                onChange={(e) => updateForm(job.job_posting_id, 'message', e.target.value)}
                                className="h-20 resize-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                          {!hasApplicationEvidence ? (
                            <p className="text-xs text-amber-600 sm:mr-auto flex items-center">
                              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                              Please add at least one link or upload a CV.
                            </p>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setExpandedJobId(null)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            disabled={!hasApplicationEvidence || isSubmitting}
                            onClick={() => void applyToJob(job.job_posting_id)}
                            className="w-full sm:w-auto bg-[#2D2DDD] text-white hover:bg-[#2525c4]"
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing <span className="font-medium">{(currentPage - 1) * jobsPerPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * jobsPerPage, filteredJobs.length)}
                    </span> of{' '}
                    <span className="font-medium">{filteredJobs.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="rounded-l-md px-2 py-2"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        className={`hidden md:inline-flex ${currentPage === i + 1 ? "bg-[#2D2DDD] text-white" : ""}`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="rounded-r-md px-2 py-2"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
