import { query } from '../db/index.js'

export interface CertificateApproval {
  approval_id: string
  skill_id: string
  certificate_url: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewed_by: string | null
  rejection_reason: string | null
  submitted_at: string
  reviewed_at: string | null
}

/** Check if a table exists in the public schema */
async function tableExists(tableName: string): Promise<boolean> {
  const { rows } = await query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) as exists`,
    [tableName]
  )
  return rows[0]?.exists === true
}

export class CertificateRepository {
  async submitForApproval(skillId: string, certificateUrl: string): Promise<CertificateApproval> {
    const { rows } = await query<CertificateApproval>(
      `INSERT INTO certificate_approvals (skill_id, certificate_url)
       VALUES ($1, $2)
       RETURNING *`,
      [skillId, certificateUrl]
    )
    return rows[0]
  }

  async getPendingApprovals(): Promise<any[]> {
    // Guard: return empty array if required tables don't exist (schema not yet migrated)
    const tables = ['certificate_approvals', 'candidate_skills', 'candidate_profiles']
    for (const t of tables) {
      if (!(await tableExists(t))) {
        console.warn(`[CertificateRepository] Table "${t}" not found — returning empty pending list`)
        return []
      }
    }

    const { rows: colCheck } = await query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name'`
    )
    const nameField = colCheck.length > 0 ? 'u.name' : 'NULL::text'

    const { rows } = await query(
      `SELECT c.*, s.skill_name, p.user_id, ${nameField} as candidate_name, u.email as candidate_email
       FROM certificate_approvals c
       JOIN candidate_skills s ON c.skill_id = s.skill_id
       JOIN candidate_profiles p ON s.profile_id = p.profile_id
       JOIN users u ON p.user_id = u.user_id
       WHERE c.status = 'PENDING'
       ORDER BY c.submitted_at ASC`
    )
    return rows
  }

  async reviewCertificate(approvalId: string, status: 'APPROVED' | 'REJECTED', reviewedBy: string, reason?: string): Promise<any> {
    const { rows } = await query(
      `UPDATE certificate_approvals
       SET status = $2, reviewed_by = $3, rejection_reason = $4, reviewed_at = NOW()
       WHERE approval_id = $1
       RETURNING *`,
      [approvalId, status, reviewedBy, reason || null]
    )
    if (rows.length === 0) throw new Error('Certificate approval not found')
    
    const { rows: colCheck } = await query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name'`
    )
    const nameField = colCheck.length > 0 ? 'u.name' : 'NULL::text'

    // Fetch candidate details for email
    const { rows: details } = await query(
      `SELECT s.skill_name, u.email as candidate_email, ${nameField} as candidate_name
       FROM candidate_skills s
       JOIN candidate_profiles p ON s.profile_id = p.profile_id
       JOIN users u ON p.user_id = u.user_id
       WHERE s.skill_id = $1`,
      [rows[0].skill_id]
    )
    
    return {
      ...rows[0],
      candidate_email: details[0]?.candidate_email,
      candidate_name: details[0]?.candidate_name,
      skill_name: details[0]?.skill_name
    }
  }
}
