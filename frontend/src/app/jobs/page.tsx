import Link from 'next/link'
import { getPublicJobPostings } from '@/lib/public-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Building2, Briefcase } from 'lucide-react'

export const metadata = {
  title: 'Job Openings | OptioHire',
  description: 'Explore exciting career opportunities at top companies.',
}

export default async function JobsPage() {
  const jobs = await getPublicJobPostings()

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
            Join Our Network of Talent
          </h1>
          <p className="mt-4 text-xl text-slate-600">
            Find your next career move among our active job openings.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900">No active job openings</h2>
            <p className="text-slate-500 mt-2">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.job_posting_id} className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-slate-200">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl font-bold text-indigo-600 mb-2">
                            {job.job_title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              <Link 
                                href={`/companies/${job.company_id}/jobs`}
                                className="hover:text-indigo-600 hover:underline font-medium"
                              >
                                {job.company_name}
                              </Link>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" />
                              Posted {new Date(job.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {job.company_logo_url && (
                          <img 
                            src={job.company_logo_url} 
                            alt={job.company_name} 
                            className="w-12 h-12 rounded-lg object-contain bg-slate-50 p-1 border"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 line-clamp-3 mb-4">
                        {job.job_description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 5 && (
                          <Badge variant="secondary">+{job.skills_required.length - 5} more</Badge>
                        )}
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter className="bg-slate-50 md:bg-white md:border-l border-slate-100 flex md:flex-col justify-center items-center p-6 gap-4 min-w-[200px]">
                    <div className="text-center hidden md:block mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Deadline</p>
                      <p className="text-sm font-medium text-slate-900">
                        {job.application_deadline 
                          ? new Date(job.application_deadline).toLocaleDateString()
                          : 'Ongoing'}
                      </p>
                    </div>
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                      <Link href={`/jobs/${job.job_posting_id}`}>
                        View & Apply
                      </Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} OptioHire. Powered by AI for fair and efficient hiring.</p>
        </div>
      </div>
    </div>
  )
}
