-- Create vocabulary_difficulty table
-- This table stores per-user difficulty ratings for vocabulary words

CREATE TABLE IF NOT EXISTS vocabulary_difficulty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty SMALLINT NOT NULL CHECK (difficulty >= 0 AND difficulty <= 3),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, word)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_user_id ON vocabulary_difficulty(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_word ON vocabulary_difficulty(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_user_word ON vocabulary_difficulty(user_id, word);

-- Add RLS (Row Level Security) policies
ALTER TABLE vocabulary_difficulty ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own vocabulary difficulties
CREATE POLICY "Users can view own vocabulary difficulties"
  ON vocabulary_difficulty
  FOR SELECT
  USING (true); -- Allow all reads for now, can be restricted later

-- Policy: Users can insert their own vocabulary difficulties
CREATE POLICY "Users can insert own vocabulary difficulties"
  ON vocabulary_difficulty
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts for now

-- Policy: Users can update their own vocabulary difficulties
CREATE POLICY "Users can update own vocabulary difficulties"
  ON vocabulary_difficulty
  FOR UPDATE
  USING (true); -- Allow all updates for now

-- Policy: Users can delete their own vocabulary difficulties
CREATE POLICY "Users can delete own vocabulary difficulties"
  ON vocabulary_difficulty
  FOR DELETE
  USING (true); -- Allow all deletes for now

-- Add comment to table
COMMENT ON TABLE vocabulary_difficulty IS 'Stores user-specific difficulty ratings for vocabulary words (0=Easy, 1=Medium, 2=Hard, 3=Very Hard)';
COMMENT ON COLUMN vocabulary_difficulty.difficulty IS 'Difficulty level: 0 (Easy), 1 (Medium), 2 (Hard), 3 (Very Hard)';
