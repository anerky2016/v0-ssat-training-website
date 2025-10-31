# Supabase Database Migrations

This directory contains SQL migration scripts for setting up the Supabase database tables.

## Setup Instructions

### 1. Vocabulary Difficulty Table

The `vocabulary_difficulty` table stores per-user difficulty ratings for vocabulary words.

**To create the table:**

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy the contents of `vocabulary_difficulty.sql`
4. Paste and run the SQL script

**Table Schema:**
```
vocabulary_difficulty (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty SMALLINT (0-3) NOT NULL,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, word)
)
```

**Difficulty Levels:**
- 0 = Easy
- 1 = Medium (default)
- 2 = Hard
- 3 = Very Hard

**Indexes:**
- `idx_vocabulary_difficulty_user_id` - for user queries
- `idx_vocabulary_difficulty_word` - for word lookups
- `idx_vocabulary_difficulty_user_word` - for user+word queries

**Row Level Security:**
- Enabled with policies for SELECT, INSERT, UPDATE, DELETE
- Currently set to allow all operations (can be restricted later)

## Verifying the Setup

After running the migration, you can verify the table was created:

```sql
SELECT * FROM vocabulary_difficulty LIMIT 5;
```

## How It Works

1. **User Changes Difficulty**: When a user adjusts word difficulty in the UI
2. **Local Update**: Difficulty is immediately saved to localStorage (instant UI feedback)
3. **Background Sync**: If user is logged in, difficulty syncs to Supabase
4. **Cross-Device**: Difficulty ratings sync across all user's devices
5. **Offline Support**: Works offline with localStorage, syncs when online

## Troubleshooting

**Issue: Table already exists**
- The migration uses `IF NOT EXISTS`, so it's safe to run multiple times

**Issue: Policies not working**
- Check that RLS is enabled: `ALTER TABLE vocabulary_difficulty ENABLE ROW LEVEL SECURITY;`
- Review policies in Supabase Dashboard > Authentication > Policies

**Issue: Data not syncing**
- Check that Supabase environment variables are set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check browser console for error messages
- Verify user is logged in with Firebase Auth
