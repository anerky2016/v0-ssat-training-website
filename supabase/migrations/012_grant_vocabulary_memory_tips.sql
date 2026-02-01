-- Migration: Grant permissions for vocabulary_memory_tips table
-- Description: Add missing GRANT statements for anon and authenticated roles
-- Issue: 406 Not Acceptable error because roles don't have table access
-- Date: 2026-02-01

-- Grant full access to vocabulary_memory_tips table
GRANT ALL ON vocabulary_memory_tips TO anon, authenticated;

-- Grant usage on the sequence (needed for INSERT with auto-incrementing id)
GRANT USAGE, SELECT ON SEQUENCE vocabulary_memory_tips_id_seq TO anon, authenticated;

-- Verify grants were applied
SELECT
  grantee,
  privilege_type,
  table_name
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'vocabulary_memory_tips'
ORDER BY grantee, privilege_type;

COMMENT ON TABLE vocabulary_memory_tips IS $$Custom AI-generated memory tips for vocabulary words.
Uses Firebase Auth for authentication (client-side).
RLS is NOT enabled - security enforced by client code.
Full access granted to anon and authenticated roles.$$;
