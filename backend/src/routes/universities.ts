import { Router } from 'express'
import { listUniversities } from '../api/universitiesController.js'

export const router = Router()

// Public list - used by candidate settings university picker
router.get('/', listUniversities)
