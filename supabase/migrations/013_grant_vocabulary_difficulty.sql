-- Migration: Grant permissions for vocabulary_difficulty table
-- Description: Add missing GRANT statements for anon and authenticated roles
-- Issue: 406 Not Acceptable error because roles don't have table access
-- Date: 2026-02-01

-- Grant full access to vocabulary_difficulty table
GRANT ALL ON vocabulary_difficulty TO anon, authenticated;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify grants were applied
SELECT
  grantee,
  privilege_type,
  table_name
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'vocabulary_difficulty'
ORDER BY grantee, privilege_type;

COMMENT ON TABLE vocabulary_difficulty IS $$User-specific difficulty ratings for vocabulary words.
Uses Firebase Auth for authentication (client-side).
RLS is NOT enabled - security enforced by client code.
Full access granted to anon and authenticated roles.$$;
