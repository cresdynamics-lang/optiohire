export const EMAIL_DEFAULTS = {
  SHORTLIST: {
    subject: "You've been shortlisted – {{job_title}} - {{company_name}}",
    body_html: `
<p>Dear {{candidate_name}},</p>

<p>Congratulations! After reviewing your application for the <strong>{{job_title}}</strong> position - <strong>{{company_name}}</strong>, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.</p>

<p>Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled. You do not need to take any action at this time.</p>

<p>If you have any questions, feel free to contact our HR team at <a href="mailto:{{hr_email}}">{{hr_email}}</a>.</p>

<p>We look forward to meeting you and learning more about how you can contribute to our team. Thank you!</p>

<p>Kind regards,<br>
<strong>{{company_name}}</strong><br>
<strong>Company Email:</strong> {{hr_email}}</p>
    `.trim()
  },
  REJECT: {
    subject: "Update on Your Application for the {{job_title}} Position - {{company_name}}",
    body_html: `
<p>Dear {{candidate_name}},</p>

<p>Thank you for taking the time to apply for the <strong>{{job_title}}</strong> position - <strong>{{company_name}}</strong> and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.</p>

<p>After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.</p>

<p>Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within <strong>{{company_name}}</strong>.</p>

<p>If you have any questions or would like feedback regarding your application, please feel free to contact us at <a href="mailto:{{hr_email}}">{{hr_email}}</a>.</p>

<p>We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.</p>

<p>Kind regards,<br>
<strong>Company Name:</strong> {{company_name}}<br>
<strong>Company Email:</strong> {{hr_email}}</p>
    `.trim()
  },
  INTERVIEW: {
    subject: "Interview Scheduled - {{job_title}}",
    body_html: `
<p>Hi {{candidate_name}},</p>
<p>Your interview for <strong>{{job_title}}</strong> at <strong>{{company_name}}</strong> has been scheduled.</p>
<div style="background: white; padding: 15px; border-left: 4px solid #2D2DDD; margin: 15px 0;">
  <p><strong>Date & Time:</strong> {{interview_date}} at {{interview_time}}</p>
  <p><strong>Meeting Link:</strong> <a href="{{interview_link}}">Join Interview</a></p>
</div>
<p>Please arrive 5 minutes early and have your documents ready.</p>
<p>Best regards,<br>{{company_name}}</p>
    `.trim()
  }
}
