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
  customLink: z.string().optional()
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

    const { applicantId, interviewTime, interviewType, location, customLink } = validation.data
    logger.info('Processing interview schedule:', { applicantId, interviewTime, interviewType, location })

    const applicationRepo = new ApplicationRepository()
    const jobPostingRepo = new JobPostingRepository()
    const companyRepo = new CompanyRepository()
    const emailService = new EmailService()

    // Get application
    const application = await applicationRepo.findById(applicantId)
    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    // Check if already shortlisted
    if (application.ai_status !== 'SHORTLIST') {
      return res.status(400).json({ error: 'Only shortlisted candidates can be scheduled for interviews' })
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
      interview_link: dbInterviewLink
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

