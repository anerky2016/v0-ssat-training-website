-- Word Study History - Track individual word reviews at word level
-- This allows tracking which specific words a user has studied/reviewed

CREATE TABLE IF NOT EXISTS public.word_study_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  word_level TEXT NOT NULL, -- "1", "2", "3", "SSAT"
  activity_type TEXT NOT NULL, -- "flashcard", "story", "quiz", "sentence_completion", "word_list"
  context_id TEXT, -- Optional: story_id, quiz_id, etc. for reference
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Index for efficient queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_word_study_user_word ON public.word_study_history(user_id, word);
CREATE INDEX IF NOT EXISTS idx_word_study_user_date ON public.word_study_history(user_id, reviewed_at);
CREATE INDEX IF NOT EXISTS idx_word_study_word_level ON public.word_study_history(user_id, word_level);

-- RLS Policies
ALTER TABLE public.word_study_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon access to word_study_history"
  ON public.word_study_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a view for word statistics per user
CREATE OR REPLACE VIEW public.user_word_stats AS
SELECT
  user_id,
  word,
  word_level,
  COUNT(*) as review_count,
  MIN(reviewed_at) as first_reviewed,
  MAX(reviewed_at) as last_reviewed,
  ARRAY_AGG(DISTINCT activity_type) as activity_types
FROM public.word_study_history
GROUP BY user_id, word, word_level;

-- Grant access to the view
GRANT SELECT ON public.user_word_stats TO anon, authenticated;

COMMENT ON TABLE public.word_study_history IS 'Tracks individual word study/review history at the word level for each user';
COMMENT ON VIEW public.user_word_stats IS 'Aggregated statistics showing how many times each word has been reviewed by each user';
