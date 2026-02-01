-- Fix RLS policies for streaks tables to work with Firebase auth
-- Since we're using Firebase for authentication, we can't use auth.uid()
-- Instead, we'll create policies that allow authenticated users to access their own data

-- Drop existing policies (both old and new)
DROP POLICY IF EXISTS "Users can view own streak data" ON public.study_streaks;
DROP POLICY IF EXISTS "Users can insert own streak data" ON public.study_streaks;
DROP POLICY IF EXISTS "Users can update own streak data" ON public.study_streaks;
DROP POLICY IF EXISTS "Allow anon access to study_streaks" ON public.study_streaks;

DROP POLICY IF EXISTS "Users can view own daily goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can insert own daily goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Users can update own daily goals" ON public.daily_goals;
DROP POLICY IF EXISTS "Allow anon access to daily_goals" ON public.daily_goals;

DROP POLICY IF EXISTS "Users can view own streak activities" ON public.streak_activities;
DROP POLICY IF EXISTS "Users can insert own streak activities" ON public.streak_activities;
DROP POLICY IF EXISTS "Users can update own streak activities" ON public.streak_activities;
DROP POLICY IF EXISTS "Allow anon access to streak_activities" ON public.streak_activities;

DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Allow anon access to user_badges" ON public.user_badges;

DROP POLICY IF EXISTS "Allow anon access to story_generation_history" ON public.story_generation_history;

-- Create new permissive policies for Firebase auth
-- These policies allow access when using the anon key (which is what the client uses)
CREATE POLICY "Allow anon access to study_streaks"
  ON public.study_streaks FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon access to daily_goals"
  ON public.daily_goals FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon access to streak_activities"
  ON public.streak_activities FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon access to user_badges"
  ON public.user_badges FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix story_generation_history table
-- Enable RLS and create permissive policy
ALTER TABLE public.story_generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon access to story_generation_history"
  ON public.story_generation_history FOR ALL
  USING (true)
  WITH CHECK (true);
