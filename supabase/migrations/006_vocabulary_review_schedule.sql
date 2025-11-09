-- Migration: Add vocabulary review scheduling tables
-- Description: Tables for spaced repetition review system
-- Date: 2025-01-09

-- Table to track when each word needs to be reviewed
CREATE TABLE IF NOT EXISTS vocabulary_review_schedule (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty INTEGER NOT NULL, -- 0=Wait, 1=Easy, 2=Medium, 3=Hard
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT vocabulary_review_schedule_unique UNIQUE (user_id, word)
);

-- Indexes for efficient queries
CREATE INDEX idx_review_schedule_user_next_review
  ON vocabulary_review_schedule(user_id, next_review_at);

CREATE INDEX idx_review_schedule_next_review
  ON vocabulary_review_schedule(next_review_at);

CREATE INDEX idx_review_schedule_user_id
  ON vocabulary_review_schedule(user_id);

-- Table to log review history
CREATE TABLE IF NOT EXISTS vocabulary_review_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty_at_review INTEGER NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent_seconds INTEGER,
  was_recalled_correctly BOOLEAN
);

CREATE INDEX idx_review_history_user_word
  ON vocabulary_review_history(user_id, word);

CREATE INDEX idx_review_history_user_date
  ON vocabulary_review_history(user_id, reviewed_at DESC);

-- Table for user notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  daily_summary_enabled BOOLEAN DEFAULT true,
  daily_summary_time TIME DEFAULT '08:00:00',
  critical_alerts_enabled BOOLEAN DEFAULT true,
  weekly_report_enabled BOOLEAN DEFAULT true,
  notification_method TEXT DEFAULT 'push', -- 'push', 'email', 'both', 'none'
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_prefs_user_id
  ON user_notification_preferences(user_id);

-- Add comments
COMMENT ON TABLE vocabulary_review_schedule IS $$Tracks when vocabulary words need to be reviewed using spaced repetition algorithm. No RLS - uses Firebase Auth.$$;

COMMENT ON TABLE vocabulary_review_history IS $$Logs all vocabulary review sessions for analytics and performance tracking.$$;

COMMENT ON TABLE user_notification_preferences IS $$Stores user preferences for review notifications including timing and delivery method.$$;

-- Verification query
SELECT
  'Tables created successfully!' as status,
  (SELECT COUNT(*) FROM vocabulary_review_schedule) as schedule_count,
  (SELECT COUNT(*) FROM vocabulary_review_history) as history_count,
  (SELECT COUNT(*) FROM user_notification_preferences) as prefs_count;
