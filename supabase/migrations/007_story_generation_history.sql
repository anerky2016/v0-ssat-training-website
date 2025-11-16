-- Migration: Add story generation history table
-- Description: Table for tracking generated stories
-- Date: 2025-01-15

-- Table to store generated story history
CREATE TABLE IF NOT EXISTS story_generation_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  story_text TEXT NOT NULL,
  words_used JSONB NOT NULL, -- Array of {word, level, meaning}
  story_length TEXT NOT NULL, -- 'short', 'medium', 'long'
  story_type TEXT, -- Optional story type ID (e.g., 'adventure', 'mystery')
  story_subtype TEXT, -- Optional story subtype ID (e.g., 'quest', 'treasure-hunt')
  levels_selected TEXT[] NOT NULL, -- Array of selected difficulty levels
  letters_filter TEXT[], -- Optional letters filter
  difficulties_filter INTEGER[], -- Optional difficulty filter (0=Easy, 1=Medium, 2=Hard, 3=Very Hard)
  words_per_level INTEGER NOT NULL,
  word_count INTEGER, -- Actual word count of generated story
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_story_history_user_id
  ON story_generation_history(user_id);

CREATE INDEX idx_story_history_user_generated_at
  ON story_generation_history(user_id, generated_at DESC);

CREATE INDEX idx_story_history_story_type
  ON story_generation_history(story_type);

CREATE INDEX idx_story_history_generated_at
  ON story_generation_history(generated_at DESC);

-- Add comment
COMMENT ON TABLE story_generation_history IS $$Stores history of all generated vocabulary stories for each user. No RLS - uses Firebase Auth.$$;

-- Verification query
SELECT
  'Story history table created successfully!' as status,
  (SELECT COUNT(*) FROM story_generation_history) as story_count;
