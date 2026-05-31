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
  ai_audit_log: any | null
  interview_time: string | null
  interview_link: string | null
  interview_status: string | null
  created_at: string
  // Hybrid Normalized Fields
  candidate_meta: any | null
  cv_analysis: any | null
  ai_review: any | null
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
    const nameParts = (data.candidate_name || '').trim().split(/\s+/);
    const first_name = nameParts[0] || 'Unknown';
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

    const { rows } = await query<Application>(
      `INSERT INTO applications (
        job_posting_id, first_name, last_name, email, resume_url
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        data.job_posting_id,
        first_name,
        last_name,
        data.email.toLowerCase(),
        data.resume_url || null
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
    embedding?: number[]
    ai_audit_log?: any
  }): Promise<Application> {
    const ai_profile = {
      score: data.ai_score,
      status: data.ai_status,
      reasoning: data.reasoning,
      parsed_resume: data.parsed_resume_json || null,
      audit_log: data.ai_audit_log || {}
    }

    const { rows } = await query<Application>(
      `UPDATE applications
       SET ai_score = $1,
           ai_profile = $2::jsonb
       WHERE application_id = $3
       RETURNING *`,
      [
        data.ai_score,
        JSON.stringify(ai_profile),
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
      `SELECT *
       FROM applications
       WHERE job_posting_id = $1
       ORDER BY ai_score DESC NULLS LAST, created_at ASC`,
      [jobPostingId]
    )
    return rows
  }

  async findById(applicationId: string): Promise<Application | null> {
    const { rows } = await query<Application>(
      `SELECT *
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
       SET ai_profile = jsonb_set(
             COALESCE(ai_profile, '{}'::jsonb),
             '{parsed_resume}',
             $1::jsonb
           )
       WHERE application_id = $2
       RETURNING *`,
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
       RETURNING *`,
      [data.interview_time, data.interview_link, data.application_id]
    )
    if (rows.length === 0) {
      throw new Error('Application not found')
    }
    return rows[0]
  }
}

