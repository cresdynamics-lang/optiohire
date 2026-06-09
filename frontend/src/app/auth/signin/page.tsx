'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const getGoogleRedirectUri = () => (typeof window !== 'undefined' ? `${window.location.origin}/auth/google/callback` : '')

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        setError(error.message)
        setIsLoading(false)
      } else {
        // Send candidates directly to Jobs for faster perceived load.
        const token = localStorage.getItem('token')
        let target = '/hr'
        if (token) {
          try {
            const payloadBase64 = token.split('.')[1]
            if (payloadBase64) {
              const padded = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=')
              const payload = JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')))
              const role = String(payload?.company_role || payload?.companyRole || payload?.role || '').toLowerCase()
              if (role === 'admin') {
                target = '/admin'
              } else if (role === 'candidate' || role === 'job_seeker' || role === 'jobseeker') {
                target = '/candidate/jobs'
              }
            }
          } catch {
            // Fallback to default dashboard target
          }
        }
        router.push(target)
        // Keep isLoading=true during navigation so the button stays disabled
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex items-start gap-4">
        {/* Left Aligned Button */}
        <div className="flex-shrink-0 pt-0">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white rounded-full flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-900 font-figtree text-sm shadow-sm border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Back
          </button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 relative z-10"
        >
          {/* Sign In Form Card */}
          <div className="p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="headline-platform text-4xl sm:text-5xl leading-[1.05] mb-2 !font-semibold">Welcome Back</h1>
            <p className="text-slate-600 font-figtree">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-blue-700 font-medium">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2 font-figtree">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                {...register('email')}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-figtree bg-white text-slate-900 placeholder-slate-400 text-sm"
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1 font-figtree">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 font-figtree">
                Password
              </label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-blue-700 font-medium font-figtree">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  {...register('password')}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all font-figtree bg-white text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1 font-figtree">{errors.password.message}</p>
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
              className="w-full bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors font-figtree disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 font-figtree">or</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const redirectUri = getGoogleRedirectUri()
                    if (!redirectUri) return
                    const params = new URLSearchParams({
                      client_id: GOOGLE_CLIENT_ID,
                      redirect_uri: redirectUri,
                      response_type: 'code',
                      scope: 'openid email profile',
                      access_type: 'offline',
                      prompt: 'select_account'
                    })
                    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-figtree"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>
                <p className="text-xs text-slate-500 font-figtree text-center mt-2">
                  You will be asked to add company details and complete your profile before accessing the dashboard.
                </p>
              </>
            )}
          </form>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
