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
    const { rows } = await query(
      `SELECT c.*, s.skill_name, p.user_id, u.name as candidate_name, u.email as candidate_email
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
    
    // Fetch candidate details for email
    const { rows: details } = await query(
      `SELECT s.skill_name, u.email as candidate_email, u.name as candidate_name
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
