'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

const resetPasswordSchema = z.object({
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [codeValid, setCodeValid] = useState<boolean | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const codeParam = searchParams.get('code')
    
    if (!emailParam || !codeParam) {
      setError('Invalid reset link. Please request a new password reset.')
      setCodeValid(false)
      return
    }
    
    setEmail(emailParam)
    setCode(codeParam)
    // Verify code is valid
    verifyCode(emailParam, codeParam)
  }, [searchParams])

  const verifyCode = async (emailToVerify: string, codeToVerify: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToVerify, code: codeToVerify }),
      })

      const result = await response.json()
      setCodeValid(response.ok && result.valid === true)
      if (!response.ok || !result.valid) {
        setError(result.error || 'Invalid or expired reset code. Please request a new password reset.')
      }
    } catch (err) {
      setCodeValid(false)
      setError('Failed to verify reset code. Please try again.')
    }
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !code) {
      setError('Invalid reset code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to reset password. Please try again.')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/auth/signin')
      }, 3000)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (codeValid === false) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 p-8"
          >
            <div className="flex flex-col items-center justify-center">
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2 font-figtree">Invalid Reset Code</h2>
              <p className="text-sm text-gray-600 text-center mb-6 font-figtree">
                {error || 'This password reset code is invalid or has expired. Please request a new one.'}
              </p>
              <Link
                href="/auth/forgot-password"
                className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors text-center font-figtree"
              >
                Request New Reset Code
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
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
            {success ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-8 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 font-figtree">Password Reset Successful</h2>
                  <p className="text-sm text-gray-600 text-center font-figtree">
                    Your password has been successfully reset. Redirecting you to sign in...
                  </p>
                </div>
                <Link
                  href="/auth/signin"
                  className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors text-center font-figtree"
                >
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight font-figtree leading-[1.05] tracking-tight text-gray-900 mb-2">
                    Reset Password
                  </h1>
                  <p className="text-gray-600 font-figtree">
                    Enter your new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="Enter new password"
                        {...register('password')}
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
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1 font-figtree">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 font-figtree">
                      Password must contain: uppercase, lowercase, number, special character, and be at least 8 characters
                    </p>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        {...register('confirmPassword')}
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
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1 font-figtree">{errors.confirmPassword.message}</p>
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
                    disabled={isLoading || !email || !code || codeValid !== true}
                    className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-figtree"
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-figtree">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
