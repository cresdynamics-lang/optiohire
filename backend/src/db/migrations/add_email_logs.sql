-- Email logs table (used by EmailService when sending verification, welcome, etc.)
-- Run once: sudo -u postgres psql -d optiohire -f backend/src/db/migrations/add_email_logs.sql

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

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON email_logs TO optiohire_user;
