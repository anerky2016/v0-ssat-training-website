-- Migration: Populate vocabulary_difficulty_history with existing difficulty levels
-- This creates initial history entries for all existing vocabulary difficulties

-- Insert existing difficulties as initial history entries
-- old_difficulty is NULL to indicate these are initial/baseline settings
INSERT INTO vocabulary_difficulty_history (user_id, word, old_difficulty, new_difficulty, changed_at)
SELECT
  user_id,
  word,
  NULL as old_difficulty,  -- NULL indicates this is the initial setting
  difficulty as new_difficulty,
  COALESCE(created_at, NOW()) as changed_at  -- Use created_at if available, otherwise NOW()
FROM vocabulary_difficulties
ON CONFLICT DO NOTHING;  -- Skip if somehow already exists

-- Verify the migration
-- Uncomment the following line to see how many records were migrated:
-- SELECT COUNT(*) as migrated_count FROM vocabulary_difficulty_history WHERE old_difficulty IS NULL;
