import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { trackApiActivity } from '../middleware/trackActivity.js'
import {
  getAllUsers,
  getUserById,
  getUserStats,
  updateUser,
  changeUserRole,
  deleteUser,
  resetUserPassword,
  getAllCompanies,
  getCompanyDetails,
  updateCompany,
  deleteCompany,
  getAllJobPostings,
  resendJobCreationEmail,
  deleteJobPosting,
  getAllApplications,
  deleteApplication,
  getSystemStats,
  getAIAuditTrail
} from '../api/adminController.js'
import {
  getQueueHealth
} from '../api/queueMonitoringController.js'
import { getCandidateDecisions } from '../api/adminCandidatesController.js'
import {
  rescoreApplication,
  bulkRescoreApplications,
  overrideDecision
} from '../api/adminAuditActionsController.js'
import {
  checkAndSendMissingEmails,
  getEmailCheckStats,
  getMissingEmailDetails
} from '../api/adminEmailCheckerController.js'
import {
  getActivityTelemetry
} from '../api/adminTelemetryController.js'
import {
  getPendingSignups,
  approveSignup,
  rejectSignup,
  bulkApproveSignups,
  bulkRejectSignups,
  getEmailLogs,
  getEmailStats,
  resendEmail,
  getDeadLetterEmails,
  requeueDeadLetterEmail,
  bulkRequeueDeadLetterEmails,
  requeueAllDeadLetterEmails,
  getSystemSettings,
  updateSystemSetting,
  getFeatureFlags,
  updateFeatureFlag,
  getActivityLogs,
  getPerformanceMetrics,
  getUserActivity,
  getWorkflows,
  updateWorkflow
} from '../api/adminControllerExtended.js'



export const router = Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(requireAdmin)
router.use(trackApiActivity) // Track all admin API calls

// System Statistics
router.get('/stats', getSystemStats)
router.get('/ai-audit', getAIAuditTrail)

// Queue Monitoring
router.get('/queues/health', getQueueHealth)

// Users Management
router.get('/users', getAllUsers)
router.get('/users/:userId', getUserById)
router.get('/users/:userId/stats', getUserStats)
router.get('/users/:userId/activity', getUserActivity)
router.patch('/users/:userId', updateUser)
router.post('/users/:userId/role', changeUserRole)
router.post('/users/:userId/reset-password', resetUserPassword)
router.delete('/users/:userId', deleteUser)

// Companies Management
router.get('/companies', getAllCompanies)
router.get('/companies/:companyId', getCompanyDetails)
router.patch('/companies/:companyId', updateCompany)
router.delete('/companies/:companyId', deleteCompany)

// Job Postings Management
router.get('/job-postings', getAllJobPostings)
router.post('/job-postings/:jobId/resend-email', resendJobCreationEmail)
router.delete('/job-postings/:jobId', deleteJobPosting)

// Applications Management
router.get('/applications', getAllApplications)
router.delete('/applications/:applicationId', deleteApplication)
router.get('/candidate-decisions', getCandidateDecisions)
router.post('/audit/rescore', rescoreApplication)
router.post('/audit/bulk-rescore', bulkRescoreApplications)
router.post('/audit/override', overrideDecision)

// Signup Queue Management
router.get('/users/pending', getPendingSignups)
router.post('/users/:userId/approve', approveSignup)
router.post('/users/:userId/reject', rejectSignup)
router.post('/users/bulk-approve', bulkApproveSignups)
router.post('/users/bulk-reject', bulkRejectSignups)

// Email Management
router.get('/emails', getEmailLogs)
router.get('/emails/stats', getEmailStats)
router.post('/emails/:emailId/resend', resendEmail)
router.get('/emails/dead-letter', getDeadLetterEmails)
router.post('/emails/:emailId/requeue', requeueDeadLetterEmail)
router.post('/emails/requeue-bulk', bulkRequeueDeadLetterEmails)
router.post('/emails/requeue-all', requeueAllDeadLetterEmails)

// Email Checker & Sender
router.get('/email-check/stats', getEmailCheckStats)
router.get('/email-check/missing', getMissingEmailDetails)
router.post('/email-check/send-missing', checkAndSendMissingEmails)

// System Settings
router.get('/settings', getSystemSettings)
router.patch('/settings/:settingKey', updateSystemSetting)
router.get('/settings/feature-flags', getFeatureFlags)
router.patch('/settings/feature-flags/:flagKey', updateFeatureFlag)

// Time Tracking & Activity
router.get('/activity', getActivityLogs)
router.get('/activity/:userId', getUserActivity)
router.get('/performance', getPerformanceMetrics)
router.get('/telemetry/activity', getActivityTelemetry)

// Workflow Management
router.get('/workflows', getWorkflows)
router.patch('/workflows/:workflowId', updateWorkflow)

// Certificate Management


// Enhanced Analytics
import { getEnhancedStats, getTimeSeriesAnalytics } from '../api/adminAnalyticsController.js'
router.get('/analytics/enhanced', getEnhancedStats)
router.get('/analytics/timeseries', getTimeSeriesAnalytics)

// AI Usage Analytics
import { getAiUsageSummary } from '../api/adminAiUsageController.js'
router.get('/ai-usage', getAiUsageSummary)

// Debugging Tools
import {
  getQueryLogs,
  getSystemDiagnostics,
  getErrorLogs,
  testDatabaseConnection,
  testRedisConnection,
  clearCache
} from '../api/adminDebugController.js'
router.get('/debug/query-logs', getQueryLogs)
router.get('/debug/diagnostics', getSystemDiagnostics)
router.get('/debug/errors', getErrorLogs)
router.get('/debug/test-db', testDatabaseConnection)
router.get('/debug/test-redis', testRedisConnection)
router.post('/debug/clear-cache', clearCache)

// Support Tickets (HR to Admin)
import { getSupportTickets } from '../api/supportController.js'
import { markSupportTicketSeen } from '../api/adminController.js'
router.get('/support-tickets', getSupportTickets)
router.put('/support-tickets/:id/seen', markSupportTicketSeen)

// Candidates Full View & Revert
import { getAllCandidates, revertCandidate } from '../api/adminCandidatesController.js'
router.get('/candidates', authenticate, requireAdmin, getAllCandidates)
router.post('/candidates/:id/revert', authenticate, requireAdmin, revertCandidate)

// Talent Pool & AI Email
import { getTalentPool, generatePersonalisedEmail, bulkGenerateAndSend } from '../api/adminTalentPoolController.js'
router.get('/talent-pool', authenticate, requireAdmin, getTalentPool)
router.post('/talent-pool/generate-email', authenticate, requireAdmin, generatePersonalisedEmail)
router.post('/talent-pool/bulk-email', authenticate, requireAdmin, bulkGenerateAndSend)

// Security Audit Logs
import { getSecurityLogs } from '../api/adminSecurityLogsController.js'
router.get('/security-logs', authenticate, requireAdmin, getSecurityLogs)
