-- Create uploaded_books table
CREATE TABLE IF NOT EXISTS public.uploaded_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'epub')),
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER,
  current_location TEXT, -- For EPUB CFI location
  last_read_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 52428800) -- Max 50MB
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_uploaded_books_user_id ON public.uploaded_books(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_books_last_read ON public.uploaded_books(user_id, last_read_at DESC);

-- Enable Row Level Security
ALTER TABLE public.uploaded_books ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own books" ON public.uploaded_books;
DROP POLICY IF EXISTS "Users can insert their own books" ON public.uploaded_books;
DROP POLICY IF EXISTS "Users can update their own books" ON public.uploaded_books;
DROP POLICY IF EXISTS "Users can delete their own books" ON public.uploaded_books;

-- Create RLS policies
CREATE POLICY "Users can view their own books"
  ON public.uploaded_books
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own books"
  ON public.uploaded_books
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own books"
  ON public.uploaded_books
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can delete their own books"
  ON public.uploaded_books
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_uploaded_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS uploaded_books_updated_at ON public.uploaded_books;

CREATE TRIGGER uploaded_books_updated_at
  BEFORE UPDATE ON public.uploaded_books
  FOR EACH ROW
  EXECUTE FUNCTION update_uploaded_books_updated_at();

-- Create storage bucket for books if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DROP POLICY IF EXISTS "Users can upload their own books" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own books" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own books" ON storage.objects;

CREATE POLICY "Users can upload their own books"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'books' AND
    (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  );

CREATE POLICY "Users can view their own books"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'books' AND
    (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  );

CREATE POLICY "Users can delete their own books"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'books' AND
    (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  );
