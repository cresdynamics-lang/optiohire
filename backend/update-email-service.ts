import fs from 'fs'
import path from 'path'
const file = path.join(process.cwd(), 'src/services/emailService.ts')
let content = fs.readFileSync(file, 'utf8')

// Beautiful HTML Template
const beautifulHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #2D2DDD, #4F46E5); color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .details-row { display: flex; margin-bottom: 12px; }
    .details-label { font-weight: 600; color: #4b5563; width: 100px; flex-shrink: 0; }
    .details-value { color: #111827; font-weight: 500; }
    .button { display: inline-block; padding: 14px 28px; background: #2D2DDD; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; width: calc(100% - 56px); margin: 0; }
    .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Interview \${titlePrefix}</h1>
    </div>
    <div class="content">
      <p>Hi \${data.candidateName || 'Candidate'},</p>
      <p>\${data.companyName || 'The team'} has \${actionVerb} your interview for the <strong>\${data.jobTitle}</strong> position.</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Date & Time:</div>
          <div class="details-value"><strong>\${new Date(data.meeting_time).toLocaleString()}</strong></div>
        </div>
        <div class="details-row">
          <div class="details-label">Type:</div>
          <div class="details-value">\${data.interviewType === 'in-person' ? '📍 In-Person' : '🎥 Online'}</div>
        </div>
        \${data.interviewType === 'in-person' ? \`
        <div class="details-row">
          <div class="details-label">Location:</div>
          <div class="details-value">\${data.location}</div>
        </div>
        \` : ''}
      </div>

      \${data.interviewType === 'online' && data.meetingLink ? \`
        <a href="\${data.meetingLink}" class="button">Join Video Meeting</a>
      \` : ''}
      
      \${data.interviewType === 'in-person' && data.location ? \`
        <a href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(data.location)}" class="button">View on Google Maps</a>
      \` : ''}
    </div>
    <div class="footer">
      <p>Please be prepared 5 minutes before the scheduled time.</p>
      <p>Best regards,<br>\${data.companyName || 'Hiring Team'}</p>
    </div>
  </div>
</body>
</html>
`

// Same for HR
const hrBeautifulHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; }
    .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .details-row { display: flex; margin-bottom: 12px; }
    .details-label { font-weight: 600; color: #4b5563; width: 100px; flex-shrink: 0; }
    .details-value { color: #111827; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Interview \${titlePrefix}</h1>
    </div>
    <div class="content">
      <p>Hi Team,</p>
      <p>An interview has been successfully \${actionVerb} with <strong>\${data.candidate.name || 'Candidate'}</strong> for the <strong>\${data.jobTitle}</strong> position.</p>
      
      <div class="details-box">
        <div class="details-row">
          <div class="details-label">Date & Time:</div>
          <div class="details-value"><strong>\${new Date(data.time).toLocaleString()}</strong></div>
        </div>
        <div class="details-row">
          <div class="details-label">Type:</div>
          <div class="details-value">\${data.interviewType === 'in-person' ? '📍 In-Person' : '🎥 Online'}</div>
        </div>
        \${data.interviewType === 'in-person' ? \`
        <div class="details-row">
          <div class="details-label">Location:</div>
          <div class="details-value">\${data.location}</div>
        </div>
        \` : ''}
        \${data.interviewType === 'online' && data.meetingLink ? \`
        <div class="details-row">
          <div class="details-label">Meeting Link:</div>
          <div class="details-value">\${data.meetingLink}</div>
        </div>
        \` : ''}
      </div>
    </div>
  </div>
</body>
</html>
`

// Update sendInterviewSchedule
content = content.replace(
  /const html = \`[\s\S]*?\`(?=\n\n\s*const text =)/,
  `const titlePrefix = 'Scheduled'
    const actionVerb = 'scheduled'
    const html = \`${beautifulHtml}\``
)

// Update sendHRInterviewConfirmation
content = content.replace(
  /const html = \`[\s\S]*?\`(?=\n\n\s*const text =)/,
  `const titlePrefix = 'Scheduled'
    const actionVerb = 'scheduled'
    const html = \`${hrBeautifulHtml}\``
)

fs.writeFileSync(file, content)
console.log('Beautiful HTML Emails updated!')
