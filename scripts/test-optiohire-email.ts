/**
 * Test email sending with optiohire.com domain
 * Run: cd backend && npx tsx ../scripts/test-optiohire-email.ts
 */

import '../backend/src/utils/env.js'
import { EmailService } from '../backend/src/services/emailService.js'

async function testEmail() {
  try {
    console.log('📧 Testing email sending with optiohire.com domain...\n')
    console.log(`From Email: ${process.env.RESEND_FROM_EMAIL || 'not set'}`)
    console.log(`Domain: ${process.env.RESEND_DOMAIN || 'not set'}\n`)

    const emailService = new EmailService()
    
    // Test email to the applications email address
    const testRecipient = process.env.APPLICATIONS_EMAIL || 'applicationsoptiohire@gmail.com'
    
    console.log(`Sending test email to: ${testRecipient}`)
    console.log('Subject: OptioHire Domain Verification Test\n')

    await emailService.sendEmail({
      to: testRecipient,
      subject: 'OptioHire Domain Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0d9488;">✅ OptioHire Email Test</h1>
          <p>This is a test email to verify that <strong>optiohire.com</strong> domain is verified and working in Resend.</p>
          <p><strong>From:</strong> ${process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'}</p>
          <p><strong>Domain:</strong> ${process.env.RESEND_DOMAIN || 'optiohire.com'}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            If you received this email, it means optiohire.com domain is verified and emails are sending successfully via Resend!
          </p>
        </div>
      `,
      text: `
OptioHire Email Test

This is a test email to verify that optiohire.com domain is verified and working in Resend.

From: ${process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'}
Domain: ${process.env.RESEND_DOMAIN || 'optiohire.com'}
Time: ${new Date().toISOString()}

If you received this email, it means optiohire.com domain is verified and emails are sending successfully via Resend!
      `,
      emailType: 'test'
    })

    console.log('✅ Test email sent successfully!')
    console.log('\n📬 Check your inbox at:', testRecipient)
    console.log('   If you see the email, optiohire.com is verified and working!')
    console.log('\n💡 Note: Check backend logs to see if email was sent via Resend or SMTP fallback')
    console.log('   - If Resend: Domain is verified ✅')
    console.log('   - If SMTP fallback: Domain may not be verified yet ⚠️')

  } catch (err: any) {
    console.error('❌ Error sending test email:', err.message)
    console.error('\nFull error:', err)
    
    if (err.message?.includes('domain is not verified')) {
      console.error('\n⚠️  Domain verification issue detected!')
      console.error('   Please verify optiohire.com in Resend dashboard: https://resend.com/domains')
    } else if (err.message?.includes('Resend')) {
      console.error('\n⚠️  Resend API issue - check your API keys and domain verification')
    }
    
    process.exit(1)
  }
}

testEmail()
