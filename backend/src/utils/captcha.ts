import { logger } from './logger.js'

/**
 * Verifies a Google reCAPTCHA v2/v3 token.
 * @param token The token from the frontend.
 * @returns Boolean indicating if the captcha is valid.
 */
export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || ''
  
  if (!token) {
    logger.warn('Captcha verification failed: No token provided')
    return false
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    })

    const data = await response.json()
    
    if (!data.success) {
      logger.warn('Captcha verification failed:', data['error-codes'])
      return false
    }

    return true
  } catch (error) {
    logger.error('Error verifying captcha:', error)
    return false
  }
}
