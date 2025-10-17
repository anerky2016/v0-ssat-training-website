-- =====================================================
-- Migration: Add provider and provider_id columns
-- =====================================================
--
-- This migration adds support for tracking which OAuth
-- provider was used (Google, Apple, Facebook, etc.)
-- and the provider's unique user ID.
--
-- This is useful if you add more OAuth providers later
-- or if users change their email addresses.
--
-- Run this AFTER you've already run schema.sql
-- =====================================================

-- Add new columns for OAuth provider tracking
ALTER TABLE user_login_logs
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS provider_id TEXT;

-- Add comments
COMMENT ON COLUMN user_login_logs.provider IS
'OAuth provider used for login (e.g., google, facebook, apple)';

COMMENT ON COLUMN user_login_logs.provider_id IS
'Unique user ID from the OAuth provider (more stable than email)';

-- Create index for provider-based queries
CREATE INDEX IF NOT EXISTS idx_user_login_logs_provider
ON user_login_logs(provider, provider_id);

-- Backfill existing records with 'google' as provider
-- (Run this if you have existing data)
UPDATE user_login_logs
SET provider = 'google'
WHERE provider IS NULL;

-- =====================================================
-- Verify Migration
-- =====================================================

-- Check new columns exist
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_login_logs'
  AND column_name IN ('provider', 'provider_id');

-- Check data
SELECT
  email,
  name,
  provider,
  provider_id,
  login_at
FROM user_login_logs
ORDER BY login_at DESC
LIMIT 5;
