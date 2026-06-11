'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, ShieldCheck, Trophy, Loader2 } from 'lucide-react'
import { CandidateAnalyticsDashboard } from './candidate-analytics-dashboard'

export function JobSeekerOverviewSection() {
  const { user } = useAuth()
  let firstName = user?.name?.split(/\s+/)[0]
  if (!firstName || firstName.toLowerCase() === 'student') {
    firstName = user?.email ? user.email.split('@')[0] : ''
  }

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await fetch('/api/candidate/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          setData(result.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-10 px-1 pb-4 sm:px-0">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_28px_90px_-54px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-8 md:p-10 dark:border-gray-800 dark:bg-gray-900/90">
        <div className="pointer-events-none absolute inset-0 hero-dot-grid opacity-[0.22]" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-500/10"
          aria-hidden
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300">
            <Sparkles className="h-3 w-3" />
            Candidate workspace
          </span>
          <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl dark:text-white">
            Welcome back{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-900 dark:text-slate-400">
            Your dashboard is tailored for applying and staying reachable. Keep your profile accurate so employers
            who hire through OptioHire can move quickly when you are shortlisted.
          </p>
          <div className="mt-8 flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="min-h-[48px] w-full touch-manipulation gap-2 rounded-2xl px-6 shadow-md shadow-blue-500/20 sm:w-auto sm:min-h-0">
              <Link href="/">
                Browse site
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-[48px] w-full touch-manipulation rounded-2xl border-slate-300 bg-white/90 sm:w-auto sm:min-h-0 dark:bg-gray-950 dark:border-gray-700 dark:text-white">
              <Link href="/candidate/profile">My profile</Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-400">Status</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Active
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-400">Focus</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">
                <Trophy className="h-4 w-4 text-amber-500" />
                Profile completeness
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900 dark:text-slate-400">Role</p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white dark:text-slate-200">Job seeker</p>
            </div>
          </div>
        </div>
      </div>

      <CandidateAnalyticsDashboard data={data} />
    </div>
  )
}
