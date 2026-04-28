'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Mail, User, ShieldCheck, Briefcase, CalendarClock } from 'lucide-react'

export function JobSeekerProfileSection() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-1 pb-10 sm:px-0">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_28px_90px_-54px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900/90">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-44 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_68%)]" aria-hidden />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            Candidate account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">My profile</h1>
          <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Manage how employers reach you. Employer-only tools such as company setup and job postings stay out of
            this workspace by design.
          </p>
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900/85">
        <CardHeader className="border-b border-slate-100 pb-6 dark:border-gray-800">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-inner dark:bg-blue-950/70 dark:text-blue-300">
              <User className="h-5 w-5" />
            </span>
            Account details
          </CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-400">
            Information tied to your sign-in for candidate-facing workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Account Type</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Candidate
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Workspace</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Jobs + Interviews
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Availability</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <CalendarClock className="h-4 w-4 text-violet-600" />
                Ready for interviews
              </p>
            </div>
          </div>
          {user?.name && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Name
              </p>
              <p className="mt-1 text-slate-900 dark:text-white">{user.name}</p>
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Email
            </p>
            <p className="mt-1 flex items-center gap-2 text-slate-900 dark:text-white">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="break-all">{user?.email || '—'}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center dark:border-gray-800">
            <Button variant="outline" className="min-h-[44px] rounded-2xl border-slate-300 bg-white touch-manipulation dark:bg-gray-950 dark:border-gray-700 sm:min-h-10" asChild>
              <Link href="/">Back to site</Link>
            </Button>
            <Button
              variant="destructive"
              className="min-h-[44px] gap-2 rounded-2xl shadow-sm shadow-red-500/15 touch-manipulation sm:min-h-10"
              onClick={async () => {
                await signOut()
                router.push('/auth/signin')
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
