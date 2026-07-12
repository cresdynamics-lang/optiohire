'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, ArrowLeft, ChevronRight, UserCircle2 } from 'lucide-react'

const CANDIDATE_BASE = 'https://applications.optiohire.com'

function AuthOptionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') // 'signup' or 'signin'
  const isSignUp = mode === 'signup'

  const options = [
    {
      title: isSignUp ? "I'm hiring (HR)" : "I'm an employer",
      description: isSignUp
        ? 'Create your HR workspace and start your free trial'
        : 'Sign in to manage your recruitment pipeline',
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      href: isSignUp ? '/hr/auth/signup' : '/hr/auth/signin',
      cta: isSignUp ? 'Create HR account' : 'Employer sign in',
    },
    {
      title: isSignUp ? "I'm a student / job seeker" : "I'm a job seeker",
      description: isSignUp
        ? 'Create your profile and apply to top companies'
        : 'Sign in to track your applications and interviews',
      icon: <UserCircle2 className="w-8 h-8 text-blue-600" />,
      href: isSignUp ? `${CANDIDATE_BASE}/auth/signup` : `${CANDIDATE_BASE}/auth/signin`,
      cta: isSignUp ? 'Create job-seeker account' : 'Job-seeker sign in',
    },
  ]

  return (
    <div className="w-full max-w-4xl flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="headline-platform text-3xl sm:text-4xl !font-semibold text-[#2D2DDD]">
          {isSignUp ? 'Start your free trial' : 'Welcome back'}
        </h1>
        <p className="mt-3 text-slate-600">
          {isSignUp ? 'Choose how you want to get started.' : 'Choose how you want to sign in.'}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              href={option.href}
              className="group relative flex flex-col p-10 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
            >
              <div className="mb-6 p-4 rounded-2xl bg-blue-50 inline-block w-fit group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {option.title}
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                {option.description}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:gap-4 transition-all duration-300">
                {option.cta}
                <ChevronRight className="w-4 h-4" />
              </div>

              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Back link */}
      <button 
        onClick={() => router.back()}
        className="self-center flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium mt-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to previous page
      </button>
    </div>
  )
}

export default function AuthOptionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="w-full flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
        <AuthOptionsContent />
      </Suspense>
    </div>
  )
}
