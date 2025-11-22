# Sentence Completion Progress - Database Schema

This document describes the Supabase table schema for tracking which questions users have completed.

## Table: `sentence_completion_progress`

This table stores which questions each user has finished (regardless of correct/incorrect).

### SQL Schema

```sql
CREATE TABLE sentence_completion_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Prevent duplicate entries for same user + question
  UNIQUE(user_id, question_id)
);

-- Index for querying user's completed questions
CREATE INDEX idx_progress_user_id
  ON sentence_completion_progress(user_id);

-- Index for checking specific question completion
CREATE INDEX idx_progress_user_question
  ON sentence_completion_progress(user_id, question_id);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | TEXT | Firebase user ID |
| `question_id` | TEXT | Question identifier (e.g., "chapter2-q1") |
| `completed_at` | TIMESTAMP | When the question was completed |

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE sentence_completion_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only insert their own progress
CREATE POLICY "Users can insert own progress"
  ON sentence_completion_progress
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can only view their own progress
CREATE POLICY "Users can view own progress"
  ON sentence_completion_progress
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can delete their own progress (for reset)
CREATE POLICY "Users can delete own progress"
  ON sentence_completion_progress
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));
```

### Example Data

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "firebase_user_abc123",
  "question_id": "chapter2-q15",
  "completed_at": "2025-11-22T18:45:00.000Z"
}
```

### API Functions Needed

**1. Load completed questions for user:**
```typescript
async function getCompletedQuestions(userId: string): Promise<string[]>
```

**2. Mark questions as completed:**
```typescript
async function markQuestionsCompleted(userId: string, questionIds: string[]): Promise<number>
```

**3. Reset all progress:**
```typescript
async function resetProgress(userId: string): Promise<boolean>
```

## Features Enabled

Once this table is created, the following features will work:

1. **Cross-Device Sync**: Progress saved per user, accessible from any device
2. **Persistent Storage**: Completion data survives localStorage clearing
3. **User-Specific**: Each user has their own completion tracking
4. **Reset Capability**: Users can reset their progress anytime
5. **Audit Trail**: Track when each question was completed

## Migration Notes

- Anonymous users: Use localStorage fallback (current behavior)
- Logged-in users: Sync to database
- On login: Merge localStorage data with database data
- On logout: Keep localStorage for anonymous tracking
