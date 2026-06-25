'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Briefcase, RefreshCw } from 'lucide-react'

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

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/jobs')
      if (!res.ok) return
      
      const data = await res.json()
      const allJobs: Job[] = data.jobs || data.data || []
      
      const currentJobId = currentJob.job_posting_id || currentJob.id
      const filtered = allJobs.filter(j => (j.job_posting_id || j.id) !== currentJobId)
      
      // Simple scoring algorithm to find similar jobs
      const currentKeywords = (currentJob.job_title || '').toLowerCase().split(' ')
      const scoredJobs = filtered.map(job => {
        let score = 0
        if (job.department === currentJob.department) score += 5
        if (job.work_type === currentJob.work_type) score += 2
        
        const jobKeywords = (job.job_title || '').toLowerCase().split(' ')
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
  }, [currentJob.id, currentJob.job_posting_id, currentJob.job_title, currentJob.department, currentJob.work_type])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-32 rounded-lg bg-slate-100 animate-pulse" />
        </div>
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (similarJobs.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Similar Jobs</h3>
        <p className="text-slate-500 mb-6 text-sm">No similar jobs found automatically.</p>
        <button 
          onClick={fetchJobs} 
          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh related roles
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Similar Jobs</h3>
        <button 
          onClick={fetchJobs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg p-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-colors"
          title="Refresh related roles"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="flex flex-col gap-6">
        {similarJobs.map(job => {
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
