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
  Check
} from 'lucide-react'
import { JobPostingFormData } from '@/types'
import { SingleDateTimePicker } from '@/components/ui/single-date-time-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

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

  const addSkill = () => {
    if (newSkill.trim() && !formData.required_skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, newSkill.trim()]
      }))
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
          job_description: formData.job_description,
          required_skills: formData.required_skills,
          application_deadline: formData.application_deadline,
          meeting_link: formData.interview_meeting_link || undefined
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
        throw new Error(data.error?.message || data.error || 'Failed to create job posting')
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
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/jobs')} className="rounded-full">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 dark:bg-slate-800/50 dark:border-slate-800">
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
                  <Label htmlFor="job_description" className="text-sm font-semibold flex justify-between">
                    Job Description 
                    <span className="text-slate-400 font-normal text-xs">(min 50 characters)</span>
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
                      placeholder="Add a skill (e.g., React, Python)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="h-11 border-slate-200"
                    />
                    <Button type="button" onClick={addSkill} className="bg-slate-900 text-white hover:bg-slate-800 px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 min-h-[40px] p-4 bg-slate-50 rounded-xl dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
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
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-100 dark:border-slate-800">
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
              <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard/jobs')}
                  disabled={isSubmitting}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
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
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-indigo-600 p-12 flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-center">Published!</h2>
            <p className="text-indigo-100 text-center mt-2">Your job posting is now live and ready for applicants.</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-6">
              {/* Share Link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Public Apply Link</h4>
                  {copiedLink && <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Copied!</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-mono text-slate-600">
                    {typeof window !== 'undefined' ? `${window.location.origin}/apply/${createdJobInfo?.jobId}` : ''}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-11 w-11 rounded-xl shrink-0 border-slate-200 hover:bg-slate-50"
                    onClick={() => copyToClipboard(`${window.location.origin}/apply/${createdJobInfo?.jobId}`, 'link')}
                  >
                    <Copy className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
              </div>

              {/* Application Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Application Email</h4>
                  {copiedEmail && <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Copied!</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 truncate rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-mono text-slate-600">
                    {APPLICATION_INBOX_EMAIL}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-11 w-11 rounded-xl shrink-0 border-slate-200 hover:bg-slate-50"
                    onClick={() => copyToClipboard(APPLICATION_INBOX_EMAIL, 'email')}
                  >
                    <Copy className="h-4 w-4 text-slate-600" />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Candidates should use subject: <strong>{createdJobInfo?.jobTitle} - {createdJobInfo?.companyName}</strong>
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                router.push('/dashboard/jobs')
              }}
              className="w-full bg-slate-900 text-white h-12 rounded-xl mt-4"            >
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
