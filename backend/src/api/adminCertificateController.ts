import { Request, Response } from 'express'
import { CertificateRepository } from '../repositories/certificateRepository.js'
import { CandidateProfileRepository } from '../repositories/candidateProfileRepository.js'

const certRepo = new CertificateRepository()
const candidateProfileRepo = new CandidateProfileRepository()

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
    }

    res.status(200).json({ success: true, message: `Certificate ${status}`, data: updatedApproval })
  } catch (error: any) {
    console.error('Error reviewing certificate:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
