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

#### `003_vocabulary_memory_tips.sql` ⭐ NEW
Creates the `vocabulary_memory_tips` table for storing custom AI-generated memory tips.

**What it does:**
- Stores user-customized memory tips for vocabulary words
- One custom tip per user per word
- Row Level Security (RLS) - users can only access their own tips
- Indexed for fast lookups

**How to apply:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy and paste contents of `migrations/003_vocabulary_memory_tips.sql`
4. Click **Run**

**Table Structure:**
```sql
vocabulary_memory_tips (
  user_id TEXT,
  word TEXT,
  tip TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Features enabled:**
- Custom memory tip generation with OpenAI
- Refresh button to generate new tips
- Revert button to restore default tips
- Tips saved per-user in Supabase

### Other Migrations

- `001_vocabulary_difficulty.sql` - Word difficulty tracking
- `002_difficulty_history.sql` - Difficulty change history

Apply these in order if you haven't already.
