-- ============================================================================
-- Admin Operations Dashboard - Additional Schema
-- ============================================================================
-- This schema adds tables for comprehensive admin operations:
-- - Admin action logs
-- - Email logs
-- - System settings
-- - Time tracking
-- - Signup queue
-- - Workflow configuration
-- ============================================================================

-- ============================================================================
-- ADMIN ACTION LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_action_logs (
  log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE SET NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action_details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_user ON admin_action_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action_type ON admin_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_entity ON admin_action_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created ON admin_action_logs(created_at DESC);

-- ============================================================================
-- EMAIL LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  email_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  email_type text NOT NULL, -- 'password_reset', 'application_notification', 'report', etc.
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  provider text, -- 'resend', 'sendgrid', 'smtp'
  provider_message_id text,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_provider ON email_logs(provider);

-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
  setting_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'array'
  category text NOT NULL DEFAULT 'general', -- 'general', 'email', 'features', 'limits', 'workflow'
  description text,
  is_public boolean DEFAULT false, -- Whether frontend can access this setting
  updated_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('require_signup_approval', 'false'::jsonb, 'boolean', 'features', 'Require admin approval for new signups', false),
  ('max_users_per_company', '100'::jsonb, 'number', 'limits', 'Maximum users allowed per company', false),
  ('email_rate_limit', '1000'::jsonb, 'number', 'email', 'Maximum emails per hour', false),
  ('enable_email_notifications', 'true'::jsonb, 'boolean', 'email', 'Enable email notifications', true),
  ('system_maintenance_mode', 'false'::jsonb, 'boolean', 'general', 'System maintenance mode', true),
  ('default_user_role', '"user"'::jsonb, 'string', 'features', 'Default role for new users', false)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- TIME TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS time_tracking (
  track_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  session_id text,
  action_type text NOT NULL, -- 'login', 'logout', 'api_call', 'page_view', 'action'
  endpoint text,
  method text, -- 'GET', 'POST', 'PATCH', 'DELETE'
  response_time_ms integer,
  status_code integer,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_tracking_user ON time_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_session ON time_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_action ON time_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_time_tracking_created ON time_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_tracking_endpoint ON time_tracking(endpoint);

-- ============================================================================
-- SIGNUP QUEUE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS signup_queue (
  queue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  company_name text,
  company_email text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason text,
  reviewed_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signup_queue_status ON signup_queue(status);
CREATE INDEX IF NOT EXISTS idx_signup_queue_created ON signup_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signup_queue_user ON signup_queue(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_signup_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_signup_queue_updated_at ON signup_queue;
CREATE TRIGGER trg_signup_queue_updated_at
  BEFORE UPDATE ON signup_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_signup_queue_updated_at();

-- ============================================================================
-- WORKFLOW CONFIGURATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_config (
  workflow_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text UNIQUE NOT NULL,
  workflow_type text NOT NULL, -- 'email', 'application', 'approval', 'notification'
  is_active boolean DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_config_type ON workflow_config(workflow_type);
CREATE INDEX IF NOT EXISTS idx_workflow_config_active ON workflow_config(is_active) WHERE is_active = true;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_workflow_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workflow_config_updated_at ON workflow_config;
CREATE TRIGGER trg_workflow_config_updated_at
  BEFORE UPDATE ON workflow_config
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_config_updated_at();

-- Insert default workflows
INSERT INTO workflow_config (workflow_name, workflow_type, is_active, config, description) VALUES
  ('email_password_reset', 'email', true, '{"enabled": true, "template": "password_reset"}'::jsonb, 'Email workflow for password reset'),
  ('email_application_notification', 'email', true, '{"enabled": true, "template": "application_notification"}'::jsonb, 'Email workflow for application notifications'),
  ('application_approval', 'approval', true, '{"require_approval": false, "auto_approve": true}'::jsonb, 'Application approval workflow'),
  ('signup_approval', 'approval', true, '{"require_approval": false, "auto_approve": true}'::jsonb, 'Signup approval workflow')
ON CONFLICT (workflow_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE admin_action_logs IS 'Logs all admin actions for audit trail';
COMMENT ON TABLE email_logs IS 'Logs all email sending attempts and status';
COMMENT ON TABLE system_settings IS 'System-wide configuration and feature flags';
COMMENT ON TABLE time_tracking IS 'Tracks user activity, API calls, and performance metrics';
COMMENT ON TABLE signup_queue IS 'Queue for pending user signups awaiting approval';
COMMENT ON TABLE workflow_config IS 'Workflow configurations for email, approval, and notification flows';

