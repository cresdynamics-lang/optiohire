/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.sql(`
    -- Institutions (tenant)
    CREATE TABLE IF NOT EXISTS institutions (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name              TEXT NOT NULL,
      slug              TEXT UNIQUE NOT NULL,
      country           TEXT DEFAULT 'KE',
      contact_email     TEXT NOT NULL,
      brand_accent_hex  TEXT DEFAULT '#1F4D3D',
      email_signature   TEXT,
      sis_sync_enabled  BOOLEAN DEFAULT FALSE,
      created_at        TIMESTAMPTZ DEFAULT now()
    );

    -- Institution staff accounts + roles
    CREATE TABLE IF NOT EXISTS institution_admins (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
      user_id        UUID REFERENCES users(user_id),
      role           TEXT NOT NULL CHECK (role IN ('owner','roster_manager','viewer')),
      created_at     TIMESTAMPTZ DEFAULT now()
    );

    -- Cohorts
    CREATE TABLE IF NOT EXISTS cohorts (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id      UUID REFERENCES institutions(id) ON DELETE CASCADE,
      name                TEXT NOT NULL,
      programme           TEXT,
      academic_level      TEXT CHECK (academic_level IN ('certificate','diploma','degree','postgraduate')),
      placement_tracks    TEXT[] NOT NULL DEFAULT '{}',
      expected_completion DATE,
      status              TEXT DEFAULT 'active' CHECK (status IN ('active','closed','archived')),
      source_filename     TEXT,
      created_by          UUID REFERENCES institution_admins(id),
      created_at          TIMESTAMPTZ DEFAULT now()
    );

    -- Cohort candidates (roster)
    CREATE TABLE IF NOT EXISTS cohort_candidates (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cohort_id      UUID REFERENCES cohorts(id) ON DELETE CASCADE,
      candidate_name TEXT,
      email          TEXT NOT NULL,
      student_id     TEXT,
      department     TEXT,
      phone          TEXT,
      row_status     TEXT DEFAULT 'invited' CHECK (
                        row_status IN ('enrolled','invited','activated','shortlisted','interviewing','placed','interning','requires_review','pool')
                     ),
      match_score    NUMERIC(5,2),
      matched_to     TEXT,
      invited_at     TIMESTAMPTZ,
      activated_at   TIMESTAMPTZ,
      last_activity  TIMESTAMPTZ DEFAULT now(),
      raw_row        JSONB,
      UNIQUE(cohort_id, email)
    );

    -- Cohort uploads (audit + reprocessing)
    CREATE TABLE IF NOT EXISTS cohort_uploads (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cohort_id         UUID REFERENCES cohorts(id),
      original_filename TEXT,
      row_count         INT,
      valid_rows        INT,
      duplicate_rows    INT,
      flagged_rows      INT,
      column_mapping    JSONB,
      status            TEXT DEFAULT 'processing' CHECK (
                          status IN ('processing','mapped','sent','failed')
                        ),
      created_at        TIMESTAMPTZ DEFAULT now()
    );

    -- Institution notifications log
    CREATE TABLE IF NOT EXISTS institution_notifications (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      institution_id  UUID REFERENCES institutions(id),
      cohort_id       UUID REFERENCES cohorts(id),
      type            TEXT CHECK (type IN ('onboarding_invite','reminder','shortlist_alert','placement_confirmation')),
      recipients      INT,
      opened          INT DEFAULT 0,
      activated       INT DEFAULT 0,
      sent_at         TIMESTAMPTZ DEFAULT now()
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_institution_admins_institution ON institution_admins(institution_id);
    CREATE INDEX IF NOT EXISTS idx_institution_admins_user        ON institution_admins(user_id);
    CREATE INDEX IF NOT EXISTS idx_cohorts_institution            ON cohorts(institution_id);
    CREATE INDEX IF NOT EXISTS idx_cohorts_status                 ON cohorts(status);
    CREATE INDEX IF NOT EXISTS idx_cohort_candidates_cohort       ON cohort_candidates(cohort_id);
    CREATE INDEX IF NOT EXISTS idx_cohort_candidates_email        ON cohort_candidates(email);
    CREATE INDEX IF NOT EXISTS idx_cohort_candidates_status       ON cohort_candidates(row_status);
    CREATE INDEX IF NOT EXISTS idx_cohort_uploads_cohort          ON cohort_uploads(cohort_id);
    CREATE INDEX IF NOT EXISTS idx_institution_notifs_institution ON institution_notifications(institution_id);
  `);
};

exports.down = (pgm) => {
    pgm.sql(`
    DROP TABLE IF EXISTS institution_notifications;
    DROP TABLE IF EXISTS cohort_uploads;
    DROP TABLE IF EXISTS cohort_candidates;
    DROP TABLE IF EXISTS cohorts;
    DROP TABLE IF EXISTS institution_admins;
    DROP TABLE IF EXISTS institutions;
  `);
};
