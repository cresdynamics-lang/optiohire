/**
 * Send test emails to info@cresdynamics.com using the real EmailService.
 * From address: nelsonochieng516@gmail.com (via MAIL_FROM / RESEND_FROM_EMAIL).
 * Run from backend: npx tsx scripts/send-test-emails.ts
 * Or: NOTIFICATION_TEST_TO=other@email.com npx tsx scripts/send-test-emails.ts
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const TEST_TO = process.env.NOTIFICATION_TEST_TO || 'info@cresdynamics.com'
const TEST_NAME = 'Info' // So salutation is "Dear Info" / "Hello Info"

async function main() {
  const { EmailService } = await import('../src/services/emailService.js')
  const emailService = new EmailService()

  console.log('Sending test emails to:', TEST_TO)
  console.log('From address: nelsonochieng516@gmail.com (MAIL_FROM / RESEND_FROM_EMAIL)\n')

  const jobTitle = 'Senior Developer'
  const companyName = 'Cresdynamics'

  try {
    await emailService.sendShortlistEmail({
      candidateEmail: TEST_TO,
      candidateName: TEST_NAME,
      jobTitle,
      companyName,
      companyEmail: 'nelsonochieng516@gmail.com',
      interviewLink: 'https://meet.example.com/test',
      interviewDate: '2025-02-15',
      interviewTime: '10:00 AM'
    })
    console.log('1. Shortlist email sent (check: Dear Info, from nelsonochieng516@gmail.com)')
  } catch (e: any) {
    console.error('1. Shortlist failed:', e?.message || e)
  }

  try {
    await emailService.sendRejectionEmail({
      candidateEmail: TEST_TO,
      candidateName: TEST_NAME,
      jobTitle,
      companyName,
      companyEmail: 'nelsonochieng516@gmail.com'
    })
    console.log('2. Rejection email sent (check: Dear Info, from nelsonochieng516@gmail.com)')
  } catch (e: any) {
    console.error('2. Rejection failed:', e?.message || e)
  }

  try {
    await emailService.sendEmailVerificationCode(TEST_TO, TEST_NAME, '123456')
    console.log('3. Signup verification email sent (check: Hello Info)')
  } catch (e: any) {
    console.error('3. Verification email failed:', e?.message || e)
  }

  try {
    await emailService.sendWelcomeEmail(TEST_TO, TEST_NAME)
    console.log('4. Welcome email sent (check: Hello Info)')
  } catch (e: any) {
    console.error('4. Welcome email failed:', e?.message || e)
  }

  try {
    await emailService.sendPasswordResetEmail(
      TEST_TO,
      TEST_NAME,
      'https://app.optiohire.com/auth/reset-password?token=test-token'
    )
    console.log('5. Password reset email sent (check: Hello Info)')
  } catch (e: any) {
    console.error('5. Password reset failed:', e?.message || e)
  }

  console.log('\nDone. Check inbox at', TEST_TO, 'for all 5 emails (from nelsonochieng516@gmail.com).')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
