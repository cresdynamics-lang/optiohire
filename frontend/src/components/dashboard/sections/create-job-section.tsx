'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Plus, 
  Briefcase, 
  Users, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Video, 
  ChevronLeft,
  Info,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react'
import { JobPostingFormData } from '@/types'
import { SingleDateTimePicker } from '@/components/ui/single-date-time-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { JobPreviewSheet } from './job-preview-sheet'

const APPLICATION_INBOX_EMAIL = 'jobs@optiohire.com'

export function CreateJobSection() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState<JobPostingFormData>({
    company_name: '',
    company_email: '',
    hr_email: '',
    job_title: '',
    job_description: '',
    required_skills: [],
    interview_meeting_link: '',
    application_deadline: '',
  })

  const [newSkill, setNewSkill] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    status: 'idle' | 'sending' | 'success' | 'error'
    message: string
  }>({ status: 'idle', message: '' })
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [createdJobInfo, setCreatedJobInfo] = useState<{ jobTitle: string; companyName: string; jobId?: string } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [workType, setWorkType] = useState('Remote')
  const [customWorkType, setCustomWorkType] = useState('')

  // Pre-fill company info from user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        company_name: user.companyName || prev.company_name,
        company_email: user.companyEmail || prev.company_email,
        hr_email: user.hrEmail || prev.hr_email,
      }))
    }
  }, [user])

  const handleInputChange = (field: keyof JobPostingFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    setPosterFile(file)
    setIsUploadingPoster(true)
    setUploadProgress(0)
    
    try {
      const formData = new FormData()
      formData.append('poster', file) // Must match upload.single('poster') on backend
      
      const token = localStorage.getItem('token')
      
      const xhr = new XMLHttpRequest()
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      }
      
      xhr.onload = () => {
        setIsUploadingPoster(false)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            if (data.url) {
              handleInputChange('job_poster_url', data.url)
              setUploadProgress(100)
            } else {
              throw new Error('No URL in response')
            }
          } catch (err) {
            setStatus({ status: 'error', message: 'Failed to parse response' })
            setPosterFile(null)
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            setStatus({ status: 'error', message: errorData.error || 'Upload failed' })
          } catch {
            setStatus({ status: 'error', message: `Upload failed with status ${xhr.status}` })
          }
          setPosterFile(null)
        }
      }
      
      xhr.onerror = () => {
        setIsUploadingPoster(false)
        setStatus({ status: 'error', message: 'Network error during upload' })
        setPosterFile(null)
      }
      
      xhr.open('POST', '/api/upload/job-poster', true)
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      xhr.send(formData)
      
    } catch (err: any) {
      setStatus({ status: 'error', message: err.message || 'Error uploading poster' })
      setPosterFile(null)
      setIsUploadingPoster(false)
    }
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    const currentSkills = formData.required_skills || []
    const skillsToAdd = newSkill
      .split(/[,\n]+/)
      .map(s => s.replace(/^\d+\.\s*/, '').trim())
      .filter(s => s.length > 0 && !currentSkills.includes(s))
    if (skillsToAdd.length > 0) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, ...skillsToAdd]
      }))
    }
    setNewSkill('')
  }

  const handleSkillPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text')
    if (text.includes(',') || text.includes('\n')) {
      e.preventDefault()
      const currentSkills = formData.required_skills || []
      const skillsToAdd = text
        .split(/[,\n]+/)
        .map(s => s.replace(/^\d+\.\s*/, '').trim())
        .filter(s => s.length > 0 && !currentSkills.includes(s))
      if (skillsToAdd.length > 0) {
        setFormData(prev => ({
          ...prev,
          required_skills: [...prev.required_skills, ...skillsToAdd]
        }))
      }
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const copyToClipboard = async (text: string, type: 'link' | 'email') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'link') {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } else {
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (!formData.company_name || formData.company_name.length < 2) {
      setStatus({ status: 'error', message: 'Company name must be at least 2 characters' })
      return
    }
    if (!formData.job_title || formData.job_title.length < 3) {
      setStatus({ status: 'error', message: 'Job title must be at least 3 characters' })
      return
    }
    if (!formData.job_description || formData.job_description.length < 50) {
      setStatus({ status: 'error', message: 'Job description must be at least 50 characters' })
      return
    }
    if (!formData.required_skills || formData.required_skills.length === 0) {
      setStatus({ status: 'error', message: 'Please add at least one required skill' })
      return
    }
    if (!formData.application_deadline) {
      setStatus({ status: 'error', message: 'Please select an application deadline' })
      return
    }
    
    setIsSubmitting(true)
    setStatus({ status: 'sending', message: 'Creating job posting...' })

    try {
      const finalWorkType = workType === 'Custom' ? customWorkType : workType
      const token = localStorage.getItem('token')
      const resp = await fetch('/api/job-postings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          company_email: formData.company_email,
          hr_email: formData.hr_email,
          job_title: formData.job_title,
          job_description: `${formData.job_description}\n\n[Work Type: ${finalWorkType}]`,
          required_skills: formData.required_skills,
          application_deadline: formData.application_deadline,
          meeting_link: formData.interview_meeting_link || undefined,
          job_poster_url: formData.job_poster_url || undefined,
          // custom_questions are optional — strip any blank ones before sending
          custom_questions: (formData.custom_questions || []).filter((q: any) => q.question?.trim())
        })
      })
      
      const data = await resp.json().catch(() => ({}))
      
      if (resp.ok && data.success) {
        setCreatedJobInfo({
          jobTitle: formData.job_title,
          companyName: formData.company_name,
          jobId: data.job_posting_id
        })
        setShowSuccessDialog(true)
        setStatus({ status: 'success', message: 'Job created successfully!' })
      } else {
        throw new Error(data.details || data.error?.message || data.error || 'Failed to create job posting')
      }
    } catch (error: any) {
      setStatus({ status: 'error', message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/hr/jobs')} className="rounded-full">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]   overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 /50 ">
            <CardTitle className="text-2xl font-bold font-figtree">New Job Posting</CardTitle>
            <p className="text-slate-500 mt-1">Fill in the details below to create a new role and start receiving applications.</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Company Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Company Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-sm font-semibold">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Enter company name"
                      className="h-11 border-slate-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company_email" className="text-sm font-semibold">Company Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={formData.company_email}
                      onChange={(e) => handleInputChange('company_email', e.target.value)}
                      placeholder="company@example.com"
                      className="h-11 border-slate-200"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hr_email" className="text-sm font-semibold">HR Contact Email</Label>
                  <Input
                    id="hr_email"
                    type="email"
                    value={formData.hr_email}
                    onChange={(e) => handleInputChange('hr_email', e.target.value)}
                    placeholder="hr@example.com"
                    className="h-11 border-slate-200"
                    required
                  />
                  <p className="text-[11px] text-slate-400">This email will receive notifications about new applicants.</p>
                </div>
              </div>

              {/* Role Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Users className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Role Information</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job_title" className="text-sm font-semibold">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="h-12 text-lg font-medium border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_type" className="text-sm font-semibold">Work Type / Location</Label>
                  <select
                    id="work_type"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Contract">Contract</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Custom">Custom (Type below)</option>
                  </select>
                </div>
                {workType === 'Custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom_work_type" className="text-sm font-semibold">Custom Work Type</Label>
                    <Input
                      id="custom_work_type"
                      placeholder="e.g. Remote (US Only)"
                      className="h-11 border-slate-200"
                      value={customWorkType}
                      onChange={(e) => setCustomWorkType(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="job_description" className="text-sm font-semibold flex justify-between">
                    Job Description 
                    <span className="text-slate-400 font-normal text-xs">Supports Markdown (**, -, *)</span>
                  </Label>
                  <Textarea
                    id="job_description"
                    value={formData.job_description}
                    onChange={(e) => handleInputChange('job_description', e.target.value)}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={8}
                    className="border-slate-200 leading-relaxed resize-none"
                    required
                    minLength={50}
                  />
                  {formData.job_description && formData.job_description.length < 50 && (
                    <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded-lg inline-block">
                      {50 - formData.job_description.length} more characters needed for AI analysis
                    </p>
                  )}
                </div>
                
                {/* Skills */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skills — type one or paste a comma-separated list"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      onPaste={handleSkillPaste}
                      className="h-11 border-slate-200"
                    />
                    <Button type="button" onClick={addSkill} className="bg-slate-900 text-white hover:bg-slate-800 px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 min-h-[40px] p-4 bg-slate-50 rounded-xl /50 border border-dashed border-border">
                    {formData.required_skills.map((skill, index) => (
                      <Badge
                        key={`skill-${index}`}
                        variant="secondary"
                        className="px-3 py-1.5 flex items-center gap-2 bg-white text-indigo-700 border-slate-200 shadow-sm hover:bg-indigo-50 transition-colors"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="rounded-full hover:bg-indigo-100 p-0.5 text-slate-400 hover:text-indigo-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {formData.required_skills.length === 0 && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Info className="h-4 w-4" />
                        <span>Add at least one skill for AI matching</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Poster Upload */}
                <div className="space-y-3 pt-4">
                  <Label className="text-sm font-semibold">Job Poster (Optional)</Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="poster_upload" className={`cursor-pointer ${isUploadingPoster ? 'pointer-events-none opacity-70' : ''}`}>
                        <div className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 /50  dark:hover:bg-slate-800 transition-colors px-6 py-3 rounded-xl shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300">
                          {isUploadingPoster ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-indigo-600" />
                          )}
                          {isUploadingPoster ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
                        </div>
                      </Label>
                      <Input
                        id="poster_upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePosterUpload}
                        disabled={isUploadingPoster}
                      />
                      {formData.job_poster_url && !isUploadingPoster && (
                        <div className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                          <CheckCircle className="h-4 w-4" /> Poster Uploaded
                        </div>
                      )}
                    </div>
                    {isUploadingPoster && (
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 max-w-xs  overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    {formData.job_poster_url && !isUploadingPoster && (
                      <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200 mt-2">
                        <img 
                          src={formData.job_poster_url} 
                          alt="Job Poster Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPosterFile(null)
                            handleInputChange('job_poster_url', '')
                          }}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-700 rounded-full p-1.5 shadow-sm transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-100 ">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Clock className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Application Deadline</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application_deadline" className="text-sm font-semibold">Deadline Date & Time</Label>
                    <SingleDateTimePicker
                      value={formData.application_deadline}
                      onChange={(value) => handleInputChange('application_deadline', value)}
                      placeholder="Select deadline"
                      minDateTime={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Video className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Interview Settings</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interview_meeting_link" className="text-sm font-semibold">Default Meeting Link (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="interview_meeting_link"
                        value={formData.interview_meeting_link}
                        onChange={(e) => handleInputChange('interview_meeting_link', e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="h-11 border-slate-200 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.open('https://meet.google.com/new', '_blank')}
                        className="shrink-0 h-11"
                      >
                        <Video className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">New Meet</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Display */}
              {status.status === 'error' && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{status.message}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100 ">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.push('/hr/jobs')}
                  disabled={isSubmitting}
                  className="px-8"
                >
                  Cancel
                </Button>
                <div className="flex gap-4">
                  <JobPreviewSheet 
                    formData={formData} 
                    workType={workType} 
                    customWorkType={customWorkType} 
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isUploadingPoster}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-12 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Job...
                      </>
                    ) : (
                      'Publish Job Posting'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-4xl w-full bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Job Published Successfully</DialogTitle>
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700 px-12 py-16 flex flex-col items-center justify-center text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute bottom-[-40px] left-[-40px] w-36 h-36 rounded-full bg-white/10" />
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center mb-8 ring-4 ring-white/30 shadow-2xl relative z-10">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-5xl font-extrabold text-center tracking-tight relative z-10">Published! 🎉</h2>
            <p className="text-indigo-100 text-center mt-4 text-xl leading-relaxed max-w-md relative z-10">Your job posting is now live and ready for applicants to apply.</p>
          </div>

          <div className="p-10 sm:p-12 space-y-8">
            <div className="space-y-7">
              {/* Share Link */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-slate-700">🔗 Public Apply Link</h4>
                  {copiedLink && <span className="text-sm font-bold text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Copied!</span>}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 overflow-hidden rounded-xl bg-slate-50 border-2 border-slate-200 px-5 py-4 text-sm font-mono text-slate-700 truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/apply/${createdJobInfo?.jobId}` : ''}
                  </div>
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-xl border-2 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 gap-2 font-semibold text-slate-700 shrink-0"
                    onClick={() => copyToClipboard(`${window.location.origin}/apply/${createdJobInfo?.jobId}`, 'link')}
                  >
                    <Copy className="h-5 w-5" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Application Email */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-slate-700">📧 Application Email</h4>
                  {copiedEmail && <span className="text-sm font-bold text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Copied!</span>}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 overflow-hidden rounded-xl bg-slate-50 border-2 border-slate-200 px-5 py-4 text-sm font-mono text-slate-700 truncate">
                    {APPLICATION_INBOX_EMAIL}
                  </div>
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-xl border-2 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 gap-2 font-semibold text-slate-700 shrink-0"
                    onClick={() => copyToClipboard(APPLICATION_INBOX_EMAIL, 'email')}
                  >
                    <Copy className="h-5 w-5" />
                    Copy
                  </Button>
                </div>
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mt-1">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-600">
                    Candidates should use subject: <strong className="text-slate-800">{createdJobInfo?.jobTitle} - {createdJobInfo?.companyName}</strong>
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                router.push('/hr/jobs')
              }}
              className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white h-14 rounded-xl text-base font-semibold shadow-lg mt-2"
            >
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
