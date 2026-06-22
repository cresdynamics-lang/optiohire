'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase } from 'lucide-react'

interface Job {
  id: string
  job_posting_id?: string
  job_title: string
  company_name: string
  department?: string
  work_type?: string
  company_logo_url?: string
  slug?: string
}

export function SimilarJobs({ currentJob }: { currentJob: Job }) {
  const [similarJobs, setSimilarJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/jobs')
        if (!res.ok) return
        
        const data = await res.json()
        const allJobs: Job[] = data.jobs || data.data || []
        
        const currentJobId = currentJob.job_posting_id || currentJob.id
        const filtered = allJobs.filter(j => (j.job_posting_id || j.id) !== currentJobId)
        
        // Simple scoring algorithm to find similar jobs
        const currentKeywords = currentJob.job_title.toLowerCase().split(' ')
        const scoredJobs = filtered.map(job => {
          let score = 0
          if (job.department === currentJob.department) score += 5
          if (job.work_type === currentJob.work_type) score += 2
          
          const jobKeywords = job.job_title.toLowerCase().split(' ')
          const matchCount = jobKeywords.filter(k => currentKeywords.includes(k)).length
          score += matchCount * 3
          
          return { job, score }
        })
        
        scoredJobs.sort((a, b) => b.score - a.score)
        setSimilarJobs(scoredJobs.map(s => s.job).slice(0, 3))
      } catch (err) {
        console.error('Failed to fetch similar jobs', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchJobs()
  }, [currentJob])

  if (isLoading || similarJobs.length === 0) return null

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h3 className="mb-6 text-lg font-bold text-slate-900">Similar Jobs</h3>
      <div className="flex flex-col gap-6">
        {similarJobs.map(job => {
          const logoError = false // basic handling
          const initials = job.company_name?.slice(0, 1).toUpperCase() || 'C'
          const jobUrl = job.slug ? `/jobs/${job.slug}` : `/jobs/${job.job_posting_id || job.id}`
          
          return (
            <Link key={job.job_posting_id || job.id} href={jobUrl} className="group flex items-center gap-4">
              {job.company_logo_url ? (
                <img 
                  src={job.company_logo_url} 
                  alt={job.company_name} 
                  className="h-12 w-12 rounded-xl border border-slate-100 object-contain shrink-0" 
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-lg shrink-0 group-hover:bg-blue-100 transition-colors">
                  {initials}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {job.job_title}
                </span>
                <span className="text-xs text-slate-500">
                  {job.company_name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
