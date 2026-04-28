import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, MapPin, Sparkles, TrendingUp } from 'lucide-react'

const suggestedJobs = [
  {
    id: '1',
    title: 'Frontend Engineer',
    company: 'Acme Labs',
    location: 'Remote',
    status: 'Open',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'BrightOps',
    location: 'Nairobi',
    status: 'Open',
  },
  {
    id: '3',
    title: 'Data Analyst',
    company: 'Vertex People',
    location: 'Hybrid',
    status: 'Closing soon',
  },
]

export function JobSeekerJobsSection() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.38)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" aria-hidden />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Candidate Jobs
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Open roles for your profile</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Review opportunities that fit your skill direction and keep your profile up to date to improve shortlist chances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {suggestedJobs.map((job) => (
          <Card key={job.id} className="group border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  {job.title}
                </CardTitle>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {job.status}
                </Badge>
              </div>
              <CardDescription className="flex flex-wrap items-center gap-3 text-slate-600">
                <span>{job.company}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-500">
                Keep your profile updated to improve matching and interview invitations.
              </p>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Match quality improves with complete profile data
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
