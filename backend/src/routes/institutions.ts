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
    activateInstitution,
    listInstitutionStudents,
    listEmployerActivity,
    listPlacements,
    getReportsSummary,
    listOnboardingSessions,
    requestOnboardingSession,
    listAnnouncements,
    listSupportTickets,
    createSupportTicket,
} from '../api/institutionController.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

export const router = Router()

router.post('/auth/signin', institutionSignin)
router.post('/auth/signup', institutionSignup)

router.get('/public/:token', getPublicInstitutionByToken)
router.post('/onboard/:token/activate', activateInstitution)

router.post('/', authenticate, requireAdmin, createInstitution)
router.get('/me', authenticate, getMyInstitution)

router.get('/:id/dashboard', authenticate, getInstitutionDashboard)
router.get('/:id/students', authenticate, listInstitutionStudents)
router.get('/:id/employer-activity', authenticate, listEmployerActivity)
router.get('/:id/placements', authenticate, listPlacements)
router.get('/:id/reports/summary', authenticate, getReportsSummary)
router.get('/:id/onboarding-sessions', authenticate, listOnboardingSessions)
router.post('/:id/onboarding-sessions', authenticate, requestOnboardingSession)
router.get('/:id/announcements', authenticate, listAnnouncements)
router.get('/:id/support', authenticate, listSupportTickets)
router.post('/:id/support', authenticate, createSupportTicket)

router.get('/:id/cohorts', authenticate, listCohorts)
router.post('/:id/cohorts', authenticate, createCohort)

router.get('/:id/cohorts/:cohortId/roster', authenticate, getRoster)
router.post('/:id/cohorts/:cohortId/resend-invites', authenticate, resendCohortInvites)
router.post('/:id/cohorts/:cohortId/roster/:candidateId/resend-invite', authenticate, resendCandidateInvite)

router.post('/:id/cohorts/:cohortId/uploads', authenticate, uploadRoster)
router.post('/:id/cohorts/:cohortId/commit', authenticate, commitUpload)

router.get('/:id/notifications', authenticate, getNotifications)
router.patch('/:id/settings', authenticate, updateSettings)
router.get('/:id/admins', authenticate, listAdmins)
