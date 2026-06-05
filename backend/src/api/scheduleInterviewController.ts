import type { Request, Response } from 'express'
import { ApplicationRepository } from '../repositories/applicationRepository.js'
import { JobPostingRepository } from '../repositories/jobPostingRepository.js'

import { CompanyRepository } from '../repositories/companyRepository.js'
import { EmailService } from '../services/emailService.js'
import { GoogleCalendarService } from '../services/googleCalendarService.js'
import { logger } from '../utils/logger.js'
import { cleanJobTitle } from '../utils/jobTitle.js'
import { z } from 'zod'

const scheduleSchema = z.object({
  applicantId: z.string().uuid(),
  interviewTime: z.string().refine((val) => {
    // Accept ISO datetime strings or any valid date string
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, {
    message: 'Invalid date format. Expected ISO datetime string.'
  }),
  interviewType: z.enum(['online', 'in-person']).optional().default('online'),
  location: z.string().optional(),
  customLink: z.string().optional(),
  reminders: z.array(z.string()).optional()
})

export async function scheduleInterview(req: Request, res: Response) {
  try {
    logger.info('Schedule interview request received:', { body: req.body })
    
    const validation = scheduleSchema.safeParse(req.body)
    if (!validation.success) {
      logger.warn('Invalid schedule interview request:', { errors: validation.error.issues })
      return res.status(400).json({
        error: 'Invalid request body',
        details: validation.error.issues
      })
    }

    const { applicantId, interviewTime, interviewType, location, customLink, reminders } = validation.data
    logger.info('Processing interview schedule:', { applicantId, interviewTime, interviewType, location, reminders })

    const applicationRepo = new ApplicationRepository()
    const jobPostingRepo = new JobPostingRepository()
    const companyRepo = new CompanyRepository()
    const emailService = new EmailService()

    // Get application
    const application = await applicationRepo.findById(applicantId)
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    // Check if already shortlisted or flagged
    if (application.ai_status !== 'SHORTLIST' && application.ai_status !== 'FLAG') {
      return res.status(400).json({ error: 'Only shortlisted or flagged candidates can be scheduled for interviews' })
    }

    // Get job posting
    const job = await jobPostingRepo.findById(application.job_posting_id)
    if (!job) {
      return res.status(404).json({ error: 'Job posting not found' })
    }

    // Get company
    const companyId = application.company_id
    if (!companyId) {
      return res.status(404).json({ error: 'Company not found for this application' })
    }
    const company = await companyRepo.findById(companyId)
    if (!company) {
      return res.status(404).json({ error: 'Company not found' })
    }

    let meetingLink = job.meeting_link
    if (interviewType === 'online') {
      if (customLink) {
        meetingLink = customLink
      } else if (!meetingLink) {
        const calendarService = new GoogleCalendarService()
        if (calendarService.isEnabled()) {
          const interviewStart = new Date(interviewTime)
          const interviewEnd = new Date(interviewStart.getTime() + 60 * 60 * 1000)
          try {
            const attendees = [
              application.email,
              company.hr_email,
              company.hiring_manager_email
            ].filter(Boolean) as string[]

            const created = await calendarService.createMeetEvent({
              summary: `${company.company_name || 'Interview'} interview with ${application.candidate_name || application.email}`,
              description: `Interview for ${job.job_title} at ${company.company_name || 'your company'}`,
              start: interviewStart.toISOString(),
              end: interviewEnd.toISOString(),
              attendees
            })

            meetingLink = created.meetingLink
            logger.info('Created Google Meet event for interview', { applicantId, meetingLink })
          } catch (googleErr: any) {
            logger.error('Google Meet event creation failed:', googleErr)
          }
        }
      }

      if (!meetingLink) {
        return res.status(400).json({ error: 'Meeting link not set for this job posting and automated Google Meet scheduling is unavailable' })
      }
    }

    let dbInterviewLink = ''
    if (interviewType === 'in-person' && location) {
      dbInterviewLink = `IN-PERSON|${location}`
      meetingLink = undefined // no link for email
    } else {
      dbInterviewLink = meetingLink || ''
    }

    // Schedule interview
    const updated = await applicationRepo.scheduleInterview({
      application_id: applicantId,
      interview_time: interviewTime,
      interview_link: dbInterviewLink,
      interview_reminders: reminders
    })

    // Return response immediately for fast UX
    logger.info(`Interview scheduled for application ${applicantId} at ${interviewTime}`)
    
    // Send response immediately
    res.status(200).json({
      success: true,
      message: 'Interview scheduled successfully',
      application: updated
    })

    // Send emails asynchronously in the background (fire and forget)
    // This prevents email delays from blocking the API response
    setImmediate(async () => {
      try {
        const resolvedMeetingLink = meetingLink as string
        // Clean job title for email
        const cleanedJobTitle = cleanJobTitle(job.job_title)

        // Format interview date and time
        const interviewDateObj = new Date(interviewTime)
        const interviewDate = interviewDateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        const interviewTimeFormatted = interviewDateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })

        // Generate company email for from address
        const companyEmail = emailService.getCompanyEmail(
          company.company_email,
          company.company_domain,
          company.company_name
        )
        
        const hrEmail = company.company_email || company.hr_email || 'jobs@optiohire.com'
        const candidateName = application.candidate_name || '[Candidate\'s Full Name]'
        const companyName = company.company_name || '[Company Name]'
        
        // Email candidate - Final Interview Invitation
        await emailService.sendInterviewSchedule({
          candidate_email: application.email,
          jobTitle: cleanedJobTitle,
          meeting_time: interviewTime,
          meetingLink: meetingLink,
          location: location,
          interviewType: interviewType,
          candidateName: candidateName,
          companyName: companyName
        })

        // Email HR
        await emailService.sendHRInterviewConfirmation({
          hr_email: company.hr_email || hrEmail,
          candidate: {
            name: candidateName,
            email: application.email
          },
          time: interviewTime,
          jobTitle: job.job_title,
          meetingLink: meetingLink,
          location: location,
          interviewType: interviewType,
          companyName: companyName
        })

        logger.info(`Interview confirmation emails sent for application ${applicantId}`)
      } catch (err: any) {
        logger.error(`Error sending interview confirmation emails for application ${applicantId}:`, err)
      }
    })
  } catch (error: any) {
    logger.error('Failed to schedule interview:', error)
    return res.status(500).json({
      error: 'Failed to schedule interview',
      details: error.message
    })
  }
}


