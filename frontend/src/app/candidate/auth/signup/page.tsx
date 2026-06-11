'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

const candidateSignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type CandidateSignUpData = z.infer<typeof candidateSignUpSchema>

function CandidateSignUpForm() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [step, setStep] = useState(2) // Start at credentials
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CandidateSignUpData>({
    resolver: zodResolver(candidateSignUpSchema),
  })

  const onSubmit = async (data: CandidateSignUpData) => {
    if (!executeRecaptcha) {
      setError('Recaptcha not yet available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = await executeRecaptcha('signup_candidate')
      if (!token) throw new Error('Failed to obtain recaptcha token')

      const result = await signUp(
        data.name,
        data.email,
        data.password,
        'candidate',
        'Individual',
        data.email,
        data.email,
        data.email,
        token
      )
      
      if (result.error) {
        setError(result.error.message)
        setIsLoading(false)
        return
      }

      if (result.needsEmailVerification && result.email) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(result.email)}`)
        return
      }
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-start pt-8 pb-12 px-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="self-start px-4 py-2 bg-white text-slate-700 rounded-full flex items-center gap-2 hover:bg-slate-50 transition-colors font-figtree text-sm border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="mb-6 text-center">
              <h1 className="headline-platform text-2xl sm:text-3xl mb-2 !font-semibold text-blue-600">Candidate Signup</h1>
              <p className="text-slate-600 font-figtree text-sm">
                Unlock your career potential with AI-driven insights
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              {[2, 4].map((stepNum, idx) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  {idx === 0 && <div className={`w-12 h-0.5 ${step > stepNum ? 'bg-blue-600' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="headline-platform text-xl !font-semibold mb-2">Create Account</h2>
                  <p className="text-gray-600 font-figtree text-sm">Join thousands of job seekers</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-figtree">Full Name *</label>
                  <input type="text" {...form.register('name')} placeholder="Enter your full name" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-figtree text-sm" />
                  {form.formState.errors.name && <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-figtree">Email Address *</label>
                  <input type="email" {...form.register('email')} placeholder="Email Address" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-figtree text-sm" />
                  {form.formState.errors.email && <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-figtree">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} {...form.register('password')} placeholder="Password" className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-figtree text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                  {form.formState.errors.password && <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-figtree">Confirm Password *</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} {...form.register('confirmPassword')} placeholder="Confirm Password" className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-figtree text-sm" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (await form.trigger(['name', 'email', 'password', 'confirmPassword'])) setStep(4)
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors font-figtree"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="headline-platform text-xl !font-semibold mb-2 text-slate-900">Confirm Your Account</h2>
                  <p className="text-slate-600 font-figtree text-sm">Review your details</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100 font-figtree text-sm">
                  <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500">Name</span>
                    <span className="font-semibold text-slate-900">{form.watch('name')}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500">Email</span>
                    <span className="font-semibold text-slate-900">{form.watch('email')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Account Type</span>
                    <span className="font-bold text-blue-600">Job Seeker</span>
                  </div>
                </div>

                {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors">Back</button>
                  <button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20">
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500 font-figtree">
                    Do you have an account? <Link href="/auth/signin" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CandidateSignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <CandidateSignUpForm />
    </Suspense>
  )
}
