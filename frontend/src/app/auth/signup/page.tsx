'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, ArrowLeft, AlertCircle, Shield, User } from 'lucide-react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

type UserRole = 'employer' | 'candidate' | null

const employerSignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  company_role: z.enum(['hr', 'hiring_manager']),
  organization_name: z.string().min(2, 'Organization name is required'),
  company_email: z.string().email('Please enter a valid company email'),
  hr_email: z.string().email('Please enter a valid HR email'),
  hiring_manager_email: z.string().email('Please enter a valid hiring manager email'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

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

type EmployerSignUpData = z.infer<typeof employerSignUpSchema>
type CandidateSignUpData = z.infer<typeof candidateSignUpSchema>

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useAuth()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [step, setStep] = useState(1) // 1: role select, 2: credentials, 3: details, 4: confirm
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle pre-selected role from query params
  useEffect(() => {
    const role = searchParams.get('role')
    if (role === 'candidate' || role === 'job-seeker') {
      setUserRole('candidate')
      setStep(2)
    } else if (role === 'employer') {
      setUserRole('employer')
      setStep(2)
    }
  }, [searchParams])

  const employerForm = useForm<EmployerSignUpData>({
    resolver: zodResolver(employerSignUpSchema),
  })

  const candidateForm = useForm<CandidateSignUpData>({
    resolver: zodResolver(candidateSignUpSchema),
  })

  const onEmployerSubmit = async (data: EmployerSignUpData) => {
    if (!executeRecaptcha) {
      setError('Recaptcha not yet available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = await executeRecaptcha('signup_employer')
      if (!token) {
        throw new Error('Failed to obtain recaptcha token')
      }

      const result = await signUp(
        data.name,
        data.email,
        data.password,
        data.company_role,
        data.organization_name,
        data.company_email,
        data.hr_email,
        data.hiring_manager_email,
        token
      )
      const { error, needsEmailVerification, email } = result

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      if (needsEmailVerification && email) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const onCandidateSubmit = async (data: CandidateSignUpData) => {
    if (!executeRecaptcha) {
      setError('Recaptcha not yet available')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = await executeRecaptcha('signup_candidate')
      if (!token) {
        throw new Error('Failed to obtain recaptcha token')
      }

      const result = await signUp(
        data.name,
        data.email,
        data.password,
        'candidate', // role for candidates
        'Individual', // default organization for candidates
        data.email, // use personal email as company email
        data.email, // use personal email as hr email
        data.email, // use personal email as hiring manager email
        token
      )
      const { error, needsEmailVerification, email } = result

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      if (needsEmailVerification && email) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        return
      }
      router.push('/dashboard/candidate')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role)
    setStep(2)
    setError(null)
  }

  const handleAdminSelect = () => {
    router.push('/admin/login')
  }

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 4))
    setError(null)
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
    setError(null)
  }

  const handleEmployerSubmit = employerForm.handleSubmit(onEmployerSubmit)
  const handleCandidateSubmit = candidateForm.handleSubmit(onCandidateSubmit)

  const handleStepTwoNext = async () => {
    setError(null)

    if (userRole === 'employer') {
      const isValid = await employerForm.trigger(['name', 'email', 'password', 'confirmPassword'])
      if (!isValid) return
    } else if (userRole === 'candidate') {
      const isValid = await candidateForm.trigger(['name', 'email', 'password', 'confirmPassword'])
      if (!isValid) return
    } else {
      return
    }

    nextStep()
  }

  const registerField = (name: any): any => {
    if (userRole === 'candidate') {
      return candidateForm.register(name)
    }
    return employerForm.register(name)
  }

  const currentErrors = userRole === 'candidate' ? (candidateForm.formState.errors as any) : (employerForm.formState.errors as any)

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
            <div className="mb-6">
              <h1 className="headline-platform text-2xl sm:text-3xl mb-2 !font-semibold">Create an Account</h1>
              <p className="text-slate-600 font-figtree text-sm">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:text-blue-700 font-medium">
                Log in
              </Link>
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNum
                        ? 'bg-primary text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div
                      className={`w-8 h-0.5 ${
                        step > stepNum ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="headline-platform text-xl !font-semibold mb-2">What brings you here?</h2>
                  <p className="text-gray-600 font-figtree text-sm">Select your account type to get started</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => handleRoleSelect('candidate')}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="headline-platform !font-semibold">I'm a Job Seeker</h3>
                        <p className="text-sm text-gray-600 font-figtree">Create your profile and apply for jobs</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('employer')}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="headline-platform !font-semibold">I'm an Employer</h3>
                        <p className="text-sm text-gray-600 font-figtree">Post jobs and find candidates</p>
                      </div>
                    </div>
                  </button>

                  {/* <button
                    type="button"
                    onClick={handleAdminSelect}
                    className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="headline-platform !font-semibold">I'm an Admin</h3>
                        <p className="text-sm text-gray-600 font-figtree">Manage the platform and users</p>
                      </div>
                    </div>
                  </button> */}
                </div>
              </div>
            )}

            {/* Step 2: Credentials */}
            {step === 2 && (
              <form className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="headline-platform text-xl !font-semibold mb-2">Account Details</h2>
                  <p className="text-gray-600 font-figtree text-sm">Create your login credentials</p>
                </div>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    {...registerField('name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                    required
                  />
                  {currentErrors.name && (
                    <p className="text-sm text-red-500 mt-1 font-figtree">
                      {currentErrors.name?.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email Address"
                    {...registerField('email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                    required
                  />
                  {currentErrors.email && (
                    <p className="text-sm text-red-500 mt-1 font-figtree">
                      {currentErrors.email?.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="Password"
                      {...registerField('password')}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {currentErrors.password && (
                    <p className="text-sm text-red-500 mt-1 font-figtree">
                      {currentErrors.password?.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 font-figtree">
                    Password must contain: uppercase, lowercase, number, special character, and be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      {...registerField('confirmPassword')}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {currentErrors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1 font-figtree">
                      {currentErrors.confirmPassword?.message}
                    </p>
                  )}
                </div>

                <div className="sticky bottom-0 bg-white pt-3 pb-1 flex gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors font-figtree"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStepTwoNext}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors font-figtree"
                  >
                    Continue
                  </button>
                </div>

              </form>
            )}

            {/* Step 3: Employer Details */}
            {step === 3 && userRole === 'employer' && (
              <form onSubmit={handleEmployerSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="headline-platform text-xl !font-semibold mb-2">Company Information</h2>
                  <p className="text-gray-600 font-figtree text-sm">Tell us about your organization</p>
                </div>

                {/* Company Role Field */}
              <div className="mb-4">
                <label htmlFor="company_role" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                  Your Role in Company <span className="text-red-500">*</span>
                </label>
                <select
                  id="company_role"
                  {...employerForm.register('company_role')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 text-sm"
                  required
                >
                  <option value="">Select your role</option>
                  <option value="hr">HR Manager</option>
                  <option value="hiring_manager">Hiring Manager</option>
                </select>
                {employerForm.formState.errors.company_role && (
                  <p className="text-sm text-red-500 mt-1 font-figtree">{employerForm.formState.errors.company_role.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 font-figtree">
                  Select your role in the company
                </p>
              </div>
              
              {/* Organization Name Field */}
              <div className="mb-4">
                <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="organization_name"
                  placeholder="Enter your organization name"
                  {...employerForm.register('organization_name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                  required
                />
                {employerForm.formState.errors.organization_name && (
                  <p className="text-sm text-red-500 mt-1 font-figtree">{employerForm.formState.errors.organization_name.message}</p>
                )}
              </div>

              {/* Company Email Field */}
              <div className="mb-4">
                <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                  Company Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="company_email"
                  placeholder="jobs@yourcompany.com"
                  {...employerForm.register('company_email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                  required
                />
                {employerForm.formState.errors.company_email && (
                  <p className="text-sm text-red-500 mt-1 font-figtree">{employerForm.formState.errors.company_email.message}</p>
                )}
              </div>

              {/* HR Email Field */}
              <div className="mb-4">
                <label htmlFor="hr_email" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                  HR Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="hr_email"
                  placeholder="hr@yourcompany.com"
                  {...employerForm.register('hr_email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                  required
                />
                {employerForm.formState.errors.hr_email && (
                  <p className="text-sm text-red-500 mt-1 font-figtree">{employerForm.formState.errors.hr_email.message}</p>
                )}
              </div>

              {/* Hiring Manager Email Field */}
              <div>
                <label htmlFor="hiring_manager_email" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                  Hiring Manager Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="hiring_manager_email"
                  placeholder="hiring.manager@example.com"
                  {...employerForm.register('hiring_manager_email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                  required
                />
                {employerForm.formState.errors.hiring_manager_email && (
                  <p className="text-sm text-red-500 mt-1 font-figtree">{employerForm.formState.errors.hiring_manager_email.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1 font-figtree">
                  Email address of the hiring manager
                </p>
              </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors font-figtree"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await employerForm.trigger([
                        'company_role',
                        'organization_name',
                        'company_email',
                        'hr_email',
                        'hiring_manager_email',
                      ])
                      if (ok) nextStep()
                    }}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors font-figtree"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Candidate Details (simpler) */}
            {step === 3 && userRole === 'candidate' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="headline-platform text-xl !font-semibold mb-2">Almost Done!</h2>
                  <p className="text-gray-600 font-figtree text-sm">Review your information and create your account</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 font-figtree">
                    You're all set! Click "Continue" to review your registration as a job seeker.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors font-figtree"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors font-figtree"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="headline-platform text-xl !font-semibold mb-2">Confirm Your Account</h2>
                  <p className="text-gray-600 font-figtree text-sm">Review your details and create your account</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  {userRole === 'employer' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Name:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">{employerForm.watch('name')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Email:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">{employerForm.watch('email')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Role:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">
                          {employerForm.watch('company_role') === 'hr' ? 'HR Manager' : 'Hiring Manager'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Organization:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">{employerForm.watch('organization_name')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Company Email:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">{employerForm.watch('company_email')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">HR Email:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">{employerForm.watch('hr_email')}</span>
                      </div>
                    </>
                  )}
                  {userRole === 'candidate' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Name:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">{candidateForm.watch('name')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Email:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">{candidateForm.watch('email')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 font-figtree">Account Type:</span>
                        <span className="text-sm font-medium text-gray-900 font-figtree">Job Seeker</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-figtree">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors font-figtree"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    onClick={userRole === 'candidate' ? handleCandidateSubmit : handleEmployerSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-figtree"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
