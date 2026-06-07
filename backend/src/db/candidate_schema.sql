-- ============================================================================
-- Candidate Talent Profile Dashboard - Additional Schema
-- ============================================================================
-- This schema adds tables for the comprehensive candidate dashboard:
-- - Candidate Profiles (links to existing users with company_role='candidate')
-- - Candidate Skills
-- - Job Recommendations (pre-calculated matches)
-- - Certificate Approvals (Admin queue)
-- - Candidate Missions (Daily learning tasks)
-- ============================================================================

-- ============================================================================
-- STUDENT PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_profiles (
  profile_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  total_score integer DEFAULT 0,
  active_learning_path text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_candidate_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_score ON candidate_profiles(total_score DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_candidate_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_candidate_profiles_updated_at ON candidate_profiles;
CREATE TRIGGER trg_candidate_profiles_updated_at
  BEFORE UPDATE ON candidate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_profiles_updated_at();

-- ============================================================================
-- STUDENT SKILLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_skills (
  skill_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency_score integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  certificate_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_candidate_skill UNIQUE (profile_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_candidate_skills_profile ON candidate_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_name ON candidate_skills(skill_name);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_candidate_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_candidate_skills_updated_at ON candidate_skills;
CREATE TRIGGER trg_candidate_skills_updated_at
  BEFORE UPDATE ON candidate_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_skills_updated_at();

-- ============================================================================
-- CERTIFICATE APPROVALS QUEUE (Admin Workflow)
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificate_approvals (
  approval_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES candidate_skills(skill_id) ON DELETE CASCADE,
  certificate_url text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
  reviewed_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  rejection_reason text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_certificate_approvals_status ON certificate_approvals(status);
CREATE INDEX IF NOT EXISTS idx_certificate_approvals_skill ON certificate_approvals(skill_id);

-- ============================================================================
-- JOB RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_recommendations (
  recommendation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
  job_posting_id uuid NOT NULL REFERENCES job_postings(job_posting_id) ON DELETE CASCADE,
  match_score integer NOT NULL,
  match_reason text,
  missing_skills jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_job_recommendation UNIQUE (profile_id, job_posting_id)
);

CREATE INDEX IF NOT EXISTS idx_job_recommendations_profile ON job_recommendations(profile_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON job_recommendations(match_score DESC);

-- ============================================================================
-- STUDENT MISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_missions (
  mission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
  mission_title text NOT NULL,
  mission_description text NOT NULL,
  target_skill text NOT NULL,
  learning_resources jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_missions_profile ON candidate_missions(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidate_missions_status ON candidate_missions(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_candidate_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_candidate_missions_updated_at ON candidate_missions;
CREATE TRIGGER trg_candidate_missions_updated_at
  BEFORE UPDATE ON candidate_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_missions_updated_at();

-- ============================================================================
-- CANDIDATE MOCK INTERVIEW SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate_interview_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES candidate_profiles(profile_id) ON DELETE CASCADE,
  interview_type text NOT NULL,
  target_role text,
  level text,
  overall_score integer NOT NULL DEFAULT 0,
  clarity_score integer NOT NULL DEFAULT 0,
  relevance_score integer NOT NULL DEFAULT 0,
  depth_score integer NOT NULL DEFAULT 0,
  feedback text,
  recommendations jsonb DEFAULT '[]'::jsonb,
  transcript jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_interview_sessions_profile ON candidate_interview_sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidate_interview_sessions_created ON candidate_interview_sessions(created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE candidate_profiles IS 'Core profile data for candidates/candidates tied to user accounts';
COMMENT ON TABLE candidate_skills IS 'Skills acquired by a candidate, proficiency score, and verification status';
COMMENT ON TABLE certificate_approvals IS 'Admin queue for reviewing and approving uploaded certificates';
COMMENT ON TABLE job_recommendations IS 'AI-generated job recommendations based on skill matches';
COMMENT ON TABLE candidate_missions IS 'Daily learning tasks assigned to candidates to bridge skill gaps';
COMMENT ON TABLE candidate_interview_sessions IS 'Mock interview practice sessions and structured feedback for candidate talent profiles';
