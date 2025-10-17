# Supabase Setup for User Login Tracking

This guide explains how to set up Supabase to track user login information.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Choose your organization and set:
   - Project name: `ssat-prep` (or your preferred name)
   - Database password: Generate a strong password (save it securely)
   - Region: Choose closest to your users
4. Wait for the project to be created (1-2 minutes)

## 2. Create the Database Table

1. In your Supabase project dashboard, go to **Table Editor**
2. Click **"New Table"**
3. Create a table named `user_login_logs` with the following columns:

| Column Name  | Type        | Default Value       | Primary | Nullable | Unique |
|-------------|-------------|---------------------|---------|----------|--------|
| id          | uuid        | gen_random_uuid()   | Yes     | No       | Yes    |
| user_id     | text        |                     | No      | No       | No     |
| email       | text        |                     | No      | No       | No     |
| name        | text        |                     | No      | No       | No     |
| image       | text        |                     | No      | Yes      | No     |
| login_at    | timestamptz | now()               | No      | No       | No     |
| user_agent  | text        |                     | No      | Yes      | No     |
| ip_address  | text        |                     | No      | Yes      | No     |

### SQL Alternative

Or use this SQL script in the **SQL Editor**:

```sql
-- Create user_login_logs table
CREATE TABLE user_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);

-- Create index for faster queries
CREATE INDEX idx_user_login_logs_user_id ON user_login_logs(user_id);
CREATE INDEX idx_user_login_logs_login_at ON user_login_logs(login_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_login_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from authenticated users or service role
CREATE POLICY "Allow inserts for all users" ON user_login_logs
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow reads for authenticated users (they can see all logs)
CREATE POLICY "Allow reads for authenticated users" ON user_login_logs
  FOR SELECT
  USING (true);
```

## 3. Get Your API Keys

1. Go to **Settings** → **API** in your Supabase project
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) key**: Long JWT token starting with `eyJ...`

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local` (if you haven't already):
   ```bash
   cp .env.example .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 5. Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Sign in with Google (or your configured auth provider)

3. Check your Supabase dashboard:
   - Go to **Table Editor** → `user_login_logs`
   - You should see a new row with your login information

## 6. View Login Data

### In Supabase Dashboard

Go to **Table Editor** → `user_login_logs` to see all login records in a table view.

### Using SQL Queries

Go to **SQL Editor** and run queries like:

```sql
-- Get all logins in the last 7 days
SELECT * FROM user_login_logs
WHERE login_at > NOW() - INTERVAL '7 days'
ORDER BY login_at DESC;

-- Count logins per user
SELECT user_id, email, name, COUNT(*) as login_count
FROM user_login_logs
GROUP BY user_id, email, name
ORDER BY login_count DESC;

-- Get unique users who logged in today
SELECT DISTINCT email, name, MAX(login_at) as last_login
FROM user_login_logs
WHERE login_at::date = CURRENT_DATE
GROUP BY email, name;
```

## 7. Optional: Create a Dashboard

You can create a custom dashboard page in your app to view login statistics:

```typescript
import { getRecentLogins, getUserLoginHistory } from '@/lib/supabase'

// In your component
const logins = await getRecentLogins(50)
const userHistory = await getUserLoginHistory('user@example.com', 10)
```

## Data Tracked

The system automatically tracks:
- ✅ User ID (email)
- ✅ Email address
- ✅ Display name
- ✅ Profile image URL
- ✅ Login timestamp
- ✅ User agent (browser info)
- ⚠️ IP address (requires additional setup)

## Privacy Considerations

- Login data is stored in your Supabase database (you control the data)
- Only basic login information is tracked
- No sensitive data like passwords are stored
- Users should be informed in your privacy policy

## Troubleshooting

### "Error logging user login"

- Check that your Supabase URL and Anon Key are correct in `.env.local`
- Verify the `user_login_logs` table exists
- Check RLS policies allow inserts

### No data appearing

- Open browser console and check for errors
- Verify you're logged in with NextAuth
- Check Supabase logs in the dashboard

## Additional Features

You can extend this system to:
- Track user activity (page views, lesson completions)
- Send welcome emails on first login
- Show "last login" information to users
- Generate analytics reports
- Implement security alerts for unusual login patterns
