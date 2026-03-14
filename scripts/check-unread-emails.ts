/**
 * Check unread emails in the inbox
 * Run: cd backend && npx tsx ../scripts/check-unread-emails.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load env from backend directory
config({ path: resolve(__dirname, '../backend/.env') })

// Import ImapFlow from backend node_modules
const backendPath = resolve(__dirname, '../backend')
const { ImapFlow } = require(`${backendPath}/node_modules/imapflow`)

async function checkUnreadEmails() {
  const imapHost = process.env.IMAP_HOST || 'imap.gmail.com'
  const imapPort = parseInt(process.env.IMAP_PORT || '993', 10)
  const imapUser = process.env.IMAP_USER
  const imapPass = process.env.IMAP_PASS
  const imapSecure = process.env.IMAP_SECURE !== 'false'

  if (!imapHost || !imapUser || !imapPass) {
    console.error('❌ IMAP credentials not configured')
    process.exit(1)
  }

  let client: ImapFlow | null = null

  try {
    console.log('📧 Connecting to email inbox...\n')
    
    client = new ImapFlow({
      host: imapHost,
      port: imapPort,
      secure: imapSecure,
      auth: {
        user: imapUser,
        pass: imapPass
      },
      logger: false
    })

    await client.connect()
    console.log(`✅ Connected to ${imapHost}:${imapPort}\n`)

    const lock = await client.getMailboxLock('INBOX')
    try {
      // Search for unseen emails
      const messages = await client.search({
        seen: false
      })

      if (!messages || messages.length === 0) {
        console.log('📭 No unread emails found in INBOX\n')
        return
      }

      console.log(`✅ Found ${messages.length} unread email(s) in INBOX:\n`)

      for (const seq of messages.slice(0, 20)) { // Limit to first 20
        try {
          const message = await client.fetchOne(seq, {
            envelope: true,
            source: true
          })

          if (message && message.envelope) {
            const subject = message.envelope.subject || '(No Subject)'
            const from = message.envelope.from?.[0]?.address || 'Unknown'
            const date = message.envelope.date ? new Date(message.envelope.date).toLocaleString() : 'Unknown'
            
            // Check for attachments
            let hasAttachment = false
            let attachmentCount = 0
            if (message.source) {
              const sourceStr = message.source.toString()
              // Simple check for attachment indicators
              if (sourceStr.includes('Content-Disposition: attachment') || 
                  sourceStr.includes('filename=') ||
                  sourceStr.match(/\.pdf|\.docx|\.doc/i)) {
                hasAttachment = true
                attachmentCount = (sourceStr.match(/Content-Disposition: attachment/gi) || []).length
              }
            }

            console.log(`📧 Email #${seq}:`)
            console.log(`   Subject: "${subject}"`)
            console.log(`   From: ${from}`)
            console.log(`   Date: ${date}`)
            console.log(`   Has Attachment: ${hasAttachment ? `Yes (${attachmentCount})` : 'No'}`)
            
            // Check if subject matches Sales-related keywords
            const subjectLower = subject.toLowerCase()
            if (subjectLower.includes('sales') || subjectLower.includes('cres dynamics')) {
              console.log(`   ⭐ MATCHES Sales/Cres Dynamics keywords`)
            }
            console.log('')
          }
        } catch (err) {
          console.error(`   ❌ Error reading email #${seq}:`, err)
        }
      }

      if (messages.length > 20) {
        console.log(`... and ${messages.length - 20} more unread email(s)\n`)
      }

    } finally {
      lock.release()
    }

    await client.logout()
  } catch (err) {
    console.error('❌ Error:', err)
    if (client) {
      try {
        await client.logout()
      } catch (e) {
        // Ignore logout errors
      }
    }
    process.exit(1)
  }
}

checkUnreadEmails()
