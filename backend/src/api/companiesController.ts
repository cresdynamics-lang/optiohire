import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { createCompanyReportPdf } from '../utils/pdf.js'
import { sendEmail } from '../email/mailer.js'
import type { AuthRequest } from '../middleware/auth.js'

export async function createCompany(req: Request, res: Response) {
  try {
    const { company_name, company_domain, company_email, hr_email, hiring_manager_email } = req.body || {}
    const domain = company_domain || (company_email && company_email.includes('@') ? company_email.split('@')[1] : null)
    if (!company_name || !hr_email || !hiring_manager_email) {
      return res.status(400).json({ error: 'Missing required fields: company_name, hr_email, hiring_manager_email' })
    }
    if (!domain && !company_domain) {
      return res.status(400).json({ error: 'Missing company_domain or company_email (for domain)' })
    }
    const authReq = req as AuthRequest
    const userId = authReq.userId ?? null
    const cols = ['company_name', 'hr_email', 'hiring_manager_email', 'company_domain']
    const vals = ['$1', '$2', '$3', '$4']
    const params: unknown[] = [company_name, hr_email, hiring_manager_email, domain || company_domain]
    let n = 5
    if (userId) {
      const { rows: colCheck } = await query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_id'`
      )
      if (colCheck.length > 0) {
        cols.push('user_id')
        vals.push(`$${n}`)
        params.push(userId)
        n++
      }
    }
    const hasCompanyEmail = await query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'company_email'`
    ).then(r => r.rows.length > 0)
    if (hasCompanyEmail) {
      cols.push('company_email')
      vals.push(`$${n}`)
      params.push(company_email || hr_email)
    }
    const { rows } = await query<{ company_id: string }>(
      `insert into companies (${cols.join(', ')}) values (${vals.join(', ')}) returning company_id`,
      params
    )
    const companyId = rows[0].company_id
    await query(
      `insert into audit_logs (action, company_id, metadata)
       values ('COMPANY_CREATED',$1,$2::jsonb)`,
      [companyId, JSON.stringify({ company_name, company_domain })]
    )
    return res.status(201).json({ company_id: companyId })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create company' })
  }
}

export async function getCompanyReport(req: Request, res: Response) {
  try {
    const companyId = req.params.id
    const { rows: companyRows } = await query(
      `select company_name, hr_email, hiring_manager_email
       from companies where company_id = $1`,
      [companyId]
    )
    if (companyRows.length === 0) {
      return res.status(404).json({ error: 'Company not found' })
    }
    const company = companyRows[0] as { company_name: string; hr_email: string; hiring_manager_email: string }

    const { rows: jobStats } = await query(
      `select j.job_posting_id, j.job_title,
              count(a.application_id) as total_applicants,
              count(*) filter (where a.ai_status = 'SHORTLIST') as shortlisted,
              count(*) filter (where a.ai_status = 'FLAG') as flagged,
              count(*) filter (where a.ai_status = 'REJECT') as rejected
       from job_postings j
       left join applications a on a.job_posting_id = j.job_posting_id
       where j.company_id = $1
       group by j.job_posting_id, j.job_title
       order by j.job_title`,
      [companyId]
    )

    const pdf = await createCompanyReportPdf(company.company_name, jobStats as any[])

    await sendEmail({
      to: [company.hr_email, company.hiring_manager_email].filter(Boolean).join(','),
      subject: `Hiring Report - ${company.company_name}`,
      text: 'Attached is your latest hiring report.',
      attachments: [{ filename: 'hiring-report.pdf', content: pdf }]
    })

    return res.status(200).json({ message: 'Report generated and emailed' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate report' })
  }
}


