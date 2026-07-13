/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.sql(`
    -- Enterprise / Institution "Apply now" submissions.
    -- Captured from the public landing page so the team can onboard & coordinate.
    CREATE TABLE IF NOT EXISTS institution_applications (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_name TEXT NOT NULL,
      organization_type TEXT NOT NULL DEFAULT 'enterprise' CHECK (organization_type IN ('enterprise','institution','university','other')),
      contact_name      TEXT NOT NULL,
      contact_email     TEXT NOT NULL,
      contact_phone     TEXT,
      country           TEXT,
      team_size         TEXT,
      message           TEXT,
      status            TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','onboarding','active','rejected')),
      created_at        TIMESTAMPTZ DEFAULT now(),
      updated_at        TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_inst_apps_status ON institution_applications(status);
    CREATE INDEX IF NOT EXISTS idx_inst_apps_created ON institution_applications(created_at DESC);
  `);
};

exports.down = (pgm) => {
    pgm.sql(`
    DROP TABLE IF EXISTS institution_applications;
  `);
};
