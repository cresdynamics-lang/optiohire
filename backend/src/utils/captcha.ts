import { logger } from './logger.js'

interface RecaptchaResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

/**
 * Verifies a Google reCAPTCHA v2/v3 token.
 * @param token The token from the frontend.
 * @returns Boolean indicating if the captcha is valid.
 */
export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || ''
  
  if (!token) {
    logger.info('Captcha verification failed: No token provided')
    return false
  }

  // Debug logging for environment variable presence
  if (!secretKey) {
    logger.error('RECAPTCHA_SECRET_KEY is missing from environment variables')
  }

  try {
    const params = new URLSearchParams()
    params.append('secret', secretKey)
    params.append('response', token)

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })

    const data = await response.json() as RecaptchaResponse
    
    if (!data.success) {
      logger.warn('Captcha verification failed', { 
        errorCodes: data['error-codes'],
        hostname: data.hostname,
        success: data.success,
        secretMasked: secretKey ? `${secretKey.substring(0, 4)}...${secretKey.substring(secretKey.length - 4)}` : 'MISSING'
      })
      return false
    }

    return true
  } catch (error) {
    logger.error('Error verifying captcha:', error)
    return false
  }
}
