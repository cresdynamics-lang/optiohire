'use client'

import { useState, useEffect } from 'react'
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
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type CompanySetupFormData = z.infer<typeof companySetupSchema>

export default function CompanySetupPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If user already has a company, redirect to dashboard
  useEffect(() => {
    const normalizedCompanyRole = user?.companyRole?.toLowerCase()
    const normalizedRole = user?.role?.toLowerCase()
    const isJobSeeker =
      normalizedCompanyRole === 'candidate' ||
      normalizedCompanyRole === 'job_seeker' ||
      normalizedCompanyRole === 'jobseeker' ||
      normalizedRole === 'candidate' ||
      normalizedRole === 'job_seeker' ||
      normalizedRole === 'jobseeker'

    if (isJobSeeker) {
      router.replace('/candidate')
      return
    }

    if (user?.hasCompany && user?.companyId) {
      router.replace('/hr')
    }
  }, [user?.companyRole, user?.role, user?.hasCompany, user?.companyId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2D2DDD] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanySetupFormData>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
    },
  })



  const onSubmit = async (data: CompanySetupFormData) => {
    // Check if user is logged in (token exists)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token && !user) {
      setError('You must be logged in to continue. Please sign in first.')
      router.push('/auth/options?mode=signin')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      // Create company via backend (link to current user when token present)
      const companyResp = await fetch('/api/companies', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          company_name: data.company_name,
          company_domain: data.company_email.split('@')[1] || 'example.com',
          company_email: data.company_email,
          hr_email: data.hr_email,
          hiring_manager_email: data.company_email,
          website_url: data.website_url || null,
          linkedin_url: data.linkedin_url || null,
          twitter_url: data.twitter_url || null
        })
      })
      const companyJson = await companyResp.json().catch(() => ({}))
      if (!companyResp.ok || !companyJson?.company_id) {
        throw new Error(companyJson?.error || 'Failed to create company')
      }

      // Success - redirect to dashboard
      router.push('/hr')
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
            <h1 className="headline-platform-dark text-5xl sm:text-6xl md:text-7xl mb-4 !font-extralight drop-shadow-lg">
              Company Setup
            </h1>
            <p className="text-xl font-figtree font-light text-gray-300">
              Tell us about your company to complete your account setup
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl font-figtree font-semibold">
                Company Details
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

                  <div className="flex items-center gap-2 mb-4 mt-6">
                    <LinkIcon className="w-5 h-5 text-white" />
                    <h3 className="text-xl font-figtree font-semibold">Online Channels (Optional)</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="website_url" className="text-sm font-medium">
                        Website
                      </Label>
                      <Input
                        id="website_url"
                        placeholder="https://company.com"
                        {...register('website_url')}
                        className="h-12"
                      />
                      {errors.website_url && (
                        <p className="text-sm text-red-500">{errors.website_url.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url" className="text-sm font-medium">
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin_url"
                        placeholder="https://linkedin.com/company/..."
                        {...register('linkedin_url')}
                        className="h-12"
                      />
                      {errors.linkedin_url && (
                        <p className="text-sm text-red-500">{errors.linkedin_url.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter_url" className="text-sm font-medium">
                        Twitter / X
                      </Label>
                      <Input
                        id="twitter_url"
                        placeholder="https://twitter.com/..."
                        {...register('twitter_url')}
                        className="h-12"
                      />
                      {errors.twitter_url && (
                        <p className="text-sm text-red-500">{errors.twitter_url.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-white text-black hover:bg-gray-100 font-figtree font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Setting up...
                      </span>
                    ) : (
                      'Complete Setup & View Dashboard'
                    )}
                  </Button>
                </div></form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
