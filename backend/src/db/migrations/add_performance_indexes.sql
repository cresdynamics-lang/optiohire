-- ============================================================================
-- Performance Optimization Indexes
-- ============================================================================
-- Add missing indexes to improve query performance
-- Run this migration: psql $DATABASE_URL -f add_performance_indexes.sql

-- Index for user lookups by email (already exists but ensure it's there)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite index for company lookups by user_id and email
CREATE INDEX IF NOT EXISTS idx_companies_user_email ON companies(user_id, company_email) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_hr_email_lookup ON companies(hr_email) WHERE hr_email IS NOT NULL;

-- Index for job postings by company and status (for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_job_postings_company_status_created ON job_postings(company_id, status, created_at DESC);

-- Index for applications by company (for HR dashboard)
CREATE INDEX IF NOT EXISTS idx_applications_company_created ON applications(company_id, created_at DESC) WHERE company_id IS NOT NULL;

-- Composite index for applications by job and status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_applications_job_status_score ON applications(job_posting_id, ai_status, ai_score DESC NULLS LAST);

-- Index for reports by company and creation date
CREATE INDEX IF NOT EXISTS idx_reports_company_created ON reports(company_id, created_at DESC);

-- Index for analytics events by user and type (for analytics queries)
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_type_created ON analytics_events(user_id, event_type, created_at DESC) WHERE user_id IS NOT NULL;

-- Index for user preferences lookup
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Partial index for active job postings (most common query)
CREATE INDEX IF NOT EXISTS idx_job_postings_active_deadline ON job_postings(company_id, application_deadline) WHERE status = 'ACTIVE';

-- Partial index for pending applications (common filter)
CREATE INDEX IF NOT EXISTS idx_applications_pending ON applications(job_posting_id, created_at DESC) WHERE ai_status IS NULL;

-- Index for interview scheduling queries
CREATE INDEX IF NOT EXISTS idx_applications_interview_time_status ON applications(interview_time, interview_status) WHERE interview_time IS NOT NULL;

-- Full-text search index on job descriptions (if not already exists)
-- Note: This is already created in complete_schema.sql, but ensure it exists
-- CREATE INDEX IF NOT EXISTS idx_job_postings_description_tsv ON job_postings USING GIN(job_description_tsv);

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE companies;
ANALYZE job_postings;
ANALYZE applications;
ANALYZE reports;
ANALYZE analytics_events;
ANALYZE user_preferences;
