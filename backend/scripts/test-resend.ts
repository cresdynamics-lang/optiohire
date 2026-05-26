import 'dotenv/config'
import { ResendService } from '../src/services/resendService.js'

async function checkResend() {
  const service = new ResendService()
  const diagnostics = await service.getDiagnostics()
  console.log('Resend Diagnostics:')
  console.log(JSON.stringify(diagnostics, null, 2))
}

checkResend().catch(console.error)
