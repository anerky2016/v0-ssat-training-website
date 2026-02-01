-- Fix RLS policies for uploaded_books table
-- Since we're using Firebase Auth, we can't use Supabase's current_setting for RLS
-- Instead, we'll use permissive policies and handle authorization in the API layer

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own books" ON public.uploaded_books;
DROP POLICY IF EXISTS "Users can insert their own books" ON public.uploaded_books;
DROP POLICY IF EXISTS "Users can update their own books" ON public.uploaded_books;
DROP POLICY IF EXISTS "Users can delete their own books" ON public.uploaded_books;

-- Create permissive RLS policies
-- Security is enforced at the API layer using Firebase Auth

CREATE POLICY "Allow all selects on uploaded_books"
  ON public.uploaded_books
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all inserts on uploaded_books"
  ON public.uploaded_books
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all updates on uploaded_books"
  ON public.uploaded_books
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes on uploaded_books"
  ON public.uploaded_books
  FOR DELETE
  USING (true);

-- Note: Security is enforced at the API layer using Firebase Auth
-- The API verifies userId before allowing any database operations
-- Each row has user_id field for filtering and access control
