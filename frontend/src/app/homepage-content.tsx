'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useRef, useState, useEffect } from 'react'
import { Building2, Clock, Briefcase, ArrowRight } from 'lucide-react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

type InteractiveCardProps = {
  title: string
  subtitle: string
  description: string
  index: number
}

const InteractiveScrollCard = ({ title, subtitle, description, index }: InteractiveCardProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 92%', 'end 15%'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [36, -18])
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1.03])
  const rotate = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -2 : 2, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.25, 1], [0.3, 0.92, 1])

  return (
    <motion.div
      ref={cardRef}
      style={shouldReduceMotion ? undefined : { y, scale, rotate, opacity }}
      whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 210, damping: 26 }}
      className="group relative overflow-hidden rounded-3xl border border-blue-200/70 bg-white/95 p-6 shadow-[0_16px_60px_-34px_rgba(45,45,221,0.55)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,45,221,0.2),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="mb-5 inline-flex rounded-2xl border border-blue-200/70 bg-blue-50/80 p-3">
        <span className="h-5 w-5 rounded-full bg-[#2D2DDD]/30" />
      </div>
      <p className="text-sm font-semibold uppercase tracking-wide text-[#2D2DDD]">{subtitle}</p>
      <h3 className="headline-platform mt-2 text-lg sm:text-xl md:text-2xl !leading-snug">{title}</h3>
      <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
    </motion.div>
  )
}

