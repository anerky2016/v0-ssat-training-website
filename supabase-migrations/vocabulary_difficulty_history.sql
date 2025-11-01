-- Create vocabulary_difficulty_history table
-- This table stores the history of difficulty level changes for vocabulary words

CREATE TABLE IF NOT EXISTS vocabulary_difficulty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  old_difficulty SMALLINT CHECK (old_difficulty >= 0 AND old_difficulty <= 3),
  new_difficulty SMALLINT NOT NULL CHECK (new_difficulty >= 0 AND new_difficulty <= 3),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_history_user_id ON vocabulary_difficulty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_history_word ON vocabulary_difficulty_history(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_history_user_word ON vocabulary_difficulty_history(user_id, word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_history_changed_at ON vocabulary_difficulty_history(changed_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE vocabulary_difficulty_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own vocabulary difficulty history
CREATE POLICY "Users can view own vocabulary difficulty history"
  ON vocabulary_difficulty_history
  FOR SELECT
  USING (true); -- Allow all reads for now, can be restricted later

-- Policy: Users can insert their own vocabulary difficulty history
CREATE POLICY "Users can insert own vocabulary difficulty history"
  ON vocabulary_difficulty_history
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts for now

-- Add comments to table
COMMENT ON TABLE vocabulary_difficulty_history IS 'Stores the history of difficulty level changes for vocabulary words per user';
COMMENT ON COLUMN vocabulary_difficulty_history.old_difficulty IS 'Previous difficulty level (NULL for first setting)';
COMMENT ON COLUMN vocabulary_difficulty_history.new_difficulty IS 'New difficulty level: 0 (Easy), 1 (Medium), 2 (Hard), 3 (Very Hard)';
COMMENT ON COLUMN vocabulary_difficulty_history.changed_at IS 'Timestamp when the difficulty was changed';
