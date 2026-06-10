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
  ExternalLink
} from 'lucide-react'
import { JobPosting } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { SingleDateTimePicker } from '@/components/ui/single-date-time-picker'

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

  const addSkill = () => {
    if (newSkill.trim() && !formData.required_skills?.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...(prev.required_skills || []), newSkill.trim()]
      }))
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
      
      // Currently, the frontend uses Supabase for direct updates in some places, 
      // but let's try to use the API or fallback to Supabase if needed.
      // Based on jobs-section.tsx, handleSaveJob uses Supabase.
      
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('job_postings')
        .update({
          job_title: formData.job_title,
          job_description: formData.job_description,
          required_skills: formData.required_skills,
          interview_meeting_link: formData.interview_meeting_link,
          meeting_link: formData.interview_meeting_link,
          application_deadline: formData.application_deadline,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)

      if (error) throw error

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
                  <Briefcase className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">Role Information</h3>
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
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
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
