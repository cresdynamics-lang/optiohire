'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { Plus, X, Building2, Users, Calendar, Link as LinkIcon } from 'lucide-react'
import { JobPostingFormData } from '@/types'
import { DateTimePicker } from '@/components/ui/date-time-picker'

const companySetupSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_email: z.string().email('Please enter a valid email address'),
  hr_email: z.string().email('Please enter a valid HR email address'),
  job_title: z.string().min(1, 'Job title is required'),
  job_description: z.string().min(10, 'Job description must be at least 10 characters'),
  required_skills: z.array(z.string()).min(1, 'At least one skill is required'),
  deadline_for_applications: z.string().min(1, 'Application deadline is required').refine((val) => {
    if (!val) return false
    // Check if it's a valid datetime-local format (YYYY-MM-DDTHH:mm)
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
    if (!datetimeRegex.test(val)) return false
    const date = new Date(val)
    return !isNaN(date.getTime()) && date > new Date()
  }, {
    message: 'Application deadline must be a valid future date and time'
  }),
  interview_date: z.string().min(1, 'Interview date is required').refine((val) => {
    if (!val) return false
    // Check if it's a valid datetime-local format (YYYY-MM-DDTHH:mm)
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
    if (!datetimeRegex.test(val)) return false
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, {
    message: 'Please enter a valid date and time'
  }),
  interview_meeting_link: z.string().optional(),
  google_calendar_link: z.string().url('Please enter a valid Google Calendar link'),
})

type CompanySetupFormData = z.infer<typeof companySetupSchema>

export default function CompanySetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [skillInput, setSkillInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanySetupFormData>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      required_skills: [],
    },
  })

  const skills = watch('required_skills') || []

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue('required_skills', [...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setValue('required_skills', skills.filter(skill => skill !== skillToRemove))
  }

  const onSubmit = async (data: CompanySetupFormData) => {
    // Check if user is logged in (token exists)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token && !user) {
      setError('You must be logged in to continue. Please sign in first.')
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create company via backend
      const companyResp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: data.company_name,
          company_domain: data.company_email.split('@')[1] || 'example.com',
          hr_email: data.hr_email,
          hiring_manager_email: data.company_email
        })
      })
      const companyJson = await companyResp.json().catch(() => ({}))
      if (!companyResp.ok || !companyJson?.company_id) {
        throw new Error(companyJson?.error || 'Failed to create company')
      }

      // Create job via backend
      const jobResp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyJson.company_id,
          job_title: data.job_title,
          job_description: data.job_description,
          responsibilities: data.job_description,
          skills_required: data.required_skills,
          application_deadline: data.deadline_for_applications,
          interview_slots: null,
          interview_meeting_link: data.interview_meeting_link || null,
          google_calendar_link: data.google_calendar_link
        })
      })
      const jobJson = await jobResp.json().catch(() => ({}))
      if (!jobResp.ok || !jobJson?.job_posting_id) {
        throw new Error(jobJson?.error || 'Failed to create job posting')
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      const errorMessage = err?.message || err?.error || 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      console.error('Company setup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-32 md:pt-40 pb-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-figtree font-extralight mb-4 text-white drop-shadow-lg">
              Company Setup
            </h1>
            <p className="text-xl font-figtree font-light text-gray-300">
              Tell us about your company and the position you're hiring for
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl font-figtree font-semibold">
                Company & Job Details
              </CardTitle>
              <CardDescription className="text-base font-figtree font-light">
                Fill in the details below to get started with AI-powered recruitment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Company Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-white" />
                    <h3 className="text-xl font-figtree font-semibold">Company Information</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="text-sm font-medium">
                        Company Name *
                      </Label>
                      <Input
                        id="company_name"
                        placeholder="Enter your company name"
                        {...register('company_name')}
                        className="h-12"
                      />
                      {errors.company_name && (
                        <p className="text-sm text-red-500">{errors.company_name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_email" className="text-sm font-medium">
                        Company Email *
                      </Label>
                      <Input
                        id="company_email"
                        type="email"
                        placeholder="company@example.com"
                        {...register('company_email')}
                        className="h-12"
                      />
                      {errors.company_email && (
                        <p className="text-sm text-red-500">{errors.company_email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hr_email" className="text-sm font-medium">
                      HR Email Address *
                    </Label>
                    <Input
                      id="hr_email"
                      type="email"
                      placeholder="hr@example.com"
                      {...register('hr_email')}
                      className="h-12"
                    />
                    {errors.hr_email && (
                      <p className="text-sm text-red-500">{errors.hr_email.message}</p>
                    )}
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-white" />
                    <h3 className="text-xl font-figtree font-semibold">Job Information</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job_title" className="text-sm font-medium">
                      Job Title *
                    </Label>
                    <Input
                      id="job_title"
                      placeholder="e.g., Senior Frontend Developer"
                      {...register('job_title')}
                      className="h-12"
                    />
                    {errors.job_title && (
                      <p className="text-sm text-red-500">{errors.job_title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_description" className="text-sm font-medium">
                      Job Description *
                    </Label>
                    <Textarea
                      id="job_description"
                      placeholder="Describe the role, responsibilities, and requirements..."
                      {...register('job_description')}
                      className="min-h-[120px]"
                    />
                    {errors.job_description && (
                      <p className="text-sm text-red-500">{errors.job_description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Required Skills *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a required skill"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="h-12"
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                            {skill}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                    {errors.required_skills && (
                      <p className="text-sm text-red-500">{errors.required_skills.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline_for_applications" className="text-sm font-medium">
                      Deadline for Applications *
                    </Label>
                    <DateTimePicker
                      value={watch('deadline_for_applications')}
                      onChange={(value) => setValue('deadline_for_applications', value)}
                      placeholder="Select application deadline and time"
                      minDateTime={new Date().toISOString().slice(0, 16)}
                    />
                    {errors.deadline_for_applications && (
                      <p className="text-sm text-red-500">{errors.deadline_for_applications.message}</p>
                    )}
                  </div>
                </div>

                {/* Interview Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-white" />
                    <h3 className="text-xl font-figtree font-semibold">Interview Information</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interview_date" className="text-sm font-medium">
                      Interview Date & Time *
                    </Label>
                    <DateTimePicker
                      value={watch('interview_date')}
                      onChange={(value) => setValue('interview_date', value)}
                      placeholder="Select interview date and time"
                      minDateTime={new Date().toISOString().slice(0, 16)}
                    />
                    {errors.interview_date && (
                      <p className="text-sm text-red-500">{errors.interview_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interview_meeting_link" className="text-sm font-medium">
                      Interview Meeting Link (Optional)
                    </Label>
                    <Input
                      id="interview_meeting_link"
                      type="url"
                      placeholder="https://meet.google.com/..."
                      {...register('interview_meeting_link')}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google_calendar_link" className="text-sm font-medium">
                      Google Calendar Link *
                    </Label>
                    <Input
                      id="google_calendar_link"
                      type="url"
                      placeholder="https://calendar.google.com/..."
                      {...register('google_calendar_link')}
                      className="h-12"
                    />
                    {errors.google_calendar_link && (
                      <p className="text-sm text-red-500">{errors.google_calendar_link.message}</p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#2D2DDD' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Setting Up...' : 'Complete Setup & Start Hiring'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
