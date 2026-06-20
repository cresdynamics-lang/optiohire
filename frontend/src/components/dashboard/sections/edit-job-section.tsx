'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Clock, 
  Video, 
  ChevronLeft, 
  Loader2, 
  Save, 
  AlertCircle,
  Briefcase,
  ExternalLink,
  CheckCircle,
  ImagePlus,
  Users
} from 'lucide-react'
import { JobPosting } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { SingleDateTimePicker } from '@/components/ui/single-date-time-picker'
import { ScreeningQuestionsBuilder } from '../screening-questions-builder'

export function EditJobSection() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const jobId = params?.id as string

  const [job, setJob] = useState<JobPosting | null>(null)
  const [formData, setFormData] = useState<Partial<JobPosting>>({})
  const [newSkill, setNewSkill] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState<{status: 'idle' | 'success' | 'error', message?: string}>({ status: 'idle' })

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId || !user) return

      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/job-postings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })

        if (!response.ok) throw new Error('Failed to fetch jobs')
        
        const data = await response.json()
        const foundJob = data.jobs?.find((j: any) => String(j.id) === String(jobId))

        if (!foundJob) {
          setError('Job posting not found')
          return
        }

        setJob(foundJob)
        setFormData({
          job_title: foundJob.job_title,
          job_description: foundJob.job_description,
          required_skills: Array.isArray(foundJob.required_skills) ? foundJob.required_skills : [],
          interview_meeting_link: foundJob.interview_meeting_link || foundJob.meeting_link,
          application_deadline: foundJob.application_deadline,
          status: foundJob.status,
          custom_questions: foundJob.custom_questions || [],
          job_poster_url: foundJob.job_poster_url || '',
        })
      } catch (err: any) {
        console.error('Error fetching job:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId, user])

  const handleInputChange = (field: keyof JobPosting, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    setPosterFile(file)
    setIsUploadingPoster(true)
    setUploadProgress(0)
    
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('poster', file)
      
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
      xhr.send(formDataUpload)
      
    } catch (err: any) {
      setStatus({ status: 'error', message: err.message || 'Error uploading poster' })
      setPosterFile(null)
      setIsUploadingPoster(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = formData.required_skills || [];
      const skillsToAdd = newSkill
        .split(/[,\n]+/)
        .map(s => s.replace(/^\d+\.\s*/, '').trim())
        .filter(s => s.length > 0 && !currentSkills.includes(s))

      if (skillsToAdd.length > 0) {
        setFormData(prev => ({
          ...prev,
          required_skills: [...(prev.required_skills || []), ...skillsToAdd]
        }))
      }
      setNewSkill('')
    }
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
          required_skills: [...(prev.required_skills || []), ...skillsToAdd]
        }))
      }
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills?.filter(skill => skill !== skillToRemove) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobId) return

    try {
      setIsSaving(true)
      const token = localStorage.getItem('token')
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com'
      const resp = await fetch(`${backendUrl}/api/job-postings/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_title: formData.job_title,
          job_description: formData.job_description,
          required_skills: formData.required_skills,
          interview_meeting_link: formData.interview_meeting_link,
          meeting_link: formData.interview_meeting_link,
          application_deadline: formData.application_deadline,
          status: formData.status,
          custom_questions: formData.custom_questions,
          job_poster_url: formData.job_poster_url
        })
      })

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to update job posting')
      }

      toast({
        title: "Success",
        description: "Job posting updated successfully",
        variant: "success"
      })
      
      router.push('/hr/jobs')
    } catch (err: any) {
      console.error('Error updating job:', err)
      toast({
        title: "Error",
        description: err.message || "Failed to update job posting",
        variant: "error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-600 mb-6">{error || 'Job not found'}</p>
          <Button onClick={() => router.push('/hr/jobs')} variant="outline">
            Back to Jobs
          </Button>
        </div>
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
        <Card className="border border-slate-200 bg-white shadow-sm   overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 /50 ">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold font-figtree">Edit Job Posting</CardTitle>
                <p className="text-slate-500 mt-1">Update the details for your listing at {job.company_name}.</p>
              </div>
              <Badge variant={formData.status === 'active' ? 'active' : 'secondary'} className="uppercase px-3 py-1">
                {formData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Role Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Users className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Role Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_poster_url" className="text-sm font-semibold">Job Poster (Optional)</Label>
                  <p className="text-xs text-slate-500 mb-2">Upload a custom image to be shown when sharing the job on social media.</p>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-4">
                      <Label 
                        htmlFor="poster_upload" 
                        className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 h-10 px-4 py-2 ${isUploadingPoster ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {isUploadingPoster ? (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                          ) : (
                            <ImagePlus className="h-4 w-4 text-slate-500" />
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
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 max-w-xs overflow-hidden">
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
                
                <div className="space-y-2">
                  <Label htmlFor="job_title" className="text-sm font-semibold">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title || ''}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="h-12 text-lg font-medium border-slate-200"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job_description" className="text-sm font-semibold">Job Description</Label>
                  <Textarea
                    id="job_description"
                    value={formData.job_description || ''}
                    onChange={(e) => handleInputChange('job_description', e.target.value)}
                    rows={8}
                    className="border-slate-200 leading-relaxed resize-none"
                    required
                  />
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
                    <Button type="button" onClick={addSkill} variant="outline" className="border-slate-900 bg-slate-900 text-white px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    {formData.required_skills?.map((skill, index) => (
                      <Badge
                        key={`skill-${index}`}
                        variant="secondary"
                        className="px-3 py-1.5 flex items-center gap-2 bg-white text-indigo-700 border-slate-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="rounded-full hover:bg-indigo-100 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold">Listing Status</Label>
                  <select
                    id="status"
                    value={formData.status || 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50  dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Clock className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Application Deadline</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application_deadline" className="text-sm font-semibold">Deadline Date & Time</Label>
                    <SingleDateTimePicker
                      value={formData.application_deadline || ''}
                      onChange={(value) => handleInputChange('application_deadline', value)}
                      placeholder="Select deadline"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Video className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-wider text-xs">Interview Settings</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interview_meeting_link" className="text-sm font-semibold">Meeting Link (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="interview_meeting_link"
                        value={formData.interview_meeting_link || ''}
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

              {/* Screening Questions */}
              <div className="pt-4 border-t border-slate-100">
                <ScreeningQuestionsBuilder 
                  questions={formData.custom_questions || []}
                  onChange={(questions) => handleInputChange('custom_questions', questions)}
                  jobTitle={formData.job_title || ''}
                  jobDescription={formData.job_description || ''}
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.push('/hr/jobs')}
                  disabled={isSaving}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-10 h-12 rounded-xl shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
