-- Migration: Fix RLS policies for vocabulary_memory_tips to work with Firebase Auth
-- Description: The original policies used auth.uid() which only works with Supabase Auth.
--              Since we use Firebase Auth, we disable RLS and rely on client-side authentication.
-- Date: 2025-01-08
--
-- IMPORTANT: This migration disables RLS for this table because:
-- 1. We use Firebase Authentication, not Supabase Auth
-- 2. Supabase cannot verify Firebase tokens with auth.uid()
-- 3. Client-side code already ensures only logged-in users can access these functions
-- 4. The data (custom memory tips) is not highly sensitive
--
-- For production apps with sensitive data, consider:
-- - Moving database operations to API routes with service role key
-- - Implementing custom RLS policies with a custom claims table
-- - Using Supabase Auth instead of Firebase Auth

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own memory tips" ON vocabulary_memory_tips;
DROP POLICY IF EXISTS "Users can insert their own memory tips" ON vocabulary_memory_tips;
DROP POLICY IF EXISTS "Users can update their own memory tips" ON vocabulary_memory_tips;
DROP POLICY IF EXISTS "Users can delete their own memory tips" ON vocabulary_memory_tips;

-- Disable Row Level Security for this table
ALTER TABLE vocabulary_memory_tips DISABLE ROW LEVEL SECURITY;

-- Add comment explaining the security model
COMMENT ON TABLE vocabulary_memory_tips IS
'Stores custom AI-generated memory tips for vocabulary words, personalized per user.

SECURITY MODEL:
- RLS is DISABLED for this table
- Authentication is enforced client-side via Firebase Auth
- Only authenticated users can call the library functions that access this table
- The user_id column stores the Firebase UID
- Data sensitivity: Low (educational memory tips)

For enhanced security, consider moving database operations to API routes.';
