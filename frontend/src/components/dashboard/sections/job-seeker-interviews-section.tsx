import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, CheckCircle2, Sparkles, Video } from 'lucide-react'

const upcomingInterviews = [
  {
    id: '1',
    company: 'Acme Labs',
    role: 'Frontend Engineer',
    date: 'Wed, 10:00 AM',
    stage: 'Technical Interview',
  },
  {
    id: '2',
    company: 'BrightOps',
    role: 'Product Designer',
    date: 'Fri, 2:30 PM',
    stage: 'Hiring Manager',
  },
]

export function JobSeekerInterviewsSection() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.38)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-14 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Candidate Interviews
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Upcoming interviews</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Track your upcoming interview stages and stay prepared before each discussion with hiring teams.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {upcomingInterviews.map((interview) => (
          <Card key={interview.id} className="border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                    <Video className="h-4 w-4 text-slate-500" />
                    {interview.role}
                  </CardTitle>
                  <CardDescription className="text-slate-600">{interview.company}</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {interview.stage}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                <CalendarClock className="h-4 w-4 text-slate-400" />
                {interview.date}
              </p>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Preparation checklist recommended
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
