import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { trackApiActivity } from '../middleware/trackActivity.js'
import {
  getAllUsers,
  getUserById,
  getUserStats,
  updateUser,
  deleteUser,
  getAllCompanies,
  getCompanyDetails,
  updateCompany,
  deleteCompany,
  getAllJobPostings,
  deleteJobPosting,
  getAllApplications,
  deleteApplication,
  getSystemStats
} from '../api/adminController.js'
import {
  getPendingSignups,
  approveSignup,
  rejectSignup,
  bulkApproveSignups,
  bulkRejectSignups,
  getEmailLogs,
  getEmailStats,
  resendEmail,
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

// Users Management
router.get('/users', getAllUsers)
router.get('/users/:userId', getUserById)
router.get('/users/:userId/stats', getUserStats)
router.get('/users/:userId/activity', getUserActivity)
router.patch('/users/:userId', updateUser)
router.delete('/users/:userId', deleteUser)

// Companies Management
router.get('/companies', getAllCompanies)
router.get('/companies/:companyId', getCompanyDetails)
router.patch('/companies/:companyId', updateCompany)
router.delete('/companies/:companyId', deleteCompany)

// Job Postings Management
router.get('/job-postings', getAllJobPostings)
router.delete('/job-postings/:jobId', deleteJobPosting)

// Applications Management
router.get('/applications', getAllApplications)
router.delete('/applications/:applicationId', deleteApplication)

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

// System Settings
router.get('/settings', getSystemSettings)
router.patch('/settings/:settingKey', updateSystemSetting)
router.get('/settings/feature-flags', getFeatureFlags)
router.patch('/settings/feature-flags/:flagKey', updateFeatureFlag)

// Time Tracking & Activity
router.get('/activity', getActivityLogs)
router.get('/activity/:userId', getUserActivity)
router.get('/performance', getPerformanceMetrics)

// Workflow Management
router.get('/workflows', getWorkflows)
router.patch('/workflows/:workflowId', updateWorkflow)

// Enhanced Analytics
import { getEnhancedStats, getTimeSeriesAnalytics } from '../api/adminAnalyticsController.js'
router.get('/analytics/enhanced', getEnhancedStats)
router.get('/analytics/timeseries', getTimeSeriesAnalytics)

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

