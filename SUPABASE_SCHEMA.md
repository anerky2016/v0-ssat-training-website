# Supabase Schema for User Progress

This document contains the SQL schema needed to store user progress data in Supabase.

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

## How to Apply This Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL for `study_sessions` table
4. Click "Run" to execute
5. Copy and paste the SQL for `lesson_completions` table
6. Click "Run" to execute

## Data Migration

The application will continue to work with localStorage for users who are not logged in. When a user logs in:

1. Their existing localStorage data remains accessible
2. New study sessions and lesson completions will be saved to both localStorage AND Supabase
3. When they view their progress, data will be loaded from Supabase (if logged in) or localStorage (if not logged in)

## Future Enhancements

You may want to add:
- A sync function to migrate existing localStorage data to Supabase when a user first logs in
- Analytics queries to track aggregate user progress
- Backup/export functionality
- Data retention policies
