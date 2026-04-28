import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Interviews</h2>
        <p className="text-sm text-slate-600">View upcoming interview slots and prepare ahead of time.</p>
      </div>

      <div className="space-y-4">
        {upcomingInterviews.map((interview) => (
          <Card key={interview.id} className="border-slate-200 bg-white">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base text-slate-900">{interview.role}</CardTitle>
                  <CardDescription className="text-slate-600">{interview.company}</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {interview.stage}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{interview.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
