'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Briefcase, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react'

interface Job {
  id: string
  job_posting_id: string
  job_title: string
  job_description: string
  company_name: string
  company_logo_url: string | null
  created_at: string
}

const ACCENTS = [
  'from-blue-500/20 to-indigo-500/10 border-blue-400/30',
  'from-emerald-500/20 to-teal-500/10 border-emerald-400/30',
  'from-fuchsia-500/20 to-purple-500/10 border-fuchsia-400/30',
  'from-amber-500/20 to-orange-500/10 border-amber-400/30',
]

export default function FeaturedJobs() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs')
        const data = await res.json()
        if (res.ok && data.jobs) setJobs(data.jobs.slice(0, 8))
      } catch (err) {
        console.error('Failed to load featured jobs', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const amount = 340 + 24
      carouselRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
    }
  }

  return (
    <section className="relative px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Open roles</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Companies are hiring right now
            </h2>
            <p className="mt-3 max-w-xl text-lg text-slate-400">
              Real roles from teams screening with OptioHire. Apply once, track everything.
            </p>
          </div>
          <div className="hidden gap-3 sm:flex">
            <button
              onClick={() => scrollCarousel('left')}
              aria-label="Scroll left"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              aria-label="Scroll right"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:bg-white/10"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[380px] w-[340px] shrink-0 animate-pulse rounded-[28px] border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div ref={carouselRef} className="scrollbar-hide -mx-4 flex gap-6 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {jobs.map((job, index) => {
              const accent = ACCENTS[index % ACCENTS.length]
              const dateText = new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return (
                <motion.div
                  key={job.job_posting_id}
                  onClick={() => router.push(`/jobs/${job.job_posting_id}`)}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  className={`group flex min-h-[380px] w-[340px] shrink-0 cursor-pointer flex-col rounded-[28px] border bg-gradient-to-br ${accent} p-7 backdrop-blur`}
                >
                  <div className="mb-8 self-start rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-slate-200">
                    {dateText}
                  </div>
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-medium text-slate-300">{job.company_name}</p>
                    <h3 className="mb-5 line-clamp-3 text-2xl font-bold leading-tight text-white">
                      {job.job_title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">Full time</span>
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">Nairobi</span>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {job.company_logo_url && !imgErrors[job.job_posting_id] ? (
                        <img
                          src={job.company_logo_url}
                          alt={job.company_name}
                          onError={() => setImgErrors((p) => ({ ...p, [job.job_posting_id]: true }))}
                          className="h-10 w-10 shrink-0 rounded-lg bg-white/90 object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                          {job.company_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <p className="truncate text-sm font-semibold text-white">{job.company_name}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-blue-300 transition-transform group-hover:translate-x-1">
                      Details <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/15 bg-white/5 py-20 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 text-sm font-medium text-slate-400">No open roles right now</p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => router.push('/jobs')}
            className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-transform hover:scale-[1.03]"
          >
            View all open roles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  )
}
