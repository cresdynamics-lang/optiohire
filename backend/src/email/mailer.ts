// Note: Requires npm install nodemailer @types/nodemailer @types/node
import nodemailer from 'nodemailer'

// Type declaration for process.env (avoids requiring @types/node)
declare const process: {
  env: {
    [key: string]: string | undefined
  }
}

const from = 'hirebitapplications@gmail.com'
const host = process.env.SMTP_HOST || 'smtp.gmail.com'
const port = Number(process.env.SMTP_PORT || 587)
const user = process.env.SMTP_USER || from // Default to hirebitapplications@gmail.com
const pass = process.env.SMTP_PASS || ''

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: pass ? { user, pass } : undefined // Only use auth if password is provided
})

export async function sendEmail(opts: { 
  to: string
  subject: string
  text?: string
  html?: string
  attachments?: Array<{ filename: string; content: string | Buffer }>
}) {
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    attachments: opts.attachments
  })
}


