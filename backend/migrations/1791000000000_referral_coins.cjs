/* eslint-disable camelcase */
exports.shorthands = undefined;

/**
 * OptioHire coins + referral program (HR & candidates).
 * Successful signup via a referral link awards the referrer 5 coins.
 */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS coin_balance INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS referral_code TEXT;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code
      ON users (referral_code)
      WHERE referral_code IS NOT NULL;

    CREATE TABLE IF NOT EXISTS referrals (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      referee_user_id  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      referral_code    TEXT NOT NULL,
      coins_awarded    INTEGER NOT NULL DEFAULT 5,
      status           TEXT NOT NULL DEFAULT 'completed'
                       CHECK (status IN ('pending', 'completed', 'revoked')),
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (referee_user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_referrals_referrer
      ON referrals (referrer_user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS coin_ledger (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      amount       INTEGER NOT NULL,
      reason       TEXT NOT NULL,
      reference_id UUID,
      meta         JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_coin_ledger_user
      ON coin_ledger (user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS coin_redemptions (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      perk       TEXT NOT NULL,
      cost       INTEGER NOT NULL,
      expires_at TIMESTAMPTZ,
      meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_coin_redemptions_user
      ON coin_redemptions (user_id, created_at DESC);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS coin_redemptions;
    DROP TABLE IF EXISTS coin_ledger;
    DROP TABLE IF EXISTS referrals;
    DROP INDEX IF EXISTS idx_users_referral_code;
    ALTER TABLE users
      DROP COLUMN IF EXISTS coin_balance,
      DROP COLUMN IF EXISTS referral_code;
  `);
};
