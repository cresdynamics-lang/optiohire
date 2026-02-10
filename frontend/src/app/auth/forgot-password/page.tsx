'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, CheckCircle, KeyRound } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const verifyCodeSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const emailForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const codeForm = useForm<VerifyCodeFormData>({
    resolver: zodResolver(verifyCodeSchema),
  })

  const onSubmitEmail = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to send reset code. Please try again.'
        try {
          const result = await response.json()
          errorMessage = result.error || errorMessage
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      const result = await response.json()
      setEmail(data.email)
      setSuccess(true)
      setTimeout(() => {
        setStep('code')
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error('Forgot password error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Cannot connect to server. Please ensure the backend is running on port 3001.')
      } else {
        setError(errorMessage || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitCode = async (data: VerifyCodeFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: data.code }),
      })

      if (!response.ok) {
        let errorMessage = 'Invalid reset code. Please try again.'
        try {
          const result = await response.json()
          errorMessage = result.error || errorMessage
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage
        }
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      const result = await response.json()
      if (!result.valid) {
        setError(result.error || 'Invalid reset code. Please try again.')
        setIsLoading(false)
        return
      }

      // Redirect to reset password page with email and code
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&code=${data.code}`)
    } catch (err) {
      console.error('Verify code error:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.'
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Cannot connect to server. Please ensure the backend is running on port 3001.')
      } else {
        setError(errorMessage || 'An unexpected error occurred. Please try again.')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex items-start gap-4">
        {/* Left Aligned Button */}
        <div className="flex-shrink-0 pt-0">
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-4 py-2 bg-white rounded-full flex items-center gap-2 hover:bg-gray-100 transition-all text-gray-900 font-figtree text-sm shadow-lg border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 relative z-10"
        >
          <div className="p-8 flex flex-col justify-center">
            {step === 'email' ? (
              <>
                <div className="mb-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight font-figtree leading-[1.05] tracking-tight text-gray-900 mb-2">
                    Forgot Password?
                  </h1>
                  <p className="text-gray-600 font-figtree">
                    No worries! Enter your email address and we'll send you a reset code.
                  </p>
                </div>

                {success ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center p-8 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 font-figtree">Check Your Email</h2>
                      <p className="text-sm text-gray-600 text-center font-figtree">
                        We've sent a 6-digit reset code to your email address. Please check your inbox.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          placeholder="Enter your email address"
                          {...emailForm.register('email')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm"
                          required
                        />
                      </div>
                      {emailForm.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1 font-figtree">{emailForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-figtree">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-figtree"
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </button>

                    <div className="text-center">
                      <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-700 font-medium font-figtree">
                        Remember your password? Sign in
                      </Link>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight font-figtree leading-[1.05] tracking-tight text-gray-900 mb-2">
                    Enter Reset Code
                  </h1>
                  <p className="text-gray-600 font-figtree">
                    We sent a 6-digit code to <span className="font-semibold">{email}</span>. Please enter it below.
                  </p>
                </div>

                <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-6">
                  {/* Code Field */}
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                      Reset Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="code"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        {...codeForm.register('code')}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-figtree bg-white text-gray-900 placeholder-gray-500 text-sm text-center text-2xl tracking-widest"
                        required
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                          codeForm.setValue('code', value)
                        }}
                      />
                    </div>
                    {codeForm.formState.errors.code && (
                      <p className="text-sm text-red-500 mt-1 font-figtree">{codeForm.formState.errors.code.message}</p>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 font-figtree">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-figtree"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email')
                        setError(null)
                        codeForm.reset()
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium font-figtree"
                    >
                      Use a different email
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
