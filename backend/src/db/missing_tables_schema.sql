-- ============================================================================
-- OptiHire Supplemental Schema
-- Talent Pool tables + support_tickets (the only truly missing tables)
-- Safe to run multiple times — IF NOT EXISTS throughout
-- ============================================================================

-- TALENT POOL: add missing columns to existing table
ALTER TABLE talent_pool ADD COLUMN IF NOT EXISTS skills_summary   text;
ALTER TABLE talent_pool ADD COLUMN IF NOT EXISTS experience_years integer;
ALTER TABLE talent_pool ADD COLUMN IF NOT EXISTS ai_score_avg     real;
CREATE INDEX IF NOT EXISTS idx_talent_pool_email ON talent_pool(email);
CREATE INDEX IF NOT EXISTS idx_talent_pool_score ON talent_pool(ai_score_avg DESC NULLS LAST);

-- TALENT POOL MATCHES
CREATE TABLE IF NOT EXISTS talent_pool_matches (
  match_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id         uuid NOT NULL REFERENCES job_postings(job_posting_id) ON DELETE CASCADE,
  candidate_id   uuid NOT NULL REFERENCES talent_pool(talent_id) ON DELETE CASCADE,
  final_score    real NOT NULL DEFAULT 0,
  tier           text NOT NULL DEFAULT 'good',
  ai_audit_log   jsonb DEFAULT '{}'::jsonb,
  matched_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_talent_match UNIQUE (job_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS idx_talent_pool_matches_job       ON talent_pool_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_matches_candidate ON talent_pool_matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_matches_score     ON talent_pool_matches(final_score DESC);

-- TALENT POOL APPLICATIONS
CREATE TABLE IF NOT EXISTS talent_pool_applications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id      uuid NOT NULL REFERENCES talent_pool(talent_id) ON DELETE CASCADE,
  job_posting_id uuid NOT NULL REFERENCES job_postings(job_posting_id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(application_id) ON DELETE SET NULL,
  applied_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_talent_application UNIQUE (talent_id, job_posting_id)
);
CREATE INDEX IF NOT EXISTS idx_talent_pool_apps_talent ON talent_pool_applications(talent_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_apps_job    ON talent_pool_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_apps_date   ON talent_pool_applications(applied_at DESC);

-- TALENT POOL SCAN LOG
CREATE TABLE IF NOT EXISTS talent_pool_scan_log (
  log_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id               uuid REFERENCES job_postings(job_posting_id) ON DELETE SET NULL,
  candidates_evaluated integer NOT NULL DEFAULT 0,
  strong_matches_found integer NOT NULL DEFAULT 0,
  scanned_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_talent_pool_scan_log_job  ON talent_pool_scan_log(job_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_scan_log_date ON talent_pool_scan_log(scanned_at DESC);

-- SUPPORT TICKETS (genuinely missing)
CREATE TABLE IF NOT EXISTS support_tickets (
  ticket_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(user_id) ON DELETE SET NULL,
  subject     text NOT NULL,
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'open',
  priority    text NOT NULL DEFAULT 'medium',
  resolved_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user   ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_date   ON support_tickets(created_at DESC);
