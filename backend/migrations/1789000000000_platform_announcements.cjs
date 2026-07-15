/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS platform_announcements (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title           TEXT NOT NULL,
      body            TEXT NOT NULL,
      category        TEXT NOT NULL DEFAULT 'platform',
      audiences       TEXT[] NOT NULL DEFAULT ARRAY['all'],
      institution_id  UUID REFERENCES institutions(id) ON DELETE CASCADE,
      is_active       BOOLEAN NOT NULL DEFAULT true,
      published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at      TIMESTAMPTZ,
      created_by      UUID,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_platform_announcements_active
      ON platform_announcements (published_at DESC)
      WHERE is_active = true;

    CREATE INDEX IF NOT EXISTS idx_platform_announcements_audiences
      ON platform_announcements USING GIN (audiences);

    -- Seed cross-platform announcements (idempotent by title)
    INSERT INTO platform_announcements (title, body, category, audiences)
    SELECT v.title, v.body, v.category, v.audiences
    FROM (VALUES
      (
        'Welcome to OptioHire',
        'Your career workspace is live. Complete your talent profile, set target roles, and explore matched job opportunities.',
        'platform',
        ARRAY['candidate']::TEXT[]
      ),
      (
        'Hiring workspace updates',
        'Post roles, review AI-ranked applicants, and schedule interviews - all from your employer dashboard.',
        'platform',
        ARRAY['employer']::TEXT[]
      ),
      (
        'Institution partner updates',
        'Track student performance, employer engagement, and placements. Request onboarding sessions from Operations when you are ready.',
        'platform',
        ARRAY['institution']::TEXT[]
      ),
      (
        'Platform-wide notice',
        'OptioHire is expanding employer partnerships across Kenya. Check Announcements in your sidebar for the latest updates.',
        'partnership',
        ARRAY['all']::TEXT[]
      )
    ) AS v(title, body, category, audiences)
    WHERE NOT EXISTS (
      SELECT 1 FROM platform_announcements p WHERE p.title = v.title
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS platform_announcements;`);
};
