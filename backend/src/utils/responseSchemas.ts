import { z } from 'zod'

/**
 * API Response Schemas for validation
 * Ensures consistent API responses across the application
 */

// User schemas
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().nullable(),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  company_role: z.enum(['hr', 'hiring_manager']).nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  hasCompany: z.boolean(),
  companyId: z.string().uuid().nullable(),
  companyName: z.string().nullable(),
  companyEmail: z.string().email().nullable(),
  hrEmail: z.string().email().nullable(),
  hiring_manager_email: z.string().email().nullable()
})

// Job posting schemas
export const JobPostingResponseSchema = z.object({
  job_posting_id: z.string().uuid(),
  company_id: z.string().uuid(),
  job_title: z.string(),
  job_description: z.string(),
  responsibilities: z.string(),
  skills_required: z.array(z.string()),
  application_deadline: z.string().nullable(),
  interview_slots: z.any().nullable(),
  interview_meeting_link: z.string().nullable(),
  interview_start_time: z.string().nullable(),
  meeting_link: z.string().nullable(),
  status: z.enum(['ACTIVE', 'CLOSED', 'DRAFT']),
  webhook_receiver_url: z.string().nullable(),
  webhook_secret: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable()
})

// Application schemas
export const ApplicationResponseSchema = z.object({
  application_id: z.string().uuid(),
  job_posting_id: z.string().uuid(),
  company_id: z.string().uuid().nullable(),
  candidate_name: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
  resume_url: z.string().nullable(),
  parsed_resume_json: z.any().nullable(),
  ai_score: z.number().nullable(),
  ai_status: z.enum(['SHORTLIST', 'FLAG', 'REJECT']).nullable(),
  reasoning: z.string().nullable(),
  external_id: z.string().nullable(),
  interview_time: z.string().nullable(),
  interview_link: z.string().nullable(),
  interview_status: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable()
})

// Company schemas
export const CompanyResponseSchema = z.object({
  company_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  company_name: z.string(),
  company_email: z.string().email(),
  hr_email: z.string().email(),
  hiring_manager_email: z.string().email(),
  company_domain: z.string(),
  settings: z.any().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable()
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
  stack: z.string().optional()
})

// Success response wrapper
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean().default(true),
  data: dataSchema
})

// Paginated response schema
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  items: z.array(itemSchema),
  total: z.number(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  totalPages: z.number().optional()
})

// Health check schema
export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  version: z.string(),
  database: z.object({
    status: z.string(),
    latency: z.string().optional(),
    error: z.string().optional()
  }).optional(),
  cache: z.object({
    status: z.string(),
    latency: z.string().optional(),
    error: z.string().optional()
  }).optional(),
  emailReader: z.any().optional()
})

/**
 * Validate and sanitize response data
 */
export function validateResponse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data)
}

/**
 * Safe validation - returns validated data or null
 */
export function safeValidateResponse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> | null {
  const result = schema.safeParse(data)
  return result.success ? result.data : null
}