interface Job {
  id: string
  job_posting_id: string
  job_title: string
  job_description: string
  company_name: string
  company_logo_url: string | null
  created_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function HomePageContent() {
  const router = useRouter()
  const outcomes = [
    {
      title: '3x faster shortlisting',
      metric: 'No more weekend CV marathons',
      description: 'Move from stacked inboxes to interview-ready shortlists without manual spreadsheet churn.',
    },
    {
      title: 'Bias-aware scoring',
      metric: 'Same criteria for every candidate',
      description: 'Structured scorecards keep decisions consistent across interviewers and hiring teams.',
    },
    {
      title: 'Full audit trail',
      metric: 'Answer any decision with confidence',
      description: 'Every stage is documented, so rejected-candidate queries and stakeholder reviews are clear.',
    },
  ]

  const useCases = [
    {
      title: 'High-growth startups',
      description: 'Hiring your first 20 employees? Do not let a weak process cost you.',
    },
    {
      title: 'Scaling SMEs',
      description: 'Growing from one office to many? Keep hiring consistent in Nairobi, Mombasa, and Kisumu.',
    },
    {
      title: 'Enterprise HR teams',
      description: 'Unify 10 departments with one scorecard and one source of truth.',
    },
    {
      title: 'NGOs & development orgs',
      description: 'Donor-funded roles require fair, documented selection. OptioHire makes that practical.',
    },
  ]

  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const { executeRecaptcha } = useGoogleReCaptcha()

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  useEffect(() => {
    if (!executeRecaptcha) return
    const fetchJobs = async () => {
      try {
        let captchaToken = ''
        if (executeRecaptcha) {
          captchaToken = await executeRecaptcha('homepage_featured_jobs')
        }

        const res = await fetch('/api/jobs', {
          headers: captchaToken ? { 'X-Captcha-Token': captchaToken } : {}
        })
        const data = await res.json()
        if (res.ok && data.jobs) {
          setFeaturedJobs(data.jobs.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load featured jobs', err)
      } finally {
        setLoadingJobs(false)
      }
    }
    fetchJobs()
  }, [executeRecaptcha])

  return (
    <div className="pb-20">
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-50px" }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-4 pb-8 sm:px-6"
      >
        <div className="mx-auto grid max-w-6xl gap-4 rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur md:grid-cols-3 md:p-7">
          <div>
            <p className="text-sm font-semibold text-blue-700">Trusted hiring infrastructure</p>
            <h2 className="headline-platform mt-2 text-xl sm:text-2xl md:text-3xl">
              Built for modern recruitment teams
            </h2>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
            <p className="text-sm text-slate-500">Data privacy</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Secure-by-default workflows</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
            <p className="text-sm text-slate-500">Decision quality</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Clear scorecards and audit trail</p>
          </div>
        </div>
      </motion.section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Outcome-focused platform
            </p>
            <h2 className="headline-platform mt-4 text-3xl sm:text-5xl md:text-6xl">
              Stop screening CVs manually. Start hiring confidently.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              OptioHire helps Kenyan teams cut through hundreds of applicants — fairly, fast, and with a clear audit
              trail your stakeholders can trust.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-2xl" onClick={() => router.push('/demo')}>Request Demo</Button>
              <Button variant="outline" className="rounded-2xl" onClick={() => router.push('/how-it-works')}>See How It Works</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {outcomes.map((outcome, index) => (
              <InteractiveScrollCard
                key={outcome.title}
                title={outcome.title}
                subtitle={outcome.metric}
                description={outcome.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-50px" }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-4 pb-4 sm:px-6"
      >
        <div className="brand-dominant-surface mx-auto grid max-w-6xl gap-4 rounded-3xl border p-6 md:grid-cols-2">
          <div>
            <h3 className="headline-platform text-2xl sm:text-3xl md:text-4xl">Sound familiar?</h3>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>• Your inbox has 300 applications for one role</li>
              <li>• Shortlisting took your team 4 days — for one position</li>
              <li>• A rejected candidate asks why they were not selected and you have no clear answer</li>
              <li>• Different interviewers score differently and alignment is a nightmare</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <h4 className="headline-platform text-lg sm:text-xl md:text-2xl text-red-600">
              <span className="oh-typing inline-block">OptioHire fixes this — with structure, not just software.</span>
            </h4>
            <p className="mt-3 text-slate-600">
              Standardized scoring, transparent evidence, and a full decision trail from first pass to final interview.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl sm:p-10">
          <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                <span className="h-2 w-2 rounded-full bg-blue-200" />
                How it works
              </p>
              <h2 className="headline-platform-dark mt-4 text-3xl sm:text-4xl md:text-5xl">
                From 300 applicants to 5 final interviews — in under 48 hours
              </h2>
              <p className="mt-4 max-w-2xl text-slate-200">
                No spreadsheets. No CV marathons. Just a clear, structured process your whole team can trust.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-7 rounded-2xl px-6"
                onClick={() => router.push('/how-it-works')}
              >
                Explore Process
                <span className="ml-2 text-xs">-&gt;</span>
              </Button>
            </div>
            <div className="space-y-3">
              {[
                'Screen candidates using role-specific criteria',
                'Rank applicants with consistent, bias-aware scoring',
                'Share final recommendations with hiring stakeholders',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                  <p className="text-sm text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="headline-platform text-3xl sm:text-5xl md:text-6xl">
                Designed for every hiring context
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                A professional UI and workflow model that scales from startup recruiting to enterprise hiring.
              </p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => router.push('/use-cases')}>
              View Use Cases
              <span className="ml-2 text-xs">-&gt;</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {useCases.map((useCase, index) => (
              <InteractiveScrollCard
                key={useCase.title}
                title={useCase.title}
                subtitle={`Use case ${index + 1}`}
                description={useCase.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-20px" }} 
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="px-4 py-16 sm:px-6 bg-white overflow-hidden"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">OPEN ROLES</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A]">
                Companies are actively hiring
              </h2>
            </div>
            <div className="hidden sm:flex gap-3">
              <button className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          {loadingJobs ? (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[320px] w-[340px] h-[400px] shrink-0 animate-pulse rounded-[32px] bg-slate-100 snap-center" />
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {featuredJobs.map((job, index) => {
                const colors = [
                  'bg-[#E0F2FE]', // Blue
                  'bg-[#FFEDD5]', // Orange
                  'bg-[#DCFCE7]', // Green
                  'bg-[#F3E8FF]', // Purple
                ]
                const bgColor = colors[index % colors.length]
                const dateText = new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

                return (
                  <div
                    key={job.job_posting_id}
                    onClick={() => router.push(`/jobs/${job.job_posting_id}`)}
                    className={`${bgColor} min-w-[300px] w-[340px] shrink-0 cursor-pointer snap-center rounded-[32px] p-6 sm:p-8 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg`}
                    style={{ minHeight: '400px' }}
                  >
                    {/* Top Date Pill */}
                    <div className="mb-8 self-start rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                      {dateText}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="mb-2 text-sm font-medium text-slate-600">{job.company_name}</p>
                      <h3 className="mb-5 text-2xl font-bold leading-tight text-slate-900 line-clamp-3">
                        {job.job_title}
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                          Full time
                        </span>
                        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                          Mid
                        </span>
                      </div>
                    </div>

                    {/* Bottom Footer Area */}
                    <div className="mt-8 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {job.company_logo_url && !imgErrors[job.job_posting_id] ? (
                          <img
                            src={job.company_logo_url}
                            alt={job.company_name}
                            onError={() => handleImgError(job.job_posting_id)}
                            className="h-10 w-10 shrink-0 rounded-md object-contain"
                          />
                        ) : (
                          <div className="flex h-10 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-rose-500 to-pink-600 text-xs font-bold text-white shadow-sm">
                            {job.company_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">{job.company_name}</p>
                          <p className="truncate text-xs text-slate-600">Nairobi, Kenya</p>
                        </div>
                      </div>
                      <button className="shrink-0 rounded-full bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                        Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-600">No open roles right now</p>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push('/jobs')}
              className="flex items-center gap-2 rounded-full bg-[#0F172A] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              View all open roles
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-50px" }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="headline-platform text-3xl sm:text-5xl md:text-6xl">
                Trust and transparency by design
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Keep your candidate data protected and your hiring process explainable at every stage.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Hosted with data residency standards — your candidate data stays protected, in line with Kenya&apos;s Data Protection Act 2019.
              </p>
              <Button className="mt-6 rounded-2xl" onClick={() => router.push('/trust-security')}>
                Learn About Security
                <span className="ml-2 text-xs">-&gt;</span>
              </Button>
            </div>
            <div className="space-y-4">
              {[
                'Role-based access and secure data handling',
                'Consistent scorecards to reduce decision bias',
                'Human-in-the-loop oversight for AI recommendations',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
