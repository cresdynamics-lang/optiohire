/**
 * Resend job creation email to Cres Dynamics
 * Run: cd backend && npx tsx ../scripts/resend-cres-dynamics-email.ts
 */

import { query, pool } from '../backend/src/db/index.js'
import { EmailService } from '../backend/src/services/emailService.js'

async function resendEmail() {
  try {
    // Find Cres Dynamics job posting
    const { rows: jobRows } = await query<{
      job_posting_id: string
      job_title: string
      application_deadline: string | null
      company_id: string
      company_name: string
      company_email: string
      hr_email: string
      hiring_manager_email: string | null
    }>(
      `SELECT 
        jp.job_posting_id,
        jp.job_title,
        jp.application_deadline,
        c.company_id,
        c.company_name,
        c.company_email,
        c.hr_email,
        c.hiring_manager_email
      FROM job_postings jp
      JOIN companies c ON jp.company_id = c.company_id
      WHERE LOWER(c.company_name) LIKE LOWER($1)
      ORDER BY jp.created_at DESC
      LIMIT 1`,
      ['%Cres Dynamics%']
    )

    if (jobRows.length === 0) {
      console.log('❌ No job posting found for Cres Dynamics')
      await pool.end()
      return
    }

    const job = jobRows[0]
    console.log(`✅ Found job: ${job.job_title} at ${job.company_name}`)
    console.log(`   Job ID: ${job.job_posting_id}`)
    console.log(`   Company Email: ${job.company_email}`)
    console.log(`   HR Email: ${job.hr_email}`)

    // Collect recipients
    const recipients = new Set<string>()
    
    if (job.hr_email && job.hr_email.includes('@')) {
      recipients.add(job.hr_email)
    }
    if (job.company_email && job.company_email.includes('@')) {
      recipients.add(job.company_email)
    }
    if (job.hiring_manager_email && job.hiring_manager_email.includes('@')) {
      recipients.add(job.hiring_manager_email)
    }

    // Get users associated with this company
    try {
      const { rows: colCheck } = await query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'user_id'
      `)

      if (colCheck.length > 0) {
        const { rows: userRows } = await query<{ email: string }>(
          `SELECT DISTINCT u.email
           FROM users u
           JOIN companies c ON c.user_id = u.user_id
           WHERE c.company_id = $1::uuid AND u.is_active = true`,
          [job.company_id]
        )
        userRows.forEach(user => {
          if (user.email && user.email.includes('@')) {
            recipients.add(user.email)
          }
        })
      }

      const { rows: emailMatchUsers } = await query<{ email: string }>(
        `SELECT DISTINCT u.email
         FROM users u
         JOIN companies c ON (c.hr_email = u.email OR c.company_email = u.email)
         WHERE c.company_id = $1::uuid AND u.is_active = true`,
        [job.company_id]
      )
      emailMatchUsers.forEach(user => {
        if (user.email && user.email.includes('@')) {
          recipients.add(user.email)
        }
      })
    } catch (userErr) {
      console.error('Error fetching users:', userErr)
    }

    const recipientList = Array.from(recipients)

    if (recipientList.length === 0) {
      console.log('❌ No valid email recipients found')
      await pool.end()
      return
    }

    console.log(`\n📧 Sending email to ${recipientList.length} recipient(s):`)
    recipientList.forEach(email => console.log(`   - ${email}`))

    // Send email
    const emailService = new EmailService()
    await emailService.sendJobPostingCreatedEmail({
      recipients: recipientList,
      jobTitle: job.job_title,
      companyName: job.company_name,
      applicationDeadline: job.application_deadline || new Date().toISOString()
    })

    console.log(`\n✅ Email sent successfully!`)
    console.log(`   Job: ${job.job_title}`)
    console.log(`   Company: ${job.company_name}`)
    console.log(`   Recipients: ${recipientList.join(', ')}`)

    await pool.end()
  } catch (err) {
    console.error('❌ Error:', err)
    await pool.end()
    process.exit(1)
  }
}

resendEmail()
