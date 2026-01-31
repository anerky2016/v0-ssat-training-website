# Database Migration: Uploaded Books

## To Apply Migration 009_uploaded_books.sql

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/mmzilrfnwdjxekwyzmsr
2. Navigate to **SQL Editor** in the left sidebar
3. Click "+ New query"
4. Copy the contents of `009_uploaded_books.sql` and paste it into the editor
5. Click "Run" to execute the migration

This will:
- Create the `uploaded_books` table for storing book metadata
- Create the `books` storage bucket for storing PDF/EPUB files
- Set up Row Level Security (RLS) policies
- Configure storage policies for user file access

## Verifying the Migration

After running the migration, verify it worked:

```sql
-- Check if table exists
SELECT * FROM uploaded_books LIMIT 1;

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'books';
```

## Rolling Back

If needed, you can roll back by running:

```sql
DROP TABLE IF EXISTS uploaded_books CASCADE;
DELETE FROM storage.buckets WHERE name = 'books';
```
