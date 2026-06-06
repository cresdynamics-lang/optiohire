'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { uploadPublicResume, submitApplication } from '@/lib/public-api'
import { Loader2, CheckCircle2, AlertCircle, FileText, UploadCloud } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useRef } from 'react'

const formSchema = z.object({
  candidate_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  cover_letter: z.string().optional(),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

interface ApplyFormProps {
  jobPostingId: string
}

export function ApplyForm({ jobPostingId }: ApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()
  const { executeRecaptcha } = useGoogleReCaptcha()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidate_name: '',
      email: '',
      phone: '',
      cover_letter: '',
      github_url: '',
      linkedin_url: '',
      portfolio_url: '',
    },
  })

  const validateAndSetFile = (file: File) => {
    setResumeUploadError(null)
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    if (!allowedTypes.includes(file.type)) {
      setResumeUploadError('Only PDF and Word documents are allowed.')
      setResumeFile(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setResumeUploadError('File size must be less than 10MB.')
      setResumeFile(null)
      return
    }
    setResumeFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!resumeFile) {
      setResumeUploadError('Please upload your resume.')
      return
    }

    if (!executeRecaptcha) {
      setError('Recaptcha not yet available')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = await executeRecaptcha('public_apply')
      if (!token) {
        throw new Error('Failed to obtain recaptcha token')
      }

      // 1. Upload Resume - pass the token
      const uploadResult = await uploadPublicResume(resumeFile, token)
      
      // 2. Submit Application
      await submitApplication({
        job_posting_id: jobPostingId,
        candidate_name: values.candidate_name,
        email: values.email,
        resume_url: uploadResult.url,
        cover_letter: values.cover_letter,
        phone: values.phone,
        github_url: values.github_url || undefined,
        linkedin_url: values.linkedin_url || undefined,
        portfolio_url: values.portfolio_url || undefined,
        captchaToken: token,
      })

      setIsSuccess(true)
      toast({
        title: "Application Submitted",
        description: "Your application was sent successfully. We'll be in touch!",
        variant: "success",
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong. Please try again.'
      setError(errorMessage)
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Application Sent!</h3>
        <p className="text-slate-600 mb-6">
          Thank you for applying. We've received your application and will be in touch soon.
        </p>
        <Button asChild variant="outline" className="w-full">
          <a href="/jobs">Back to Jobs</a>
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="candidate_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="github_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Profile (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="portfolio_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio Website (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://yourportfolio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Resume (PDF or Word)</FormLabel>
          <div 
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              isDragging ? 'border-indigo-500 bg-indigo-100' : 
              resumeFile ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="flex flex-col items-center justify-center cursor-pointer">
              {resumeFile ? (
                <div className="flex items-center text-indigo-700">
                  <FileText className="w-8 h-8 mr-2" />
                  <span className="text-sm font-medium truncate max-w-[200px]">{resumeFile.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span className="text-xs">{isDragging ? 'Drop it here!' : 'Click to upload or drag & drop'}</span>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
            </label>
          </div>
          {resumeUploadError && (
            <p className="text-[0.8rem] font-medium text-destructive">{resumeUploadError}</p>
          )}
        </div>

        <FormField
          control={form.control}
          name="cover_letter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us why you're a great fit..." 
                  className="min-h-[120px] resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
        <p className="text-[10px] text-center text-slate-400 mt-4">
          By submitting, you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </Form>
  )
}
