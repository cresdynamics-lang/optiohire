import { Request, Response } from 'express'
import { CertificateRepository } from '../repositories/certificateRepository.js'
import { CandidateProfileRepository } from '../repositories/candidateProfileRepository.js'
import { EmailService } from '../services/emailService.js'

const certRepo = new CertificateRepository()
const candidateProfileRepo = new CandidateProfileRepository()
const emailService = new EmailService()

export const getPendingCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const pending = await certRepo.getPendingApprovals()
    res.status(200).json({ success: true, data: pending })
  } catch (error: any) {
    console.error('Error fetching pending certificates:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const approveCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { approvalId, status, rejectionReason } = req.body
    const adminId = (req as any).userId!

    if (!approvalId || !status || (status !== 'APPROVED' && status !== 'REJECTED')) {
      res.status(400).json({ success: false, error: 'Invalid parameters' })
      return
    }

    const updatedApproval = await certRepo.reviewCertificate(approvalId, status, adminId, rejectionReason)

    if (status === 'APPROVED') {
      // Give the student a proficiency score boost (e.g. 50 points)
      await candidateProfileRepo.updateSkillScore(updatedApproval.skill_id, 50, true, updatedApproval.certificate_url)
      
      if (updatedApproval.candidate_email) {
        await emailService.sendCertificateApprovedEmail({
          candidateEmail: updatedApproval.candidate_email,
          candidateName: updatedApproval.candidate_name,
          skillName: updatedApproval.skill_name
        }).catch(err => console.error('Failed to send cert approval email:', err))
      }
    } else if (status === 'REJECTED') {
      if (updatedApproval.candidate_email) {
        await emailService.sendCertificateRejectedEmail({
          candidateEmail: updatedApproval.candidate_email,
          candidateName: updatedApproval.candidate_name,
          skillName: updatedApproval.skill_name,
          rejectionReason: rejectionReason || 'Certificate did not meet our verification requirements.'
        }).catch(err => console.error('Failed to send cert rejection email:', err))
      }
    }

    res.status(200).json({ success: true, message: `Certificate ${status}`, data: updatedApproval })
  } catch (error: any) {
    console.error('Error reviewing certificate:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
