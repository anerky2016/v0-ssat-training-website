-- Streaks and Badges System
-- Tracks user study streaks, daily goals, and achievement badges

-- ============================================
-- STUDY STREAKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.study_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL,
  total_study_days INTEGER NOT NULL DEFAULT 0,
  streak_frozen_until DATE NULL, -- For "streak freeze" power-ups
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_id ON public.study_streaks(user_id);

-- RLS Policies
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak data"
  ON public.study_streaks FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own streak data"
  ON public.study_streaks FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own streak data"
  ON public.study_streaks FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================
-- DAILY GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  goal_date DATE NOT NULL,
  words_reviewed_goal INTEGER NOT NULL DEFAULT 10,
  words_reviewed_actual INTEGER NOT NULL DEFAULT 0,
  minutes_studied_goal INTEGER NOT NULL DEFAULT 15,
  minutes_studied_actual INTEGER NOT NULL DEFAULT 0,
  questions_answered_goal INTEGER NOT NULL DEFAULT 5,
  questions_answered_actual INTEGER NOT NULL DEFAULT 0,
  goal_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal_date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON public.daily_goals(user_id, goal_date);

-- RLS Policies
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily goals"
  ON public.daily_goals FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own daily goals"
  ON public.daily_goals FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own daily goals"
  ON public.daily_goals FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL, -- e.g., "streak_7", "streak_30", "words_100", etc.
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  badge_icon TEXT NOT NULL, -- emoji or icon name
  badge_category TEXT NOT NULL, -- "streak", "words", "time", "accuracy"
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_category ON public.user_badges(user_id, badge_category);

-- RLS Policies
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================
-- STREAK ACTIVITY LOG
-- ============================================
-- Detailed log of daily activities contributing to streak
CREATE TABLE IF NOT EXISTS public.streak_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL, -- "vocabulary", "quiz", "reading", "flashcards", etc.
  activity_count INTEGER NOT NULL DEFAULT 1,
  contributed_to_goal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_date, activity_type)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_streak_activities_user_date ON public.streak_activities(user_id, activity_date);

-- RLS Policies
ALTER TABLE public.streak_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak activities"
  ON public.streak_activities FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own streak activities"
  ON public.streak_activities FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own streak activities"
  ON public.streak_activities FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_study_streaks_updated_at ON public.study_streaks;
CREATE TRIGGER update_study_streaks_updated_at
  BEFORE UPDATE ON public.study_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_goals_updated_at ON public.daily_goals;
CREATE TRIGGER update_daily_goals_updated_at
  BEFORE UPDATE ON public.daily_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
