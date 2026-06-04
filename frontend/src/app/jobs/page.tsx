'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, MapPin, Clock, ChevronRight, Building2, SlidersHorizontal, X, Briefcase, ArrowRight, Sparkles, ChevronDown, Check } from 'lucide-react'
import { useRef } from 'react'
import { motion } from 'framer-motion'

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
  job_poster_url?: string
}

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

function deadlineLabel(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return { text: 'Closed', urgent: true }
  if (diff <= 3) return { text: `${diff}d left`, urgent: true }
  if (diff <= 7) return { text: `${diff}d left`, urgent: false }
  return null
}

function Dropdown({
  options,
  value,
  onChange,
  label
}: {
  options: string[]
  value: string
  onChange: (val: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-[42px] items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 min-w-[160px]"
      >
        <span className="truncate">{value === '' ? label : value}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-[320px] w-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <button
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
              value === '' ? 'bg-[#F97316] font-semibold text-white' : 'font-medium text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex w-6 shrink-0 items-center">
              {value === '' && <Check className="h-4 w-4" />}
            </div>
            <span>{label}</span>
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                value === opt ? 'bg-[#F97316] font-semibold text-white' : 'font-medium text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex w-6 shrink-0 items-center">
                {value === opt && <Check className="h-4 w-4" />}
              </div>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const skills = job.skills_required || []
  const deadline = deadlineLabel(job.application_deadline)
  const initials = job.company_name.slice(0, 2).toUpperCase()

  // Fallback pattern if no poster
  const fallbackGradient = 'from-[#1A1625] to-[#2D243F]'

  return (
    <Link
      href={`/jobs/${job.job_posting_id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Conspicuous Deadline Badge */}
      {deadline && (
        <div className={`absolute top-4 right-4 z-10 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md ${deadline.urgent ? 'bg-red-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
          {deadline.urgent && '🔥 '}
          {deadline.text}
        </div>
      )}

      {/* Poster / Header Area */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {job.job_poster_url ? (
          <img 
            src={job.job_poster_url} 
            alt={`Poster for ${job.job_title}`} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${fallbackGradient} p-6 flex flex-col justify-between transition-transform duration-500 group-hover:scale-105`}>
            <div className="flex justify-between items-start">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 inline-flex shadow-sm">
                {job.company_logo_url ? (
                  <img src={job.company_logo_url} alt={job.company_name} className="h-8 w-8 object-contain rounded-md bg-white" />
                ) : (
                  <div className="h-8 w-8 rounded-md bg-white text-[#1A1625] flex items-center justify-center font-bold text-xs">
                    {initials}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-syne text-xl font-bold text-white line-clamp-2">{job.job_title}</h3>
              <p className="text-white/70 text-sm mt-1">{job.company_name}</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient for text readability if poster exists */}
        {job.job_poster_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      <div className="flex flex-col gap-4 p-5 flex-1">
        {/* Header (if poster is used, we still show title here for clarity, or just rely on the fallback?)
            Actually, let's always show title below because poster might be anything. */}
        <div>
          <h3 className="truncate font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-200 text-lg">
            {job.job_title}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            {job.company_name}
          </p>
        </div>

      {/* Description */}
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
        {job.job_description}
      </p>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
              +{skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-auto">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {timeAgo(job.created_at)}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 group-hover:gap-2 transition-all duration-200">
          Apply now
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
      </div>
    </Link>
  )
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filtered, setFiltered] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedRoleType, setSelectedRoleType] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 12
  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let captchaToken = ''
        if (executeRecaptcha) {
          captchaToken = await executeRecaptcha('jobs_listing')
        }

        const res = await fetch('/api/jobs', {
          headers: captchaToken ? { 'X-Captcha-Token': captchaToken } : {}
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load jobs')
        setJobs(data.jobs || [])
        setFiltered(data.jobs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [executeRecaptcha])

  const applyFilters = useCallback(() => {
    let result = jobs
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (j) =>
          j.job_title.toLowerCase().includes(q) ||
          j.company_name.toLowerCase().includes(q) ||
          j.job_description?.toLowerCase().includes(q) ||
          j.skills_required?.some((s) => s.toLowerCase().includes(q))
      )
    }
    if (selectedRoleType) {
      const q = selectedRoleType.toLowerCase()
      result = result.filter((j) => j.job_title.toLowerCase().includes(q) || j.job_description?.toLowerCase().includes(q))
    }
    if (selectedType) {
      const q = selectedType.toLowerCase()
      result = result.filter((j) => j.job_title.toLowerCase().includes(q) || j.job_description?.toLowerCase().includes(q))
    }
    if (selectedLocation) {
      const q = selectedLocation.toLowerCase()
      result = result.filter((j) => j.job_title.toLowerCase().includes(q) || j.job_description?.toLowerCase().includes(q))
    }
    setFiltered(result)
    setPage(1)
  }, [jobs, search, selectedRoleType, selectedType, selectedLocation])

  useEffect(() => { applyFilters() }, [applyFilters])

  const clearFilters = () => {
    setSearch('')
    setSelectedRoleType('')
    setSelectedType('')
    setSelectedLocation('')
  }

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#f8fafc_100%)]">
      {/* Hero */}
      <motion.section 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-[#1e1b8f] to-[#2D2DDD] px-4 py-16 text-white"
      >
        <div className="pointer-events-none absolute inset-0 hero-dot-grid opacity-10" aria-hidden />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
            <Sparkles className="h-4 w-4 text-blue-300" />
            {loading ? '...' : `${jobs.length} open position${jobs.length !== 1 ? 's' : ''}`}
          </div>
          <h1 className="mb-4 font-syne text-4xl font-bold leading-tight sm:text-5xl md:text-6xl text-white">
            Find Your Next{' '}
            <span className="italic text-blue-300">Opportunity</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-blue-100">
            Curated roles from leading companies. Apply directly — no middleman, no noise.
          </p>

          {/* Search bar */}
          <div className="relative mx-auto max-w-2xl">
            <div className="flex items-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
              <Search className="ml-4 h-5 w-5 flex-shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, skill, or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent px-3 py-4 text-slate-900 placeholder-slate-400 outline-none text-sm font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="mr-2 p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button className="m-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        {/* Filter bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              label="All role types"
              value={selectedRoleType}
              onChange={setSelectedRoleType}
              options={[
                'Software Engineer',
                'Data Analyst',
                'Business Intelligence Analyst',
                'Product Manager',
                'UI/UX Designer',
                'Marketing Analyst',
                'Sales Representative',
                'HR Manager',
                'Recruiter',
                'Financial Controller',
                'Risk Analyst',
                'Operations Manager',
                'Customer Success Manager',
                'Legal Counsel',
              ]}
            />
            <Dropdown
              label="All types"
              value={selectedType}
              onChange={setSelectedType}
              options={['Full time', 'Part time', 'Contract', 'Internship', 'Freelance']}
            />
            <Dropdown
              label="All locations"
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={['On-site', 'Remote', 'Hybrid']}
            />
            
            {(selectedRoleType || selectedType || selectedLocation) && (
              <button
                onClick={clearFilters}
                className="ml-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <Briefcase className="h-7 w-7 text-red-400" />
            </div>
            <p className="text-slate-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Search className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No jobs found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search or clearing the filters.</p>
            <button
              onClick={clearFilters}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Job grid */}
        {!loading && !error && paginated.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((job) => (
                <JobCard key={job.job_posting_id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 rounded-xl text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
