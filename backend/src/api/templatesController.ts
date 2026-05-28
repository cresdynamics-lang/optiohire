import type { Response } from 'express'
import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { EMAIL_DEFAULTS } from '../config/emailDefaults.js'

/**
 * Get the company_id associated with the authenticated user
 */
async function getCompanyId(req: AuthRequest): Promise<string | null> {
  if (!req.userId && !req.userEmail) return null

  // Check if user_id column exists in companies table
  const checkColumn = await query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'user_id'
  `)

  if (checkColumn.rows.length > 0 && req.userId) {
    const { rows } = await query<{ company_id: string }>(
      `SELECT company_id FROM companies WHERE user_id = $1 LIMIT 1`,
      [req.userId]
    )
    return rows[0]?.company_id || null
  } else if (req.userEmail) {
    const { rows } = await query<{ company_id: string }>(
      `SELECT company_id FROM companies WHERE hr_email = $1 OR company_email = $1 LIMIT 1`,
      [req.userEmail]
    )
    return rows[0]?.company_id || null
  }
  return null
}

export async function getTemplates(req: AuthRequest, res: Response) {
  try {
    const companyId = await getCompanyId(req)
    if (!companyId) {
      return res.status(403).json({ error: 'Company profile required' })
    }

    const { rows } = await query(
      `SELECT template_type, subject, body_html, body_text FROM company_email_templates WHERE company_id = $1`,
      [companyId]
    )

    // Merge with defaults for prefilling
    const templates = rows.map(r => ({ ...r, is_custom: true }))
    const templateTypes: ('SHORTLIST' | 'REJECT' | 'INTERVIEW')[] = ['SHORTLIST', 'REJECT', 'INTERVIEW']
    
    const result = templateTypes.map(type => {
      const existing = templates.find(t => t.template_type === type)
      if (existing) return existing
      
      const def = EMAIL_DEFAULTS[type]
      return {
        template_type: type,
        subject: def.subject,
        body_html: def.body_html,
        body_text: '',
        is_custom: false
      }
    })

    return res.status(200).json(result)
  } catch (err) {
    console.error('Error fetching templates:', err)
    return res.status(500).json({ error: 'Failed to fetch templates' })
  }
}

export async function saveTemplate(req: AuthRequest, res: Response) {
  try {
    const companyId = await getCompanyId(req)
    if (!companyId) {
      return res.status(403).json({ error: 'Company profile required' })
    }

    const { template_type, subject, body_html, body_text } = req.body
    if (!template_type || !subject || !body_html) {
      return res.status(400).json({ error: 'Missing required fields: template_type, subject, body_html' })
    }

    const validTypes = ['SHORTLIST', 'REJECT', 'INTERVIEW']
    if (!validTypes.includes(template_type)) {
      return res.status(400).json({ error: 'Invalid template type' })
    }

    // Upsert template
    await query(
      `INSERT INTO company_email_templates (company_id, template_type, subject, body_html, body_text)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (company_id, template_type)
       DO UPDATE SET
         subject = EXCLUDED.subject,
         body_html = EXCLUDED.body_html,
         body_text = EXCLUDED.body_text,
         updated_at = now()`,
      [companyId, template_type, subject, body_html, body_text || '']
    )

    return res.status(200).json({ message: 'Template saved successfully' })
  } catch (err) {
    console.error('Error saving template:', err)
    return res.status(500).json({ error: 'Failed to save template' })
  }
}
