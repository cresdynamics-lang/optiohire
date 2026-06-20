const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return ''
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com'
}

export interface JobPosting {
  job_posting_id: string
  company_id: string
  job_title: string
  job_description: string
  responsibilities?: string
  skills_required: string[]
  application_deadline: string | null
  status: string
  created_at: string
  company_name: string
  company_logo_url: string | null
  company_domain?: string | null
}

export async function getPublicJobPostings(): Promise<JobPosting[]> {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/job-postings/public`, {
      next: { revalidate: 0 } // Disable cache temporarily to ensure users see new jobs instantly
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.jobs || []
  } catch (error) {
    console.error('Error fetching public jobs:', error)
    return []
  }
}

export async function getPublicJobPostingById(id: string): Promise<JobPosting | null> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/job-postings/public/${id}`, {
      next: { revalidate: 0 }
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.job || null
  } catch (error) {
    console.error('Error fetching public job:', error)
    return null
  }
}

export async function getPublicCompanyJobPostings(companyId: string): Promise<{ jobs: JobPosting[], company: any }> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/job-postings/public/company/${companyId}`, {
      next: { revalidate: 0 }
    })
    if (!response.ok) return { jobs: [], company: null }
    return await response.json()
  } catch (error) {
    console.error('Error fetching public company jobs:', error)
    return { jobs: [], company: null }
  }
}

export async function submitApplication(data: {
  job_posting_id: string
  candidate_name: string
  email: string
  resume_url: string
  cover_letter?: string
  phone?: string
  github_url?: string
  linkedin_url?: string
  portfolio_url?: string
  captchaToken?: string
}) {
  const response = await fetch(`${getBaseUrl()}/api/applications/public-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.error || 'Failed to submit application')
  }
  return result
}

export async function uploadPublicResume(file: File, captchaToken?: string) {
  const formData = new FormData()
  formData.append('document', file)

  const headers: Record<string, string> = {}
  if (captchaToken) {
    headers['X-Captcha-Token'] = captchaToken
  }

  const response = await fetch(`${getBaseUrl()}/api/upload/public-candidate-document`, {
    method: 'POST',
    headers,
    body: formData
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.error || 'Failed to upload resume')
  }
  return result
}
