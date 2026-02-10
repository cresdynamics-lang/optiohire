import { query } from '../db/index.js'

export interface Application {
  application_id: string
  job_posting_id: string
  company_id: string | null
  candidate_name: string | null
  email: string
  phone: string | null
  resume_url: string | null
  parsed_resume_json: any | null
  ai_score: number | null
  ai_status: 'SHORTLIST' | 'FLAG' | 'REJECT' | null
  reasoning: string | null
  interview_time: string | null
  interview_link: string | null
  interview_status: string | null
  created_at: string
}

export class ApplicationRepository {
  async create(data: {
    job_posting_id: string
    company_id: string
    candidate_name: string | null
    email: string
    resume_url?: string | null
    phone?: string | null
  }): Promise<Application> {
    const { rows } = await query<Application>(
      `INSERT INTO applications (
        job_posting_id, company_id, candidate_name, email, resume_url, phone
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (job_posting_id, email) DO UPDATE SET
        candidate_name = EXCLUDED.candidate_name,
        resume_url = EXCLUDED.resume_url,
        phone = EXCLUDED.phone
      RETURNING application_id, job_posting_id, company_id, candidate_name, email, phone,
                resume_url, parsed_resume_json, ai_score, ai_status, reasoning,
                interview_time, interview_link, interview_status, created_at`,
      [
        data.job_posting_id,
        data.company_id,
        data.candidate_name,
        data.email,
        data.resume_url || null,
        data.phone || null
      ]
    )
    return rows[0]
  }

  async updateScoring(data: {
    application_id: string
    ai_score: number
    ai_status: 'SHORTLIST' | 'FLAG' | 'REJECT'
    reasoning: string
    parsed_resume_json?: any
  }): Promise<Application> {
    const { rows } = await query<Application>(
      `UPDATE applications
       SET ai_score = $1, ai_status = $2, reasoning = $3,
           parsed_resume_json = COALESCE($4::jsonb, parsed_resume_json)
       WHERE application_id = $5
       RETURNING application_id, job_posting_id, company_id, candidate_name, email, phone,
                 resume_url, parsed_resume_json, ai_score, ai_status, reasoning,
                 interview_time, interview_link, interview_status, created_at`,
      [
        data.ai_score,
        data.ai_status,
        data.reasoning,
        data.parsed_resume_json ? JSON.stringify(data.parsed_resume_json) : null,
        data.application_id
      ]
    )
    if (rows.length === 0) {
      throw new Error('Application not found')
    }
    return rows[0]
  }

  async findByJob(jobPostingId: string): Promise<Application[]> {
    const { rows } = await query<Application>(
      `SELECT application_id, job_posting_id, company_id, candidate_name, email, phone,
              resume_url, parsed_resume_json, ai_score, ai_status, reasoning,
              interview_time, interview_link, interview_status, created_at
       FROM applications
       WHERE job_posting_id = $1
       ORDER BY ai_score DESC NULLS LAST, created_at ASC`,
      [jobPostingId]
    )
    return rows
  }

  async findById(applicationId: string): Promise<Application | null> {
    const { rows } = await query<Application>(
      `SELECT application_id, job_posting_id, company_id, candidate_name, email, phone,
              resume_url, parsed_resume_json, ai_score, ai_status, reasoning,
              interview_time, interview_link, interview_status, created_at
       FROM applications
       WHERE application_id = $1
       LIMIT 1`,
      [applicationId]
    )
    return rows[0] || null
  }

  async updateParsedResume(data: {
    application_id: string
    parsed_resume_json: any
  }): Promise<Application> {
    const { rows } = await query<Application>(
      `UPDATE applications
       SET parsed_resume_json = $1::jsonb
       WHERE application_id = $2
       RETURNING application_id, job_posting_id, company_id, candidate_name, email, phone,
                 resume_url, parsed_resume_json, ai_score, ai_status, reasoning,
                 interview_time, interview_link, interview_status, created_at`,
      [JSON.stringify(data.parsed_resume_json), data.application_id]
    )
    if (rows.length === 0) {
      throw new Error('Application not found')
    }
    return rows[0]
  }

  async scheduleInterview(data: {
    application_id: string
    interview_time: string
    interview_link: string
  }): Promise<Application> {
    const { rows } = await query<Application>(
      `UPDATE applications
       SET interview_time = $1, interview_link = $2, interview_status = 'SCHEDULED'
       WHERE application_id = $3
       RETURNING application_id, job_posting_id, company_id, candidate_name, email, phone,
                 resume_url, parsed_resume_json, ai_score, ai_status, reasoning,
                 interview_time, interview_link, interview_status, created_at`,
      [data.interview_time, data.interview_link, data.application_id]
    )
    if (rows.length === 0) {
      throw new Error('Application not found')
    }
    return rows[0]
  }
}

