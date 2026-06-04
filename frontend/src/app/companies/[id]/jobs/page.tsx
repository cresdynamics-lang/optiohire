'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Building2, Briefcase, ChevronLeft, Loader2 } from 'lucide-react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

interface Job {
  job_posting_id: string
  job_title: string
  job_description: string
  skills_required: string[]
  created_at: string
}

interface Company {
  company_name: string
  company_logo_url: string | null
}

export default function CompanyJobsPage() {
  const params = useParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyId = params.id
        if (!companyId) return

        let captchaToken = ''
        if (executeRecaptcha) {
          captchaToken = await executeRecaptcha('company_jobs')
        }

        const res = await fetch(`/api/job-postings/public/company/${companyId}`, {
          headers: captchaToken ? { 'X-Captcha-Token': captchaToken } : {}
        })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data?.error || 'Failed to load company jobs')
        
        setJobs(data.jobs || [])
        setCompany(data.company)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id, executeRecaptcha])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!company && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-slate-900">Company not found</h1>
        <Link href="/jobs" className="text-indigo-600 hover:underline mt-4">Back to all jobs</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-slate-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try again</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link 
          href="/jobs" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          All companies
        </Link>

        {company && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12 flex flex-col md:flex-row items-center gap-8">
            {company.company_logo_url ? (
              <img 
                src={company.company_logo_url} 
                alt={company.company_name} 
                className="w-24 h-24 rounded-2xl object-contain bg-slate-50 p-2 border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center border border-indigo-200">
                <Building2 className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
                Careers at {company.company_name}
              </h1>
              <p className="text-lg text-slate-600">
                Join our team and help us build the future.
              </p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          Open Positions ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">No active job openings right now</h2>
            <p className="text-slate-500 mt-2">Please check back later or follow us for updates.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.job_posting_id} className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-slate-200">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-indigo-600 mb-2">
                        {job.job_title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 line-clamp-2 mb-4">
                        {job.job_description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(job.skills_required || []).slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter className="bg-slate-50 md:bg-white md:border-l border-slate-100 flex md:flex-col justify-center items-center p-6 gap-4 min-w-[200px]">
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

        {company && (
          <div className="mt-16 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} {company.company_name}. Powered by OptioHire.</p>
          </div>
        )}
      </div>
    </div>
  )
}
