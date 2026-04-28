import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Jobs</h2>
        <p className="text-sm text-slate-600">Explore opportunities and track openings relevant to your profile.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {suggestedJobs.map((job) => (
          <Card key={job.id} className="border-slate-200 bg-white">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base text-slate-900">{job.title}</CardTitle>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {job.status}
                </Badge>
              </div>
              <CardDescription className="text-slate-600">
                {job.company} - {job.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Keep your profile updated to improve matching and interview invitations.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
