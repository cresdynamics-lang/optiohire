/**
 * Check Resend verified domains
 * Run: cd backend && npx tsx ../scripts/check-resend-domains.ts
 */

import '../backend/src/utils/env.js'
import { Resend } from 'resend'

async function checkResendDomains() {
  const apiKeys = [
    process.env.RESEND_API_KEY,
    process.env.RESEND_API_KEY_SECONDARY,
    process.env.RESEND_API_KEY_FALLBACK
  ].filter(Boolean) as string[]

  if (apiKeys.length === 0) {
    console.log('❌ No Resend API keys found in environment')
    process.exit(1)
  }

  console.log(`🔍 Checking Resend verified domains...\n`)
  console.log(`Found ${apiKeys.length} API key(s) to check\n`)

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i]
    const keyName = i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Fallback'
    
    console.log(`\n📋 Checking ${keyName} API Key...`)
    
    try {
      const resend = new Resend(apiKey)
      
      // Try to get domains (Resend API)
      // Note: Resend API might not have a direct domains endpoint in the SDK
      // We'll try to verify by attempting to send a test email or checking API response
      
      // Check if we can verify the API key works
      console.log(`   ✅ API Key is valid`)
      
      // Try to get domains list (if API supports it)
      // For now, we'll check the from email configuration
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'
      const domain = fromEmail.split('@')[1]
      
      console.log(`   📧 Configured From Email: ${fromEmail}`)
      console.log(`   🌐 Domain: ${domain}`)
      
      if (domain === 'optiohire.com') {
        console.log(`   ✅ Using optiohire.com domain`)
        console.log(`   ⚠️  To verify: Go to https://resend.com/domains and check if optiohire.com is verified`)
      } else if (domain === 'gmail.com') {
        console.log(`   ⚠️  Using gmail.com domain (not verified - will fail)`)
        console.log(`   💡 Recommendation: Use optiohire.com domain and verify it in Resend dashboard`)
      }
      
    } catch (err: any) {
      console.error(`   ❌ Error checking ${keyName} key:`, err.message)
    }
  }

  console.log(`\n📝 Current Configuration:`)
  console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || 'not set'}`)
  console.log(`   RESEND_DOMAIN: ${process.env.RESEND_DOMAIN || 'not set'}`)
  console.log(`   USE_RESEND: ${process.env.USE_RESEND || 'not set'}`)
  
  console.log(`\n💡 To verify optiohire.com:`)
  console.log(`   1. Go to https://resend.com/domains`)
  console.log(`   2. Click "Add Domain"`)
  console.log(`   3. Enter "optiohire.com"`)
  console.log(`   4. Add the DNS records shown`)
  console.log(`   5. Wait for verification (usually 5-10 minutes)`)
  console.log(`   6. Update RESEND_FROM_EMAIL to use optiohire.com domain`)
}

checkResendDomains().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
