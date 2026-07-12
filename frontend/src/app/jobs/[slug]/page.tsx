import { Metadata } from 'next'
import JobDetailClient from '@/components/jobs/job-detail-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Use absolute URL for the fallback image
  const fallbackImage = 'https://optiohire.com/assets/logo/optiohire_logo_white.jpg';

  try {
    const backendUrl = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com').replace(/\/$/, '')
    const res = await fetch(`${backendUrl}/jobs/${slug}`, { next: { revalidate: 3600 } })
    const data = await res.json()
    
    // We don't have job title yet, so we use the static fallback image for error cases
    const staticFallback = 'https://optiohire.com/assets/logo/optiohire_logo_white.jpg';

    if (!res.ok || !data.job) {
      return { 
        title: 'Job Opportunity | OptioHire',
        description: 'View this job opportunity and apply on OptioHire.',
        openGraph: {
          title: 'Job Opportunity | OptioHire',
          description: 'View this job opportunity and apply on OptioHire.',
          images: [{ url: staticFallback }],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Job Opportunity | OptioHire',
          description: 'View this job opportunity and apply on OptioHire.',
          images: [staticFallback],
        }
      }
    }

    const job = data.job
    const title = `${job.job_title} at ${job.company_name} | OptioHire`
    const description = `Apply for the ${job.job_title} position at ${job.company_name}. ${job.job_description?.slice(0, 150) || ''}...`
    
    // Use the dynamic API as the fallback
    const dynamicOgImage = `https://optiohire.com/api/og/job?title=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.company_name)}`;
    
    // Choose the best available image: poster > company logo > dynamic OG image
    let ogImage = job.job_poster_url || job.company_logo_url || dynamicOgImage;
    if (ogImage && ogImage.startsWith('/')) {
      ogImage = `${backendUrl}${ogImage}`;
    }
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        images: [{ url: ogImage }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      }
    }
  } catch (error) {
    return { 
      title: 'Job Opportunity | OptioHire',
      description: 'View this job opportunity and apply on OptioHire.',
      openGraph: {
        title: 'Job Opportunity | OptioHire',
        description: 'View this job opportunity and apply on OptioHire.',
        images: [{ url: fallbackImage }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Job Opportunity | OptioHire',
        description: 'View this job opportunity and apply on OptioHire.',
        images: [fallbackImage],
      }
    }
  }
}

export default async function JobDetailPage({ params }: Props) {
  const resolvedParams = await params;
  return <JobDetailClient jobId={resolvedParams.slug} />
}
