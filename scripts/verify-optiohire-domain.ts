/**
 * Verify if optiohire.com is verified in Resend
 * Run: cd backend && npx tsx ../scripts/verify-optiohire-domain.ts
 */

import '../backend/src/utils/env.js'
import { ResendService } from '../backend/src/services/resendService.js'

async function verifyDomain() {
  try {
    console.log('🔍 Checking if optiohire.com is verified in Resend...\n')

    const resendService = new ResendService()
    
    // Verify connection and get domains
    const isConnected = await resendService.verifyConnection()
    
    if (!isConnected) {
      console.log('❌ Could not connect to Resend API')
      console.log('   Check your RESEND_API_KEY in .env file')
      process.exit(1)
    }

    // Try to get domain status directly
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY || '')
      const domainsResponse = await resend.domains.list()
      const domainsList = Array.isArray(domainsResponse.data) ? domainsResponse.data : (domainsResponse.data as any)?.data || []
      
      console.log(`\n📋 Found ${domainsList.length} domain(s) in Resend account:`)
      domainsList.forEach((domain: any) => {
        console.log(`   - ${domain.name} (Status: ${domain.status || 'unknown'})`)
      })
      
      const optiohireDomain = domainsList.find((d: any) => d.name === 'optiohire.com')
      
      if (optiohireDomain) {
        console.log('\n✅ optiohire.com domain found in Resend')
        console.log(`   Status: ${optiohireDomain.status}`)
        console.log(`   ID: ${optiohireDomain.id}`)
        console.log(`   Sending: ${optiohireDomain.capabilities?.sending || 'unknown'}`)
        
        if (optiohireDomain.status === 'verified') {
          console.log('\n✅ Domain is VERIFIED and ready to send emails!')
          console.log('\n📝 Next Steps:')
          console.log('   1. Update RESEND_FROM_EMAIL in .env to use optiohire.com')
          console.log('   2. Example: RESEND_FROM_EMAIL=noreply@optiohire.com')
          console.log('   3. Optionally set: RESEND_DOMAIN=optiohire.com')
          console.log('   4. Restart backend to apply changes')
        } else if (optiohireDomain.status === 'pending') {
          console.log('\n⏳ Domain verification is PENDING')
          console.log('   Please check your DNS records and wait for verification')
          console.log('   Check status at: https://resend.com/domains')
        } else if (optiohireDomain.status === 'not_started') {
          console.log('\n⚠️  Domain verification NOT STARTED')
          console.log('   Please add DNS records in Resend dashboard')
          console.log('   Go to: https://resend.com/domains')
        } else {
          console.log(`\n⚠️  Domain status: ${optiohireDomain.status}`)
          console.log('   Check verification status at: https://resend.com/domains')
        }
      } else {
        console.log('\n❌ optiohire.com domain NOT found in Resend account')
        console.log('\n📝 To add and verify optiohire.com:')
        console.log('   1. Go to https://resend.com/domains')
        console.log('   2. Click "Add Domain"')
        console.log('   3. Enter "optiohire.com"')
        console.log('   4. Add the DNS records shown to your domain DNS')
        console.log('   5. Wait for verification (usually 5-10 minutes)')
        console.log('   6. Once verified, update RESEND_FROM_EMAIL to use optiohire.com')
      }
    } catch (err: any) {
      console.error('Error checking domains:', err.message)
    }

    // Check current configuration
    console.log('\n📋 Current Configuration:')
    console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || 'not set (defaults to applicationsoptiohire@gmail.com)'}`)
    console.log(`   RESEND_DOMAIN: ${process.env.RESEND_DOMAIN || 'not set'}`)
    
    if (process.env.RESEND_FROM_EMAIL?.includes('gmail.com')) {
      console.log('\n⚠️  Currently using gmail.com domain (not verified)')
      console.log('   Emails will fail via Resend and fallback to SMTP')
    } else if (process.env.RESEND_FROM_EMAIL?.includes('optiohire.com')) {
      console.log('\n✅ Using optiohire.com domain')
      if (domainStatus?.status === 'verified') {
        console.log('   Domain is verified - emails will work via Resend!')
      } else {
        console.log('   ⚠️  Domain not verified - emails will fail via Resend')
      }
    }

  } catch (err: any) {
    console.error('❌ Error:', err.message)
    console.error('   Full error:', err)
    process.exit(1)
  }
}

verifyDomain()
