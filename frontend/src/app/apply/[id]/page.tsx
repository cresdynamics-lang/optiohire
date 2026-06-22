'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Clock, AlertCircle, Loader2
} from 'lucide-react'
// removed recaptcha import
import { ApplyForm } from '@/components/jobs/apply-form'

interface Job {
  id: string
  job_title: string
  company_name: string
  company_logo_url: string | null
  custom_questions?: any[]
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const executeRecaptcha = async () => 'dummy-token'

  useEffect(() => {
    if (!executeRecaptcha) return
    const fetchJob = async () => {
      try {
        let captchaToken = ''
        if (executeRecaptcha) {
          captchaToken = await executeRecaptcha('apply_page')
        }

        const res = await fetch(`/api/jobs/${params.id}`, {
          headers: captchaToken ? { 'X-Captcha-Token': captchaToken } : {}
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Job not found')
        setJob(data.job)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchJob()
  }, [params.id, executeRecaptcha])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center font-figtree">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Job not found</h2>
        <p className="text-slate-500">{error || 'This role may have been filled or removed.'}</p>
        <Link
          href="/jobs"
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Browse all jobs
        </Link>
      </div>
    )
  }

  const initials = job.company_name.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-figtree">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/jobs/${params.id}`}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job Description
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            {job.company_logo_url ? (
              <img
                src={job.company_logo_url}
                alt={job.company_name}
                className="h-14 w-14 rounded-xl border border-slate-100 object-contain"
              />
            ) : (
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2D2DDD] to-blue-500 text-lg font-bold text-white shadow-md">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{job.job_title}</h1>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3.5 w-3.5" />
                {job.company_name}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Application Form</h2>
              <p className="text-sm text-slate-500">Fill in your details below and upload your CV.</p>
            </div>

            <ApplyForm jobPostingId={params.id as string} customQuestions={job.custom_questions} />
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Powered by OptioHire AI Recruitment System
        </p>
      </div>
    </div>
  )
}
