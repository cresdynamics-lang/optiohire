/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.sql(`
    -- Institution Onboarding Invites
    CREATE TABLE IF NOT EXISTS institution_onboarding_invites (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token             TEXT UNIQUE NOT NULL,
      institution_name  TEXT NOT NULL,
      sent_to           TEXT NOT NULL,
      status            TEXT DEFAULT 'not_opened' CHECK (status IN ('not_opened','opened','completed')),
      sent_at           TIMESTAMPTZ DEFAULT now(),
      opened_at         TIMESTAMPTZ,
      completed_at      TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS idx_inst_onboarding_token ON institution_onboarding_invites(token);
    CREATE INDEX IF NOT EXISTS idx_inst_onboarding_status ON institution_onboarding_invites(status);
  `);
};

exports.down = (pgm) => {
    pgm.sql(`
    DROP TABLE IF EXISTS institution_onboarding_invites;
  `);
};
