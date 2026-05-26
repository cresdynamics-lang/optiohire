/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Use raw SQL from complete_schema.sql but wrapped in pgm.sql
  // This is the cleanest way to "baseline" an existing schema
  pgm.sql(`
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE ai_status_enum AS ENUM ('SHORTLIST', 'FLAG', 'REJECT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    NEW.updated_at = now();
  EXCEPTION
    WHEN SQLSTATE '42703' THEN
      NULL;
    WHEN OTHERS THEN
      RAISE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  company_role text CHECK (company_role IS NULL OR company_role IN ('hr', 'hiring_manager', 'candidate')),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  admin_approval_status text CHECK (admin_approval_status IN ('pending', 'approved', 'rejected')) DEFAULT NULL,
  admin_permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_verification_codes (
  code_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_logs (
  email_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  email_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_message_id text,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS companies (
  company_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_email text NOT NULL,
  hr_email text NOT NULL,
  hiring_manager_email text NOT NULL,
  company_domain text NOT NULL,
  company_logo_url text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_postings (
  job_posting_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  job_title text NOT NULL,
  job_description text NOT NULL,
  responsibilities text NOT NULL,
  skills_required text[] NOT NULL DEFAULT '{}',
  application_deadline timestamptz,
  interview_slots jsonb,
  interview_meeting_link text,
  interview_start_time timestamptz,
  meeting_link text,
  status text DEFAULT 'ACTIVE',
  webhook_receiver_url text,
  webhook_secret text,
  job_description_tsv tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  application_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id uuid NOT NULL REFERENCES job_postings(job_posting_id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(company_id) ON DELETE CASCADE,
  candidate_name text,
  email text NOT NULL,
  phone text,
  resume_url text,
  parsed_resume_json jsonb,
  ai_score numeric,
  ai_status ai_status_enum,
  reasoning text,
  external_id text UNIQUE,
  interview_time timestamptz,
  interview_link text,
  interview_status text DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT applications_unique UNIQUE (job_posting_id, email)
);

CREATE TABLE IF NOT EXISTS recruitment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id uuid NOT NULL REFERENCES job_postings(job_posting_id) ON DELETE CASCADE,
  company_id uuid REFERENCES companies(company_id) ON DELETE CASCADE,
  total_applicants integer DEFAULT 0,
  total_applicants_shortlisted integer DEFAULT 0,
  total_applicants_rejected integer DEFAULT 0,
  total_applicants_flagged_to_hr integer DEFAULT 0,
  ai_overall_analysis text,
  processing_status text DEFAULT 'processing' CHECK (processing_status IN ('processing', 'in_progress', 'finished')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_posting_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id uuid NOT NULL REFERENCES job_postings(job_posting_id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  report_url text NOT NULL,
  report_type text DEFAULT 'post_deadline',
  status text DEFAULT 'completed',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id uuid REFERENCES job_postings(job_posting_id) ON DELETE CASCADE,
  type text NOT NULL,
  run_at timestamptz NOT NULL,
  payload jsonb,
  executed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  action text NOT NULL,
  company_id uuid REFERENCES companies(company_id) ON DELETE SET NULL,
  job_posting_id uuid REFERENCES job_postings(job_posting_id) ON DELETE SET NULL,
  candidate_id uuid REFERENCES applications(application_id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  session_id text NOT NULL,
  user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  url text,
  path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  preference_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  report_notifications boolean DEFAULT true,
  application_notifications boolean DEFAULT true,
  interview_reminders boolean DEFAULT true,
  weekly_summary boolean DEFAULT true,
  auto_generate_reports boolean DEFAULT true,
  notification_frequency text DEFAULT 'realtime' CHECK (notification_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON email_verification_codes(code);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(company_domain);

CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_skills_gin ON job_postings USING GIN (skills_required);
CREATE INDEX IF NOT EXISTS idx_job_postings_description_tsv ON job_postings USING GIN(job_description_tsv);

CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_ai_status ON applications(ai_status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_job_posting ON reports(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_reports_company ON reports(company_id);

CREATE INDEX IF NOT EXISTS idx_job_schedules_due ON job_schedules (run_at, executed);

CREATE INDEX IF NOT EXISTS idx_audit_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW applicants AS SELECT * FROM applications;
CREATE OR REPLACE VIEW applicants_view AS SELECT * FROM applications;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION job_postings_tsv_trigger() RETURNS trigger AS $$
BEGIN
  new.job_description_tsv := to_tsvector('english', 
    coalesce(new.job_title, '') || ' ' || 
    coalesce(new.job_description, '') || ' ' || 
    coalesce(new.responsibilities, '')
  );
  new.updated_at := now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_job_postings_tsv ON job_postings;
CREATE TRIGGER trg_job_postings_tsv 
  BEFORE INSERT OR UPDATE ON job_postings
  FOR EACH ROW 
  EXECUTE FUNCTION job_postings_tsv_trigger();

-- Apply updated_at triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'companies', 'job_postings', 'applications', 'reports', 'recruitment_analytics', 'user_preferences')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP VIEW IF EXISTS applicants_view;
    DROP VIEW IF EXISTS applicants;
    DROP TABLE IF EXISTS user_preferences;
    DROP TABLE IF EXISTS analytics_events;
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS job_schedules;
    DROP TABLE IF EXISTS reports;
    DROP TABLE IF EXISTS recruitment_analytics;
    DROP TABLE IF EXISTS applications;
    DROP TABLE IF EXISTS job_postings;
    DROP TABLE IF EXISTS companies;
    DROP TABLE IF EXISTS email_logs;
    DROP TABLE IF EXISTS email_verification_codes;
    DROP TABLE IF EXISTS password_reset_tokens;
    DROP TABLE IF EXISTS users;
    DROP TYPE IF EXISTS ai_status_enum;
  `);
};
