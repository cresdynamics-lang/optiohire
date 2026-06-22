'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Share2, Briefcase, MapPin, DollarSign, Clock, Building2, ChevronRight, CheckCircle2, Globe, Linkedin, Twitter, Sparkles, Mail, ArrowLeft, Calendar, AlertCircle } from 'lucide-react'
import { SimilarJobs } from './similar-jobs'
// removed recaptcha import
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

export default function JobDetailClient({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const executeRecaptcha = async () => 'dummy-token'

  useEffect(() => {
    if (!executeRecaptcha) return
    const fetchJob = async () => {
      try {
        let captchaToken = ''
        if (executeRecaptcha) {
          captchaToken = await executeRecaptcha('job_detail')
        }

        const res = await fetch(`/api/jobs/${jobId}`, {
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
    if (jobId) fetchJob()
  }, [jobId, executeRecaptcha])

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

            <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                About the Role
              </h2>
              <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-li:marker:text-blue-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {job.job_description || ''}
                </ReactMarkdown>
              </div>
            </div>

            {job.responsibilities && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Responsibilities
                </h2>
                <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-li:marker:text-emerald-500">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {job.responsibilities || ''}
                  </ReactMarkdown>
                </div>
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
              <div className="flex flex-col gap-3">
                <Link
                  href={`/apply/${job.job_posting_id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
                >
                  Apply for this Role
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">
                Takes ~5 minutes · No account required
              </p>

              {/* Share This Job */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Share this job</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this ${job.job_title} role at ${job.company_name}: https://optiohire.com/jobs/${job.slug || job.job_posting_id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-[#20bd5a] transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://optiohire.com/jobs/${job.slug || job.job_posting_id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-[#1877F2] px-3 py-2 text-xs font-semibold text-white hover:bg-[#166fe5] transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://optiohire.com/jobs/${job.slug || job.job_posting_id}`)}&text=${encodeURIComponent(`Check out this ${job.job_title} role at ${job.company_name}!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X / Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://optiohire.com/jobs/${job.slug || job.job_posting_id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-[#0A66C2] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0958a7] transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(`https://optiohire.com/jobs/${job.slug || job.job_posting_id}`)}&text=${encodeURIComponent(`Check out this ${job.job_title} role at ${job.company_name}!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-[#229ED9] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d8cc2] transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.894-16.438l-1.923 9.066c-.144.651-.53.812-1.071.507l-2.963-2.183-1.428 1.376c-.158.158-.291.291-.598.291l.213-3.02 5.495-4.965c.239-.213-.052-.332-.371-.119L7.466 12.8 4.542 11.88c-.636-.198-.648-.636.133-.943l11.43-4.402c.531-.197 1 .121.789 1.027z"/></svg>
                    Telegram
                  </a>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    {copied ? (
                      <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                    ) : (
                      <><Share2 className="h-3.5 w-3.5" /> Copy Link</>
                    )}
                  </button>
                </div>
              </div>

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

            {/* Talent Pool CTA */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-sm">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Sparkles className="h-24 w-24 text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold text-blue-800">
                  <Sparkles className="h-3.5 w-3.5" />
                  Not a perfect match?
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 leading-snug">
                  Join our Elite Talent Pool
                </h3>
                <p className="mb-6 text-sm text-slate-600 leading-relaxed">
                  OptioHire partners with top companies worldwide. Create a free candidate profile and let our AI do the heavy lifting. We'll instantly email you when the perfect role finds you—no hustling required.
                </p>
                <Link
                  href="/candidate/auth/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-all duration-300 hover:shadow-md"
                >
                  Join Talent Pool <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Similar Jobs Widget */}
            <SimilarJobs currentJob={job} />

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
