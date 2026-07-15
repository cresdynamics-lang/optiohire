/* eslint-disable camelcase */
exports.shorthands = undefined

/**
 * Job roles catalog (searchable) + structured placement fields on cohort_candidates.
 * Roles seeded via: node scripts/seed-job-roles.mjs
 */
exports.up = (pgm) => {
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS pg_trgm`)

  pgm.sql(`
    CREATE TABLE IF NOT EXISTS job_roles (
      role_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug           TEXT UNIQUE NOT NULL,
      title          TEXT NOT NULL,
      group_name     TEXT,
      keywords       TEXT[] NOT NULL DEFAULT '{}',
      related_skills TEXT[] NOT NULL DEFAULT '{}',
      is_active      BOOLEAN NOT NULL DEFAULT TRUE,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_job_roles_title_lower ON job_roles (lower(title))`)
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_job_roles_keywords ON job_roles USING gin (keywords)`)
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_job_roles_active ON job_roles (is_active) WHERE is_active = true`)

  pgm.sql(`ALTER TABLE cohort_candidates ADD COLUMN IF NOT EXISTS placement_employer TEXT`)
  pgm.sql(`ALTER TABLE cohort_candidates ADD COLUMN IF NOT EXISTS placement_role TEXT`)
  pgm.sql(`ALTER TABLE cohort_candidates ADD COLUMN IF NOT EXISTS placement_job_posting_id UUID`)
  pgm.sql(`ALTER TABLE cohort_candidates ADD COLUMN IF NOT EXISTS placement_application_id UUID`)
  pgm.sql(`ALTER TABLE cohort_candidates ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ`)
}

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE cohort_candidates
      DROP COLUMN IF EXISTS placement_employer,
      DROP COLUMN IF EXISTS placement_role,
      DROP COLUMN IF EXISTS placement_job_posting_id,
      DROP COLUMN IF EXISTS placement_application_id,
      DROP COLUMN IF EXISTS placed_at;
    DROP TABLE IF EXISTS job_roles;
  `)
}
