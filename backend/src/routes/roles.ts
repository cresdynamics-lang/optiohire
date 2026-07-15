import { Router } from 'express'
import { searchRoles } from '../api/rolesController.js'

export const router = Router()

router.get('/', searchRoles)
