import { Metadata } from 'next'
import JobDetailClient from '@/components/jobs/job-detail-client'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id
  
  try {
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com').replace(/\/$/, '')
    const res = await fetch(`${backendUrl}/jobs/${id}`, { next: { revalidate: 3600 } })
    const data = await res.json()
    
    if (!res.ok || !data.job) {
      return { title: 'Job Opportunity | OptioHire' }
    }

    const job = data.job
    const title = `${job.job_title} at ${job.company_name} | OptioHire`
    const description = `Apply for the ${job.job_title} position at ${job.company_name}. ${job.job_description.slice(0, 150)}...`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: job.job_poster_url ? [{ url: job.job_poster_url }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: job.job_poster_url ? [job.job_poster_url] : [],
      }
    }
  } catch (error) {
    return { title: 'Job Opportunity | OptioHire' }
  }
}

export default function JobDetailPage({ params }: Props) {
  return <JobDetailClient jobId={params.id} />
}
