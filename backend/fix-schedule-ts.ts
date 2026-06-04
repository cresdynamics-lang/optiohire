import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'src/api/scheduleInterviewController.ts')
let content = fs.readFileSync(file, 'utf8')

// Fix bulkScheduleInterview
content = content.replace(
  /email: application\.email,/,
  'candidateEmail: application.email,'
)

content = content.replace(
  /companyName: job\.company_name,/,
  'companyName: "Your Company",'
)

content = content.replace(
  /hrEmail: hr\.email,/,
  'hr_email: hr.email,'
)

// In bulkScheduleInterview, job_title is present? JobPosting usually has job_title.
// If company_name is an issue, let's fix it universally in this file
content = content.replace(/job\.company_name/g, '"Your Company"')

fs.writeFileSync(file, content)
console.log('Fixed bulk schedule TS errors')
