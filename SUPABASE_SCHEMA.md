# Supabase Schema for User Data

This document contains the SQL schema needed to store user data in Supabase.

## Tables Required

### 1. study_sessions

Stores all study session data for each user.

```sql
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_path TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  category TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration INTEGER NOT NULL,
  problems_viewed INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_timestamp ON study_sessions(timestamp DESC);
CREATE INDEX idx_study_sessions_user_timestamp ON study_sessions(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own data
CREATE POLICY "Users can view their own study sessions"
  ON study_sessions FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (true);
```

### 2. lesson_completions

Stores lesson completion status for spaced repetition system.

```sql
CREATE TABLE lesson_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_path TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  completion_timestamp TIMESTAMPTZ NOT NULL,
  review_count INTEGER NOT NULL DEFAULT 0,
  next_review_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_path)
);

-- Create index for faster queries
CREATE INDEX idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX idx_lesson_completions_next_review ON lesson_completions(next_review_date);
CREATE INDEX idx_lesson_completions_user_review ON lesson_completions(user_id, next_review_date);

-- Enable Row Level Security
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own data
CREATE POLICY "Users can view their own lesson completions"
  ON lesson_completions FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own lesson completions"
  ON lesson_completions FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own lesson completions"
  ON lesson_completions FOR UPDATE
  USING (true);

-- Create policy to allow users to delete their own data
CREATE POLICY "Users can delete their own lesson completions"
  ON lesson_completions FOR DELETE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lesson_completions_updated_at
  BEFORE UPDATE ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. notes

Stores user notes with optional screenshots.

**Note:** Each user can have multiple notes.

```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  screenshot TEXT, -- Base64 encoded image
  path TEXT NOT NULL, -- Page path when note was created
  timestamp TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_timestamp ON notes(timestamp DESC);
CREATE INDEX idx_notes_user_timestamp ON notes(user_id, timestamp DESC);
CREATE INDEX idx_notes_path ON notes(path);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own notes
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own notes
CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own notes
CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (true);

-- Create policy to allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. bookmarks

Stores user's most recent bookmark for resume functionality.

**Note:** Each user can have only ONE bookmark (most recent page visited).

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL,
  title TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own bookmark
CREATE POLICY "Users can view their own bookmark"
  ON bookmarks FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own bookmark
CREATE POLICY "Users can insert their own bookmark"
  ON bookmarks FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own bookmark
CREATE POLICY "Users can update their own bookmark"
  ON bookmarks FOR UPDATE
  USING (true);

-- Create policy to allow users to delete their own bookmark
CREATE POLICY "Users can delete their own bookmark"
  ON bookmarks FOR DELETE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## How to Apply This Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire SQL from `supabase-schema.sql`
4. Click "Run" to execute all table creation statements at once

Or run each table individually:
- `study_sessions` table
- `lesson_completions` table
- `notes` table
- `bookmarks` table

## Data Storage

The application now uses Supabase for all user data storage:

1. **Study Sessions**: Automatically tracked when users complete study sessions
2. **Lesson Completions**: Tracked when users mark lessons as complete (spaced repetition system)
3. **Notes**: User-created notes with optional screenshots
4. **Bookmarks**: Stores user's most recent page for "Resume" functionality (one per user)

All data requires user authentication via Firebase.

## Future Enhancements

You may want to add:
- A sync function to migrate existing localStorage data to Supabase when a user first logs in
- Analytics queries to track aggregate user progress
- Backup/export functionality
- Data retention policies
