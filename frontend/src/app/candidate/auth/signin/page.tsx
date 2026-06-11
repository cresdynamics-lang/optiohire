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
const getGoogleRedirectUri = () => {
  if (typeof window === 'undefined') return ''
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (isLocalhost) return `${window.location.origin}/auth/google/callback`
  return 'https://optiohire.com/auth/google/callback'
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function CandidateSignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>({
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
        window.location.href = '/candidate'
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-start pt-8 pb-12 px-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <button 
          onClick={() => window.location.href = 'https://optiohire.com'} 
          className="self-start px-4 py-2 bg-white text-slate-700 rounded-full flex items-center gap-2 hover:bg-slate-50 transition-colors font-figtree text-sm border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 sm:p-8 flex flex-col">
            <div className="mb-6 text-center">
              <h1 className="headline-platform text-2xl sm:text-3xl mb-2 !font-semibold text-blue-600">Candidate Login</h1>
              <p className="text-slate-600 font-figtree text-sm">
                Find your next opportunity. Don't have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 font-medium hover:underline">Create one</Link>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-figtree">Email Address</label>
                <input 
                  type="email" 
                  {...register('email')} 
                  placeholder="email@example.com" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-figtree text-sm" 
                  required 
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 font-figtree">Password</label>
                  <Link href="/candidate/auth/forgot-password" className="text-sm text-blue-600 font-medium font-figtree hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    {...register('password')} 
                    placeholder="Password" 
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-figtree text-sm" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                  </button>
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-figtree">{error}</div>}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors font-figtree disabled:opacity-50 shadow-lg shadow-blue-600/20"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
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
                      const params = new URLSearchParams({ 
                        client_id: GOOGLE_CLIENT_ID, 
                        redirect_uri: getGoogleRedirectUri(), 
                        response_type: 'code', 
                        scope: 'openid email profile', 
                        prompt: 'select_account',
                        state: 'candidate'
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
                </>
              )}
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 font-figtree">
                Don't have an account? <Link href="/auth/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
