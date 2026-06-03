import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'src/api/scheduleInterviewController.ts')
let content = fs.readFileSync(file, 'utf8')

// Remove CompanyUserRepository import
content = content.replace(/import { CompanyUserRepository } from '\.\.\/repositories\/userRepository\.js'/g, '')

const newBulk = `
export async function bulkScheduleInterview(req: Request, res: Response) {
  try {
    const authReq = req as any
    const companyId = authReq.userCompanyId
    const { applicantIds, ...scheduleData } = req.body

    if (!companyId) return res.status(403).json({ error: 'Only HR can bulk schedule' })
    if (!applicantIds || !Array.isArray(applicantIds)) {
      return res.status(400).json({ error: 'applicantIds must be an array' })
    }

    const applicationRepo = new ApplicationRepository()
    const jobPostingRepo = new JobPostingRepository()
    const companyRepo = new CompanyRepository()
    const emailService = new EmailService()

    const company = await companyRepo.findById(companyId)
    if (!company) return res.status(404).json({ error: 'Company not found' })

    for (const applicantId of applicantIds) {
      const application = await applicationRepo.findById(applicantId)
      if (!application) continue

      const job = await jobPostingRepo.findById(application.job_posting_id)
      if (!job) continue

      const interviewData = scheduleSchema.parse({ ...scheduleData, applicantId })
      
      let finalLink = interviewData.customLink || null
      if (interviewData.interviewType === 'online' && !finalLink) {
        finalLink = job.meeting_link || 'https://meet.google.com/new'
      }

      await applicationRepo.updateInterview({
        application_id: application.application_id,
        interview_time: interviewData.interviewTime,
        interview_link: finalLink,
        interview_reminders: interviewData.reminders
      })

      await emailService.sendInterviewSchedule({
        candidate_email: application.email,
        candidateName: application.candidate_name || 'Candidate',
        jobTitle: job.job_title,
        companyName: company.company_name,
        meeting_time: interviewData.interviewTime,
        meetingLink: finalLink,
        interviewType: interviewData.interviewType as 'online' | 'in-person',
        location: interviewData.location
      })
      
      if (company.hr_email) {
        await emailService.sendHRInterviewConfirmation({
          hr_email: company.hr_email,
          candidate: {
            name: application.candidate_name || 'Candidate',
            email: application.email
          },
          jobTitle: job.job_title,
          time: interviewData.interviewTime,
          interviewType: interviewData.interviewType as 'online' | 'in-person',
          location: interviewData.location,
          meetingLink: finalLink
        })
      }
    }

    return res.status(200).json({ message: 'Bulk scheduled successfully', scheduledCount: applicantIds.length })
  } catch (error) {
    logger.error('Error in bulkScheduleInterview:', error)
    res.status(500).json({ error: 'Failed to bulk schedule' })
  }
}
`

const newReject = `
export async function rejectInterview(req: Request, res: Response) {
  try {
    const authReq = req as any
    const applicationId = req.params.id
    const { reason } = req.body

    const applicationRepo = new ApplicationRepository()
    const jobPostingRepo = new JobPostingRepository()
    const companyRepo = new CompanyRepository()

    const application = await applicationRepo.findById(applicationId)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    const job = await jobPostingRepo.findById(application.job_posting_id)
    if (!job) return res.status(404).json({ error: 'Job not found' })

    await applicationRepo.updateInterviewStatus({
      application_id: applicationId,
      status: 'REJECTED',
      rejection_reason: reason
    })

    const emailService = new EmailService()
    const company = await companyRepo.findById(job.company_id)
    
    if (company && company.hr_email) {
      await emailService.sendEmail({
        to: company.hr_email,
        subject: \`❌ Interview Rejected by \${application.candidate_name || 'Candidate'}\`,
        html: \`
          <h2>Interview Rejected</h2>
          <p><strong>Candidate:</strong> \${application.candidate_name || 'Candidate'}</p>
          <p><strong>Job Role:</strong> \${job.job_title}</p>
          <p><strong>Reason Provided:</strong> \${reason || 'No reason provided'}</p>
          <br/>
          <p>Please log in to the dashboard to proceed with other candidates.</p>
        \`,
        text: \`Interview Rejected by \${application.candidate_name}\`
      })
    }

    return res.status(200).json({ message: 'Interview rejected successfully' })
  } catch (error) {
    logger.error('Error rejecting interview:', error)
    return res.status(500).json({ error: 'Failed to reject interview' })
  }
}
`

content = content.replace(/export async function bulkScheduleInterview[\s\S]*?(?=export async function rejectInterview)/, newBulk)
content = content.replace(/export async function rejectInterview[\s\S]*$/, newReject)

fs.writeFileSync(file, content)
console.log('Clean replacement done')
