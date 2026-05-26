/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- Performance Optimization Indexes
    CREATE INDEX IF NOT EXISTS idx_companies_user_email ON companies(user_id, company_email) WHERE user_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_companies_hr_email_lookup ON companies(hr_email) WHERE hr_email IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_job_postings_company_status_created ON job_postings(company_id, status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_applications_company_created ON applications(company_id, created_at DESC) WHERE company_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_applications_job_status_score ON applications(job_posting_id, ai_status, ai_score DESC NULLS LAST);
    CREATE INDEX IF NOT EXISTS idx_reports_company_created ON reports(company_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_user_type_created ON analytics_events(user_id, event_type, created_at DESC) WHERE user_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_job_postings_active_deadline ON job_postings(company_id, application_deadline) WHERE status = 'ACTIVE';
    CREATE INDEX IF NOT EXISTS idx_applications_pending ON applications(job_posting_id, created_at DESC) WHERE ai_status IS NULL;
    CREATE INDEX IF NOT EXISTS idx_applications_interview_time_status ON applications(interview_time, interview_status) WHERE interview_time IS NOT NULL;

    ANALYZE users;
    ANALYZE companies;
    ANALYZE job_postings;
    ANALYZE applications;
    ANALYZE reports;
    ANALYZE analytics_events;
    ANALYZE user_preferences;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_companies_user_email;
    DROP INDEX IF EXISTS idx_companies_hr_email_lookup;
    DROP INDEX IF EXISTS idx_job_postings_company_status_created;
    DROP INDEX IF EXISTS idx_applications_company_created;
    DROP INDEX IF EXISTS idx_applications_job_status_score;
    DROP INDEX IF EXISTS idx_reports_company_created;
    DROP INDEX IF EXISTS idx_analytics_events_user_type_created;
    DROP INDEX IF EXISTS idx_job_postings_active_deadline;
    DROP INDEX IF EXISTS idx_applications_pending;
    DROP INDEX IF EXISTS idx_applications_interview_time_status;
  `);
};
