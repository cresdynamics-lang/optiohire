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
    const candidate_meta = {
      name: data.candidate_name,
      email: data.email,
      phone: data.phone || null,
      links: {}
    }

    const { rows } = await query<Application>(
      `INSERT INTO applications (
        job_posting_id, company_id, candidate_name, email, resume_url, phone, candidate_meta
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (job_posting_id, email) DO UPDATE SET
        candidate_name = EXCLUDED.candidate_name,
        resume_url = EXCLUDED.resume_url,
        phone = EXCLUDED.phone,
        candidate_meta = jsonb_set(
          COALESCE(applications.candidate_meta, '{}'::jsonb),
          '{name}',
          to_jsonb(EXCLUDED.candidate_name)
        )
      RETURNING *`,
      [
        data.job_posting_id,
        data.company_id,
        data.candidate_name,
        data.email,
        data.resume_url || null,
        data.phone || null,
        JSON.stringify(candidate_meta)
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
    const ai_review = {
      score: data.ai_score,
      status: data.ai_status,
      reasoning: data.reasoning,
      audit_log: data.ai_audit_log || {}
    }

    const { rows } = await query<Application>(
      `UPDATE applications
       SET ai_score = $1, ai_status = $2, reasoning = $3,
           parsed_resume_json = COALESCE($4::jsonb, parsed_resume_json),
           ai_audit_log = COALESCE($5::jsonb, ai_audit_log),
           ai_review = $7::jsonb,
           cv_analysis = jsonb_set(
             COALESCE(cv_analysis, '{}'::jsonb),
             '{parsed_resume}',
             COALESCE($4::jsonb, '{}'::jsonb)
           )
           ${data.embedding ? ', embedding = $8::vector' : ''}
       WHERE application_id = $6
       RETURNING *`,
      data.embedding ? [
        data.ai_score,
        data.ai_status,
        data.reasoning,
        data.parsed_resume_json ? JSON.stringify(data.parsed_resume_json) : null,
        data.ai_audit_log ? JSON.stringify(data.ai_audit_log) : null,
        data.application_id,
        JSON.stringify(ai_review),
        JSON.stringify(data.embedding)
      ] : [
        data.ai_score,
        data.ai_status,
        data.reasoning,
        data.parsed_resume_json ? JSON.stringify(data.parsed_resume_json) : null,
        data.ai_audit_log ? JSON.stringify(data.ai_audit_log) : null,
        data.application_id,
        JSON.stringify(ai_review)
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
       SET parsed_resume_json = $1::jsonb,
           cv_analysis = jsonb_set(
             COALESCE(cv_analysis, '{}'::jsonb),
             '{parsed_resume}',
             $1::jsonb
           ),
           candidate_meta = jsonb_set(
             COALESCE(candidate_meta, '{}'::jsonb),
             '{links}',
             COALESCE($1::jsonb->'links', '{}'::jsonb)
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

