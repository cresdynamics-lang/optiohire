import { useParams } from 'react-router-dom'
import JobDetailClient from '@/components/jobs/job-detail-client'

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return null
  return <JobDetailClient jobId={slug} />
}
