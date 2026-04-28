'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, CalendarDays, Mail, User, ArrowRight, Sparkles, ShieldCheck, Trophy } from 'lucide-react'

export function JobSeekerOverviewSection() {
  const { user } = useAuth()
  const firstName = user?.name?.split(/\s+/)[0]

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
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 dark:text-slate-400">
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
            <Button asChild variant="outline" size="lg" className="min-h-[48px] w-full touch-manipulation rounded-2xl border-slate-300 bg-white/90 sm:w-auto sm:min-h-0 dark:bg-gray-950 dark:border-gray-700">
              <Link href="/dashboard/profile">My profile</Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Status</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Candidate workspace active
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Focus</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Trophy className="h-4 w-4 text-amber-500" />
                Profile completeness
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Role</p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">Job seeker account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="group rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] transition-all hover:border-blue-200/80 hover:shadow-[0_26px_80px_-44px_rgba(37,99,235,0.28)] dark:border-gray-800 dark:bg-gray-900/85">
          <CardHeader className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-inner shadow-blue-900/5 dark:bg-blue-950/80 dark:text-blue-300">
              <Briefcase className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">Find roles</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Hiring happens through employer workspaces on OptioHire. Explore how the product works and stay ready
              when teams invite you into their process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="min-h-[44px] w-full touch-manipulation rounded-2xl shadow-sm sm:min-h-10">
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] transition-all hover:border-emerald-200/80 dark:border-gray-800 dark:bg-gray-900/85">
          <CardHeader className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-inner dark:bg-emerald-950/80 dark:text-emerald-300">
              <User className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">Stay ready</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Accurate contact details and a complete profile reduce friction when recruiters reach out or schedule
              next steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full rounded-2xl shadow-sm">
              <Link href="/dashboard/profile">Update profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900/85">
          <CardHeader className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 shadow-inner dark:bg-violet-950/70 dark:text-violet-300">
              <CalendarDays className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">Interviews</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              When a company schedules with you, you will usually get email and calendar details directly from them.
              Watch your inbox for updates from the recruiting team.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Tip: add the employer domain to your safe senders so invitations do not land in spam.
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900/85">
          <CardHeader className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 shadow-inner dark:bg-amber-950/60 dark:text-amber-200">
              <Mail className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">Need help?</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Questions about your account or an application? Our team can point you in the right direction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="min-h-[44px] w-full touch-manipulation rounded-2xl border-slate-300 bg-white sm:min-h-10 dark:bg-gray-950 dark:border-gray-700">
              <Link href="/contact">Contact support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
