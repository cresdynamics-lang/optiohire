import { Router } from 'express'
import { createContact } from '../api/contactController.js'
import rateLimit from 'express-rate-limit'

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // 2 requests per hour
  message: { message: 'Too many requests. Please try again later.' }
})

export const router = Router()

router.post('/', contactLimiter, createContact)


