import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { ImapFlow } from 'imapflow'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function testImap() {
  const host = process.env.IMAP_HOST
  const port = parseInt(process.env.IMAP_PORT || '993', 10)
  const user = process.env.IMAP_USER
  const pass = process.env.IMAP_PASS
  const secure = process.env.IMAP_SECURE !== 'false'

  console.log(`Testing IMAP connection with:`)
  console.log(`Host: ${host}`)
  console.log(`Port: ${port}`)
  console.log(`User: ${user}`)
  console.log(`Secure: ${secure}`)
  console.log(`Password: ${pass ? '****' : 'MISSING'}`)

  if (!host || !user || !pass) {
    console.error('❌ Missing IMAP configuration in .env')
    process.exit(1)
  }

  const client = new ImapFlow({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    logger: false
  })

  try {
    await client.connect()
    console.log('✅ Successfully connected to IMAP server!')
    
    const mailbox = await client.mailboxOpen('INBOX')
    console.log(`✅ Successfully opened INBOX. Total messages: ${mailbox.exists}`)
    
    await client.logout()
    console.log('✅ Logged out successfully.')
  } catch (error: any) {
    console.error('❌ IMAP Connection Failed:')
    console.error(`Message: ${error.message}`)
    if (error.response) console.error(`Server Response: ${error.response}`)
    if (error.responseText) console.error(`Server Text: ${error.responseText}`)
    process.exit(1)
  }
}

testImap()
