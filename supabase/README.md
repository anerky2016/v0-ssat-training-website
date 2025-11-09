# Supabase Setup - Quick Reference

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Click **"New Project"**
3. Set project name: `ssat-prep`
4. Generate and save database password
5. Choose region (closest to your users)
6. Wait ~2 minutes for provisioning

### Step 2: Run SQL Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste contents of `schema.sql` (in this folder)
4. Click **"Run"** or press `Cmd/Ctrl + Enter`
5. Verify: Should see "Success" message and verification output

### Step 3: Get API Keys
1. Go to **Settings** → **API**
2. Copy two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long token starting with `eyJ...`

### Step 4: Configure Environment
Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Test
```bash
npm run dev
```
Sign in at http://localhost:3000, then check **Table Editor** → `user_login_logs`

---

## 📁 Files in This Folder

### `schema.sql`
Complete SQL script to create the `user_login_logs` table with:
- Table structure
- Performance indexes
- Row Level Security policies
- Verification queries
- Test queries

**How to use:**
1. Open Supabase SQL Editor
2. Paste entire file contents
3. Run it

---

## 🔍 Quick Queries

### See All Logins Today
```sql
SELECT * FROM user_login_logs
WHERE login_at::date = CURRENT_DATE
ORDER BY login_at DESC;
```

### Count Logins Per User
```sql
SELECT email, name, COUNT(*) as login_count
FROM user_login_logs
GROUP BY email, name
ORDER BY login_count DESC;
```

### View Recent Logins
```sql
SELECT * FROM user_login_logs
ORDER BY login_at DESC
LIMIT 50;
```

---

## 📊 Viewing Data

### Method 1: Table Editor (Visual)
1. Go to **Table Editor**
2. Click `user_login_logs`
3. Browse, filter, sort data

### Method 2: SQL Editor (Queries)
1. Go to **SQL Editor**
2. Write custom queries
3. Click "Run"

---

## 🛠️ Troubleshooting

### "Table does not exist"
- Run `schema.sql` in SQL Editor
- Check **Table Editor** to verify table exists

### "Permission denied"
- RLS is enabled, check policies
- Verify anon key is correct
- Check `schema.sql` was run completely

### No data appearing
- Verify environment variables in `.env.local`
- Check browser console for errors
- Sign in again to trigger tracking
- Check Supabase logs: **Logs** → **Postgres Logs**

---

## 📖 Full Documentation

See `SUPABASE_LOGIN_TRACKING.md` in the root folder for:
- Complete architecture overview
- API reference
- 10+ SQL query examples
- Privacy & security guidelines
- Advanced troubleshooting

---

## 🔐 Security Notes

✅ **Safe to expose:**
- Project URL
- Anon (public) key

❌ **Never expose:**
- Service role key
- Database password

🔒 **Protection:**
- Row Level Security (RLS) enabled
- Policies control data access
- Only basic login info tracked

---

## 📚 Database Migrations

### Available Migrations

The `migrations/` folder contains SQL migration files for additional features:

#### `005_recreate_vocabulary_memory_tips.sql` ⭐ RECOMMENDED (Clean Install)
Recreates the `vocabulary_memory_tips` table from scratch - designed for Firebase Auth.

**Use this if:**
- You're setting up the table for the first time
- You had issues with migrations 003 or 004
- You want a clean slate (⚠️ will delete all existing custom tips)

**What it does:**
- Drops existing `vocabulary_memory_tips` table (if it exists)
- Creates table fresh with proper structure
- NO Row Level Security (works with Firebase Auth)
- Includes all necessary indexes
- Properly formatted comments (no SQL errors)

**How to apply:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste contents of `migrations/005_recreate_vocabulary_memory_tips.sql`
4. Click **Run**
5. You should see: "Table created successfully! | row_count: 0"

⚠️ **WARNING:** This will delete all existing custom memory tips. If you have data you want to keep, backup first!

**Table Structure:**
```sql
vocabulary_memory_tips (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  tip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, word)
)
```

**Features enabled:**
- Custom memory tip generation with OpenAI
- Refresh button to generate new tips
- Revert button to restore default tips
- Tips saved per-user in Supabase

---

### Alternative Migrations (Legacy)

<details>
<summary>Click to expand legacy migrations (003 and 004)</summary>

#### `003_vocabulary_memory_tips.sql` (Legacy)
Initial table creation with RLS policies.

**Issues:**
- Uses RLS policies for Supabase Auth (incompatible with Firebase Auth)
- Requires migration 004 to fix

**Recommendation:** Use migration 005 instead for clean setup.

#### `004_fix_vocabulary_memory_tips_rls.sql` (Legacy)
Fixes RLS policies from migration 003.

**Issues:**
- Had SQL syntax errors in some versions
- Complicated two-step process

**Recommendation:** Use migration 005 instead for clean setup.

</details>

---

### Other Migrations

- `001_vocabulary_difficulty.sql` - Word difficulty tracking
- `002_difficulty_history.sql` - Difficulty change history

**Migration Path:**
- **New setup:** Just run `005_recreate_vocabulary_memory_tips.sql`
- **Already have data:** Backup first, then run `005_recreate_vocabulary_memory_tips.sql`

---

#### `006_vocabulary_review_schedule.sql` ⭐ NEW - Review Notifications

Creates tables for vocabulary word review scheduling with spaced repetition.

**What it does:**
- Creates `vocabulary_review_schedule` table (tracks when words need review)
- Creates `vocabulary_review_history` table (logs all review sessions)
- Creates `user_notification_preferences` table (notification settings)
- Indexes for efficient review queries
- No RLS (works with Firebase Auth)

**How to apply:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste contents of `migrations/006_vocabulary_review_schedule.sql`
4. Click **Run**
5. You should see: "Tables created successfully!"

**Tables Created:**

```sql
-- Review schedule (when words need review)
vocabulary_review_schedule (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  next_review_at TIMESTAMP NOT NULL,
  UNIQUE(user_id, word)
)

-- Review history (logs of reviews)
vocabulary_review_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  difficulty_at_review INTEGER NOT NULL,
  reviewed_at TIMESTAMP,
  time_spent_seconds INTEGER,
  was_recalled_correctly BOOLEAN
)

-- User notification preferences
user_notification_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  daily_summary_enabled BOOLEAN DEFAULT true,
  daily_summary_time TIME DEFAULT '08:00:00',
  critical_alerts_enabled BOOLEAN DEFAULT true,
  weekly_report_enabled BOOLEAN DEFAULT true,
  notification_method TEXT DEFAULT 'push',
  timezone TEXT DEFAULT 'America/New_York'
)
```

**Features Enabled:**
- Spaced repetition review scheduling
- Word-level review tracking
- Review history analytics
- Notification preferences
- Progress page review tasks
- External cron notifications

**Next Steps:**
1. Apply this migration
2. Set `CRON_SECRET_TOKEN` environment variable
3. Set up external cron job (see [setup guide](../docs/VOCABULARY_REVIEW_NOTIFICATIONS_SETUP.md))
4. Users will automatically get review notifications!
