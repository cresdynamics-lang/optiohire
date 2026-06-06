'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, Clock, Calendar, CheckCircle2,
  Briefcase, ChevronRight, Share2, Bookmark, AlertCircle, Sparkles, Globe, Linkedin, Twitter
} from 'lucide-react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

interface Job {
  id: string
  job_posting_id: string
  job_title: string
  job_description: string
  responsibilities: string
  skills_required: string[]
  application_deadline: string | null
  status: string
  created_at: string
  company_name: string
  company_email: string
  company_logo_url: string | null
  job_poster_url?: string | null
  website_url?: string | null
  linkedin_url?: string | null
  twitter_url?: string | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  if (days < 7) return `Posted ${days} days ago`
  return `Posted ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
  const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  return { formatted, daysLeft: diff }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    if (!executeRecaptcha) return
    const fetchJob = async () => {
      try {
        let captchaToken = ''
        if (executeRecaptcha) {
          captchaToken = await executeRecaptcha('job_detail')
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-8 w-32 animate-pulse rounded-xl bg-slate-200" />
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm space-y-5">
            <div className="flex gap-4">
              <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-7 w-2/3 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-4 w-1/3 animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
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

  const deadline = formatDeadline(job.application_deadline)
  const initials = job.company_name.slice(0, 2).toUpperCase()
  const skills = job.skills_required || []

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_60%)]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Jobs
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div className="space-y-8">
            {job.job_poster_url ? (
              <div className="w-full overflow-hidden rounded-3xl shadow-sm border border-slate-200">
                <img src={job.job_poster_url} alt={`${job.job_title} Poster`} className="w-full h-auto object-cover max-h-[500px]" />
              </div>
            ) : (
              <div className="w-full bg-[#1A1625] rounded-3xl p-8 sm:p-10 flex flex-col justify-between aspect-[4/5] sm:aspect-auto sm:h-[480px] shadow-2xl border border-slate-800">
                {/* Header: Logo and Company Name */}
                <div className="flex items-center gap-3">
                  {job.company_logo_url && !logoError ? (
                    <img 
                      src={job.company_logo_url} 
                      alt={job.company_name} 
                      onError={() => setLogoError(true)}
                      className="h-8 w-auto object-contain rounded-sm" 
                    />
                  ) : (
                    <div className="h-8 w-11 rounded-md bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {initials}
                    </div>
                  )}
                  <span className="text-white font-bold text-xl tracking-tight">{job.company_name}</span>
                </div>

                {/* Main Content */}
                <div className="mt-auto mb-8">
                  <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mb-10">
                    {job.job_title}
                  </h1>

                  <div className="flex items-center gap-5">
                    {/* Date Block */}
                    <div className="bg-[#2A2438] rounded-xl flex flex-col items-center justify-center w-[72px] h-[72px] shadow-inner shrink-0">
                      {deadline ? (
                        <>
                          <span className="text-white/80 text-[11px] font-bold uppercase tracking-widest">{new Date(deadline.formatted).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-white text-2xl font-bold leading-none mt-1.5">{new Date(deadline.formatted).getDate()}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white/80 text-[11px] font-bold uppercase tracking-widest">ASAP</span>
                          <span className="text-white text-2xl font-bold leading-none mt-1.5">—</span>
                        </>
                      )}
                    </div>
                    {/* Location */}
                    <span className="text-slate-300 font-medium text-base">Online, Remote</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-slate-400 text-sm font-medium">
                    By {job.company_name} <span className="text-rose-500 font-bold ml-1">Apply on Optiohire</span>
                  </p>
                </div>
              </div>
            )}
            {/* Header card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {/* Company logo */}
                {job.company_logo_url && !logoError ? (
                  <img
                    src={job.company_logo_url}
                    alt={job.company_name}
                    onError={() => setLogoError(true)}
                    className="h-16 w-16 rounded-2xl border border-slate-100 object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-xl font-bold text-white shadow-md">
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{job.job_title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {job.company_name}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {timeAgo(job.created_at)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Actively Hiring
                    </span>
                    {deadline && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${
                        deadline.daysLeft <= 3
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        <Calendar className="h-3.5 w-3.5" />
                        Closes {deadline.formatted}
                        {deadline.daysLeft > 0 && ` · ${deadline.daysLeft}d left`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action icons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                    title="Copy link"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* About the role */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                About the Role
              </h2>
              <div className="prose prose-slate prose-sm max-w-none">
                {job.job_description.split('\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="mb-3 text-sm leading-relaxed text-slate-600">{para}</p>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Responsibilities</h2>
                <ul className="space-y-2.5">
                  {job.responsibilities.split('\n').filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      <span>{item.replace(/^[-•*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills required */}
            {skills.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Skills & Requirements
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-sm font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply CTA */}
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-1 text-base font-bold text-slate-900">Ready to apply?</h3>
              <p className="mb-5 text-sm text-slate-500">
                Submit your application directly to {job.company_name}.
              </p>
              <Link
                href={`/apply/${job.job_posting_id}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
              >
                Apply for this Role
                <ChevronRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-xs text-slate-400">
                Takes ~5 minutes · No account required
              </p>

              {deadline && deadline.daysLeft > 0 && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
                  <p className="text-xs font-medium text-amber-700">
                    ⏰ {deadline.daysLeft} day{deadline.daysLeft !== 1 ? 's' : ''} left to apply
                  </p>
                </div>
              )}
            </div>

            {/* Company info */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-900 uppercase tracking-wide">About the Company</h3>
              <div className="flex items-center gap-3">
                {job.company_logo_url && !logoError ? (
                  <img 
                    src={job.company_logo_url} 
                    alt={job.company_name} 
                    onError={() => setLogoError(true)}
                    className="h-10 w-10 rounded-xl border border-slate-100 object-contain" 
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-sm font-bold text-white">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-900">{job.company_name}</p>
                  <p className="text-xs text-slate-500">{job.company_email}</p>
                </div>
              </div>
              
              {/* Social Links */}
              {(job.website_url || job.linkedin_url || job.twitter_url) && (
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  {job.website_url && (
                    <a href={job.website_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="Website">
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {job.linkedin_url && (
                    <a href={job.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-700 transition-colors" title="LinkedIn">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {job.twitter_url && (
                    <a href={job.twitter_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors" title="Twitter / X">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Browse more */}
            <Link
              href="/jobs"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse more jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
