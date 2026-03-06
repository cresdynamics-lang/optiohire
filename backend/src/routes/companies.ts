import { Router } from 'express'
import { createCompany, getCompanyReport } from '../api/companiesController.js'
import { optionalAuthenticate } from '../middleware/auth.js'

export const router = Router()

router.post('/', optionalAuthenticate, createCompany)
router.get('/:id/report', getCompanyReport)


