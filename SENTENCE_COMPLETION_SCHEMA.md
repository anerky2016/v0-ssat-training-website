# Sentence Completion Mistakes - Database Schema

This document describes the Supabase table schema required for the sentence completion mistake tracking feature.

## Table: `sentence_completion_mistakes`

This table stores incorrect answers from the sentence completion quiz for user review.

### SQL Schema

```sql
CREATE TABLE sentence_completion_mistakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for faster user queries
CREATE INDEX idx_sentence_completion_mistakes_user_id
  ON sentence_completion_mistakes(user_id);

-- Index for sorting by creation date
CREATE INDEX idx_sentence_completion_mistakes_created_at
  ON sentence_completion_mistakes(created_at DESC);

-- Composite index for user + question lookups
CREATE INDEX idx_sentence_completion_mistakes_user_question
  ON sentence_completion_mistakes(user_id, question_id);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | TEXT | Firebase user ID (from auth.currentUser.uid) |
| `question_id` | TEXT | Unique identifier for the question (e.g., "chapter2-q1") |
| `question` | TEXT | The full question text |
| `correct_answer` | TEXT | The correct answer to the question |
| `user_answer` | TEXT | The user's incorrect answer |
| `explanation` | TEXT | Optional explanation with pronunciation and definition |
| `created_at` | TIMESTAMP | When the mistake was recorded |

### Row Level Security (RLS)

To ensure users can only access their own mistakes:

```sql
-- Enable RLS
ALTER TABLE sentence_completion_mistakes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own mistakes
CREATE POLICY "Users can view own mistakes"
  ON sentence_completion_mistakes
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can insert their own mistakes
CREATE POLICY "Users can insert own mistakes"
  ON sentence_completion_mistakes
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Policy: Users can delete their own mistakes
CREATE POLICY "Users can delete own mistakes"
  ON sentence_completion_mistakes
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));
```

**Note:** The RLS policies assume you're setting the `app.current_user_id` configuration parameter in your Supabase queries. If you're using a different auth pattern, adjust the policies accordingly.

### Example Data

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "firebase_user_abc123",
  "question_id": "chapter2-q1",
  "question": "The new technological______ promises faster processing times and increased efficiency in data management.",
  "correct_answer": "advancement",
  "user_answer": "barrier",
  "explanation": "advancement: noun, /ədˈvænsmənt/, means development or improvement in a particular activity or field.\n\nNotes:",
  "created_at": "2025-11-22T18:30:00.000Z"
}
```

## Features Enabled

Once this table is created, the following features will work:

1. **Automatic Mistake Recording**: When users submit a quiz, incorrect answers are automatically saved
2. **Review Page**: Users can view all their past mistakes at `/vocabulary/sentence-completion/review`
3. **Statistics**: Track total mistakes, mistakes in last 7 days, and last 30 days
4. **Timestamped History**: Each mistake includes when it was made for progress tracking
5. **Clear Functionality**: Users can clear all their mistakes if desired

## API Usage

The following functions in `/lib/sentence-completion-mistakes.ts` use this table:

- `saveMistake()` - Save a single mistake
- `saveMistakes()` - Batch save multiple mistakes
- `getAllMistakes()` - Get all mistakes for current user
- `getMistakesByQuestion()` - Get mistakes for specific question
- `getRecentMistakes()` - Get mistakes from last N days
- `deleteMistake()` - Delete a specific mistake
- `clearAllMistakes()` - Delete all mistakes for current user
- `getMistakeStats()` - Get statistics about mistakes