export async function updateInterview(req: Request, res: Response) {
  try {
    logger.info('Update interview request received:', { body: req.body })
    
    const validation = scheduleSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validation.error.issues })
    }

    const { applicantId, interviewTime, interviewType, location, customLink, reminders } = validation.data
    const applicationRepo = new ApplicationRepository()
    const jobPostingRepo = new JobPostingRepository()
    const companyRepo = new CompanyRepository()
    const emailService = new EmailService()

    const application = await applicationRepo.findById(applicantId)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    const job = await jobPostingRepo.findById(application.job_posting_id)
    if (!job) return res.status(404).json({ error: 'Job not found' })

    const companyId = application.company_id
    if (!companyId) return res.status(404).json({ error: 'Company not found' })
    const company = await companyRepo.findById(companyId)
    if (!company) return res.status(404).json({ error: 'Company not found' })

    let meetingLink = application.interview_link
    if (interviewType === 'online' && customLink) {
      meetingLink = customLink
    }
    
    let dbInterviewLink = ''
    if (interviewType === 'in-person' && location) {
      dbInterviewLink = 'IN-PERSON|' + location
      meetingLink = undefined
    } else {
      dbInterviewLink = meetingLink || ''
    }

    const updated = await applicationRepo.updateInterview({
      application_id: applicantId,
      interview_time: interviewTime,
      interview_link: dbInterviewLink,
      interview_reminders: reminders
    })

    res.status(200).json({ success: true, message: 'Interview updated successfully', application: updated })

    setImmediate(async () => {
      try {
        const cleanedJobTitle = cleanJobTitle(job.job_title)
        const hrEmail = company.company_email || company.hr_email || 'jobs@optiohire.com'
        const candidateName = application.candidate_name || 'Candidate'
        const companyName = company.company_name || 'Company'

        await emailService.sendInterviewUpdated(
          application.email,
          hrEmail,
          interviewTime,
          cleanedJobTitle
        );

        await emailService.sendHRInterviewUpdated(
          hrEmail,
          candidateName,
          interviewTime,
          cleanedJobTitle
        );

        logger.info('Update interview logic succeeded.');
      } catch (err: any) {
        logger.error('Error in update interview background job:', err)
      }
    })
  } catch (error: any) {
    logger.error('Failed to update interview:', error)
    return res.status(500).json({ error: 'Failed to update interview', details: error.message })
  }
}


/**
 * POST /api/schedule-interview/bulk
 */


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
        subject: `❌ Interview Rejected by ${application.candidate_name || 'Candidate'}`,
        html: `
          <h2>Interview Rejected</h2>
          <p><strong>Candidate:</strong> ${application.candidate_name || 'Candidate'}</p>
          <p><strong>Job Role:</strong> ${job.job_title}</p>
          <p><strong>Reason Provided:</strong> ${reason || 'No reason provided'}</p>
          <br/>
          <p>Please log in to the dashboard to proceed with other candidates.</p>
        `,
        text: `Interview Rejected by ${application.candidate_name}`
      })
    }

    return res.status(200).json({ message: 'Interview rejected successfully' })
  } catch (error) {
    logger.error('Error rejecting interview:', error)
    return res.status(500).json({ error: 'Failed to reject interview' })
  }
}
