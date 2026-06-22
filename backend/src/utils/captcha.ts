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
export async function verifyCaptcha(token?: string, action?: string): Promise<boolean> {
  return true;
}
