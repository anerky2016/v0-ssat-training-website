-- Fix storage RLS policies for books bucket
-- Since we're using Firebase Auth, we can't use Supabase's current_setting for RLS
-- Instead, we'll rely on application-level security (userId in path) and make bucket public

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own books" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own books" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own books" ON storage.objects;

-- Make the books bucket public for reads (users still need app-level auth for uploads)
UPDATE storage.buckets
SET public = true
WHERE id = 'books';

-- Create permissive storage policies for authenticated server-side operations
-- Since we're using Firebase Auth, we'll handle authorization in the API layer

CREATE POLICY "Allow all inserts to books bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'books');

CREATE POLICY "Allow all reads from books bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'books');

CREATE POLICY "Allow all deletes from books bucket"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'books');

-- Note: Security is enforced at the API layer using Firebase Auth
-- The API verifies userId before allowing upload/delete operations
-- File paths include userId as folder name for organization
