'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormData = z.infer<typeof signInSchema>

export default function ConsoleSignInPage() {
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
        router.push('/')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Link href="/" className="self-center flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to main site
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 p-8 md:p-10"
        >
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">System Console</h1>
            <p className="text-slate-400 text-sm">
              Secure access for authorized personnel only.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Access ID / Email</label>
              <input 
                type="email" 
                {...register('email')} 
                placeholder="name@optiohire.com" 
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder:text-slate-500 transition-all" 
                required 
              />
              {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Security Key</label>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  {...register('password')} 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder:text-slate-500 transition-all" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Unauthorized access attempts are logged and monitored. By signing in, you agree to our security protocols.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
