import { Router } from 'express'
import {
    getInstitutionDashboard,
    getMyInstitution,
    listCohorts,
    createCohort,
    getRoster,
    uploadRoster,
    commitUpload,
    getNotifications,
    updateSettings,
    listAdmins,
    createInstitution,
    institutionSignin,
    resendCohortInvites,
    resendCandidateInvite,
    institutionSignup,
    getPublicInstitutionByToken,
    activateInstitution
} from '../api/institutionController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

export const router = Router()

// ── Auth (institution login/signup) ──────────────────────────────
router.post('/auth/signin', institutionSignin)
router.post('/auth/signup', institutionSignup)

// ── Public Endpoint ────────────────────────────────────────────────
router.get('/public/:token', getPublicInstitutionByToken)
router.post('/onboard/:token/activate', activateInstitution)

// ── Admin: create institution (platform admin only) ──────────────
router.post('/', authenticate, requireAdmin, createInstitution)

// ── Self-service: get my institution ────────────────────────────
router.get('/me', authenticate, getMyInstitution)

// ── Per-institution dashboard ────────────────────────────────────
router.get('/:id/dashboard', authenticate, getInstitutionDashboard)

// ── Cohorts ──────────────────────────────────────────────────────
router.get('/:id/cohorts', authenticate, listCohorts)
router.post('/:id/cohorts', authenticate, createCohort)

// ── Roster ───────────────────────────────────────────────────────
router.get('/:id/cohorts/:cohortId/roster', authenticate, getRoster)
router.post('/:id/cohorts/:cohortId/resend-invites', authenticate, resendCohortInvites)
router.post('/:id/cohorts/:cohortId/roster/:candidateId/resend-invite', authenticate, resendCandidateInvite)

// ── Bulk Upload ──────────────────────────────────────────────────
router.post('/:id/cohorts/:cohortId/uploads', authenticate, uploadRoster)
router.post('/:id/cohorts/:cohortId/commit', authenticate, commitUpload)

// ── Notifications ────────────────────────────────────────────────
router.get('/:id/notifications', authenticate, getNotifications)

// ── Settings ─────────────────────────────────────────────────────
router.patch('/:id/settings', authenticate, updateSettings)

// ── Admins ───────────────────────────────────────────────────────
router.get('/:id/admins', authenticate, listAdmins)
