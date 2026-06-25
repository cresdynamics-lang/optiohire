import { onboardProfile } from './src/api/candidateController.js'
import dotenv from 'dotenv'

dotenv.config()

async function test() {
  const req = {
    userId: '11111111-1111-1111-1111-111111111111',
    body: {
      bio: 'Test bio',
      jobCategory: 'Engineering'
    },
    files: {},
    protocol: 'http',
    get: function(val: string) { return 'localhost' }
  } as any

  const res = {
    status: (code: number) => {
      console.log('STATUS:', code)
      return res
    },
    json: (data: any) => {
      console.log('JSON:', data)
      return res
    }
  } as any

  try {
    await onboardProfile(req, res)
  } catch (e) {
    console.error("FATAL CRASH:", e)
  }
  process.exit(0)
}

test()
