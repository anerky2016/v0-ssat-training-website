-- =====================================================
-- Supabase Schema for User Login Tracking
-- =====================================================
--
-- This script creates the user_login_logs table and
-- sets up Row Level Security (RLS) policies.
--
-- To run this script:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Click "New Query"
-- 4. Paste this entire script
-- 5. Click "Run" or press Cmd/Ctrl + Enter
-- =====================================================

-- Drop existing table (CAUTION: This will delete all existing data!)
-- Uncomment the line below if you want to start fresh
-- DROP TABLE IF EXISTS user_login_logs CASCADE;

-- Create user_login_logs table
CREATE TABLE IF NOT EXISTS user_login_logs (
  -- Primary key with auto-generated UUID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User information
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,

  -- Timestamp information
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Technical information
  user_agent TEXT,
  ip_address TEXT
);

-- =====================================================
-- Create Indexes for Performance
-- =====================================================

-- Index on user_id for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_user_login_logs_user_id
ON user_login_logs(user_id);

-- Index on email for email-based lookups
CREATE INDEX IF NOT EXISTS idx_user_login_logs_email
ON user_login_logs(email);

-- Index on login_at (descending) for recent logins queries
CREATE INDEX IF NOT EXISTS idx_user_login_logs_login_at
ON user_login_logs(login_at DESC);

-- Composite index for user + time range queries
CREATE INDEX IF NOT EXISTS idx_user_login_logs_user_time
ON user_login_logs(user_id, login_at DESC);

-- =====================================================
-- Add Comments for Documentation
-- =====================================================

COMMENT ON TABLE user_login_logs IS
'Tracks user login events for analytics and monitoring purposes';

COMMENT ON COLUMN user_login_logs.id IS
'Unique identifier for each login record';

COMMENT ON COLUMN user_login_logs.user_id IS
'User identifier (email address used as unique ID)';

COMMENT ON COLUMN user_login_logs.email IS
'User email address from OAuth provider';

COMMENT ON COLUMN user_login_logs.name IS
'User display name from OAuth provider (e.g., Google)';

COMMENT ON COLUMN user_login_logs.image IS
'URL to user profile image from OAuth provider';

COMMENT ON COLUMN user_login_logs.login_at IS
'Timestamp when the user logged in (with timezone)';

COMMENT ON COLUMN user_login_logs.user_agent IS
'Browser user agent string for device/browser tracking';

COMMENT ON COLUMN user_login_logs.ip_address IS
'User IP address (optional, requires additional server-side setup)';

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE user_login_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Create RLS Policies
-- =====================================================

-- Policy 1: Allow anyone to insert login records
-- This allows the Next.js app to log logins using the anon key
CREATE POLICY "Enable insert for all users"
ON user_login_logs
FOR INSERT
WITH CHECK (true);

-- Policy 2: Allow anyone to read login records
-- This allows analytics queries using the anon key
CREATE POLICY "Enable read for all users"
ON user_login_logs
FOR SELECT
USING (true);

-- =====================================================
-- Optional: Restrict Read Access to Authenticated Users Only
-- =====================================================
-- If you want only authenticated users to read data,
-- uncomment the following lines:

-- DROP POLICY IF EXISTS "Enable read for all users" ON user_login_logs;
-- CREATE POLICY "Enable read for authenticated users"
-- ON user_login_logs
-- FOR SELECT
-- USING (auth.role() = 'authenticated');

-- =====================================================
-- Optional: Add Update and Delete Policies
-- =====================================================
-- Uncomment these if you need to update or delete records

-- Allow updates (for admin purposes)
-- CREATE POLICY "Enable update for authenticated users"
-- ON user_login_logs
-- FOR UPDATE
-- USING (auth.role() = 'authenticated')
-- WITH CHECK (auth.role() = 'authenticated');

-- Allow deletes (for GDPR compliance)
-- CREATE POLICY "Enable delete for authenticated users"
-- ON user_login_logs
-- FOR DELETE
-- USING (auth.role() = 'authenticated');

-- =====================================================
-- Verify Setup
-- =====================================================

-- Check if table was created successfully
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'user_login_logs';

-- Check if indexes were created
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_login_logs';

-- Check if RLS is enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_login_logs';

-- Check RLS policies
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_login_logs';

-- =====================================================
-- Test Query (Optional)
-- =====================================================

-- Insert a test record
INSERT INTO user_login_logs (
  user_id,
  email,
  name,
  image,
  user_agent
) VALUES (
  'test@example.com',
  'test@example.com',
  'Test User',
  'https://example.com/avatar.jpg',
  'Mozilla/5.0 (Test Browser)'
);

-- Query the test record
SELECT * FROM user_login_logs
WHERE email = 'test@example.com'
ORDER BY login_at DESC
LIMIT 1;

-- Delete the test record
DELETE FROM user_login_logs
WHERE email = 'test@example.com';

-- =====================================================
-- Setup Complete!
-- =====================================================
--
-- Next steps:
-- 1. Copy your Project URL and Anon Key from Settings → API
-- 2. Add them to your .env.local file:
--    NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
-- 3. Restart your Next.js dev server
-- 4. Sign in with Google and check this table!
-- =====================================================
