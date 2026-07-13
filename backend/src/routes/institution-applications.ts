import { Router } from 'express'
import { createInstitutionApplication } from '../api/institutionApplicationController.js'
import rateLimit from 'express-rate-limit'

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour per IP
  message: { message: 'Too many requests. Please try again later.' }
})

export const router = Router()

router.post('/', applicationLimiter, createInstitutionApplication)
