import 'dotenv/config'
import { Resend } from 'resend'

async function checkDomains() {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const response = await resend.domains.list()
    console.log('Raw Resend domains response:')
    console.log(JSON.stringify(response, null, 2))
  } catch (err) {
    console.error('Error:', err)
  }
}

checkDomains()
