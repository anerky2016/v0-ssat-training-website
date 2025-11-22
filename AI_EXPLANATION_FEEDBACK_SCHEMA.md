# AI Explanation Feedback - Database Schema

This document describes the Supabase table schema for tracking feedback on AI-generated explanations.

## Table: `ai_explanation_feedback`

This table stores user feedback (thumbs up/down) on AI explanations to help improve explanation quality over time.

### SQL Schema

```sql
CREATE TABLE ai_explanation_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  question_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  feedback TEXT NOT NULL CHECK (feedback IN ('up', 'down')),
  regeneration_attempt INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for analyzing feedback by question
CREATE INDEX idx_ai_feedback_question_id
  ON ai_explanation_feedback(question_id);

-- Index for user feedback queries
CREATE INDEX idx_ai_feedback_user_id
  ON ai_explanation_feedback(user_id)
  WHERE user_id IS NOT NULL;

-- Index for analyzing feedback trends
CREATE INDEX idx_ai_feedback_created_at
  ON ai_explanation_feedback(created_at DESC);

-- Index for analyzing regeneration success
CREATE INDEX idx_ai_feedback_regeneration
  ON ai_explanation_feedback(regeneration_attempt, feedback);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | TEXT | Firebase user ID (nullable - can track anonymous feedback) |
| `question_id` | TEXT | Identifier for the question (e.g., "chapter2-q1") |
| `explanation` | TEXT | The AI-generated explanation that was shown |
| `feedback` | TEXT | User feedback: 'up' (helpful) or 'down' (not helpful) |
| `regeneration_attempt` | INTEGER | Which attempt this was (0 = first, 1+ = regenerated) |
| `created_at` | TIMESTAMP | When the feedback was given |

### Row Level Security (RLS)

Optional - allows anyone to submit feedback:

```sql
-- Enable RLS
ALTER TABLE ai_explanation_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert feedback (even anonymous users)
CREATE POLICY "Anyone can submit feedback"
  ON ai_explanation_feedback
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON ai_explanation_feedback
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true) OR user_id IS NULL);
```

### Example Data

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "firebase_user_abc123",
  "question_id": "chapter2-q15",
  "explanation": "The word 'barrier' means something that blocks or prevents progress. In this sentence, the technology is described as creating something that makes it difficult...",
  "feedback": "down",
  "regeneration_attempt": 0,
  "created_at": "2025-11-22T18:45:00.000Z"
}
```

### Analytics Queries

**1. Overall feedback ratio:**
```sql
SELECT
  feedback,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM ai_explanation_feedback
GROUP BY feedback;
```

**2. Success rate by regeneration attempt:**
```sql
SELECT
  regeneration_attempt,
  COUNT(*) as total,
  SUM(CASE WHEN feedback = 'up' THEN 1 ELSE 0 END) as thumbs_up,
  SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) as thumbs_down,
  ROUND(SUM(CASE WHEN feedback = 'up' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM ai_explanation_feedback
GROUP BY regeneration_attempt
ORDER BY regeneration_attempt;
```

**3. Most problematic questions (most thumbs down):**
```sql
SELECT
  question_id,
  COUNT(*) as total_feedback,
  SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) as thumbs_down,
  ROUND(SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as down_percentage
FROM ai_explanation_feedback
GROUP BY question_id
HAVING COUNT(*) >= 5  -- At least 5 feedback entries
ORDER BY down_percentage DESC, total_feedback DESC
LIMIT 20;
```

**4. Feedback trends over time:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN feedback = 'up' THEN 1 ELSE 0 END) as thumbs_up,
  SUM(CASE WHEN feedback = 'down' THEN 1 ELSE 0 END) as thumbs_down
FROM ai_explanation_feedback
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Features Enabled

Once this table is created, the following features will work:

1. **Thumbs Up/Down Buttons**: Students can rate AI explanations
2. **Automatic Regeneration**: Thumbs down triggers a new explanation
3. **Feedback Tracking**: All feedback stored with timestamps
4. **Analytics**: Track which questions need better explanations
5. **Improvement Loop**: Identify patterns to improve prompts

## Privacy Notes

- `user_id` is nullable to support anonymous feedback
- Even logged-out students can provide feedback
- Data is used solely for improving explanation quality
- No personally identifiable information beyond user_id is stored
