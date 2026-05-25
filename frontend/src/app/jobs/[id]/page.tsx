import { getPublicJobPostingById } from '@/lib/public-api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApplyForm } from '@/components/jobs/apply-form'
import { ShareButton } from '@/components/jobs/share-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Building2, ChevronLeft, Globe, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getPublicJobPostingById(id)
  if (!job) return { title: 'Job Not Found' }

  return {
    title: `${job.job_title} at ${job.company_name} | OptioHire`,
    description: job.job_description.slice(0, 160),
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getPublicJobPostingById(id)

  if (!job) {
    notFound()
  }

  // List of generic domains we shouldn't show as a company website
  const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'me.com']
  const showDomain = job.company_domain && !genericDomains.includes(job.company_domain.toLowerCase())

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back navigation */}
        <Link 
          href="/jobs" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to all jobs
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Job Details Content */}
          <div className="p-8 pb-0">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.job_title}</h1>
                <div className="flex flex-wrap gap-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <Link 
                      href={`/companies/${job.company_id}/jobs`}
                      className="hover:text-indigo-600 hover:underline font-medium"
                    >
                      {job.company_name}
                    </Link>
                  </div>
                  {showDomain && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{job.company_domain}</span>
                    </div>
                  )}
                </div>
              </div>
              {job.company_logo_url && (
                <img 
                  src={job.company_logo_url} 
                  alt={job.company_name} 
                  className="w-16 h-16 rounded-xl object-contain bg-slate-50 p-2 border border-slate-100"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <CalendarDays className="w-3 h-3" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </Badge>
              {job.application_deadline && (
                <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 px-3 py-1">
                  Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                </Badge>
              )}
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1">
                Active
              </Badge>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 font-figtree">About the Role</h3>
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed mb-8 font-figtree font-light">
                {job.job_description}
              </p>

              {job.responsibilities && (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 font-figtree">Responsibilities</h3>
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed mb-8 font-figtree font-light">
                    {job.responsibilities}
                  </p>
                </>
              )}

              <h3 className="text-lg font-semibold text-slate-900 mb-2 font-figtree">Required Skills</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills_required.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="my-10" />
          </div>

          {/* Application Form Content */}
          <div className="p-8 pt-0">
            <div className="mb-8">
              <h2 className="text-2xl font-bold font-figtree text-slate-900">Apply for this position</h2>
              <p className="text-slate-500 mt-1 font-figtree font-light text-sm">Complete the form below to submit your application to {job.company_name}.</p>
            </div>
            
            <div className="max-w-2xl">
              <ApplyForm jobPostingId={job.job_posting_id} />
            </div>

            <Separator className="my-10" />
            
            <div className="flex justify-between items-center pb-2">
              <p className="text-sm text-slate-500 font-figtree">
                Know someone who'd be a great fit?
              </p>
              <ShareButton jobTitle={job.job_title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
