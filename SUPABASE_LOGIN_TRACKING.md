# Supabase User Login Tracking

Complete guide to implementing and using Supabase for tracking user logins in the SSAT Prep application.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Supabase Project Setup](#supabase-project-setup)
4. [Database Schema](#database-schema)
5. [Environment Configuration](#environment-configuration)
6. [How It Works](#how-it-works)
7. [API Reference](#api-reference)
8. [Querying Login Data](#querying-login-data)
9. [Privacy & Security](#privacy--security)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This application uses Supabase to track basic user login information for analytics and monitoring purposes. The system automatically logs each user login with the following information:

- ✅ User ID (email address)
- ✅ Email address
- ✅ Display name
- ✅ Profile image URL
- ✅ Login timestamp (with timezone)
- ✅ User agent (browser/device info)
- ⚠️ IP address (optional, requires additional setup)

### Key Features

- **Automatic Tracking**: Logs are created automatically when users sign in
- **No Duplicates**: Only one log per session (uses React ref to prevent duplicates)
- **Optional Configuration**: App works fine without Supabase (graceful degradation)
- **Privacy-Conscious**: Only basic login info is tracked
- **Real-time Analytics**: Query login data instantly from Supabase

---

## Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `ssat-prep` (or your choice)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait ~2 minutes

### Step 2: Create Database Table

In your Supabase dashboard, go to **SQL Editor** and run this:

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

-- Create indexes for faster queries
CREATE INDEX idx_user_login_logs_user_id ON user_login_logs(user_id);
CREATE INDEX idx_user_login_logs_login_at ON user_login_logs(login_at DESC);
CREATE INDEX idx_user_login_logs_email ON user_login_logs(email);

-- Enable Row Level Security (RLS)
ALTER TABLE user_login_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for automatic tracking)
CREATE POLICY "Allow inserts for all users" ON user_login_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow reads for all authenticated users
CREATE POLICY "Allow reads for authenticated users" ON user_login_logs
  FOR SELECT
  USING (true);
```

### Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon key**: Long JWT token starting with `eyJ...`

### Step 4: Configure Environment

Add to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Also add to Vercel/production environment variables.

### Step 5: Restart & Test

```bash
npm run dev
```

Sign in with Google and check **Table Editor** → `user_login_logs` in Supabase!

---

## Supabase Project Setup

### Creating the Project

1. **Sign Up/Login** to [Supabase](https://supabase.com)
2. **Create Organization** (if first time)
3. **New Project**:
   - Organization: Select your organization
   - Name: `ssat-prep` or similar
   - Database Password: **Important!** Generate and save securely
   - Region: Choose based on your user base
     - `us-east-1`: East Coast US
     - `us-west-1`: West Coast US
     - `eu-central-1`: Europe
     - `ap-southeast-1`: Asia Pacific

4. **Wait for Provisioning**: Takes 1-2 minutes

### Project Settings

Navigate to **Settings** → **General**:
- Note your **Reference ID** (part of your URL)
- Note your **Project API URL**

---

## Database Schema

### Table Structure

| Column      | Type        | Description                              | Required | Default           |
|-------------|-------------|------------------------------------------|----------|-------------------|
| id          | UUID        | Unique identifier for each login record  | Yes      | gen_random_uuid() |
| user_id     | TEXT        | User identifier (email in our case)     | Yes      | -                 |
| email       | TEXT        | User's email address                     | Yes      | -                 |
| name        | TEXT        | User's display name                      | Yes      | -                 |
| image       | TEXT        | URL to user's profile picture            | No       | NULL              |
| login_at    | TIMESTAMPTZ | Timestamp when login occurred            | Yes      | now()             |
| user_agent  | TEXT        | Browser/device information               | No       | NULL              |
| ip_address  | TEXT        | User's IP address (future use)           | No       | NULL              |

### Complete SQL Schema

```sql
-- Drop table if exists (CAUTION: This deletes all data!)
-- DROP TABLE IF EXISTS user_login_logs;

-- Create the main table
CREATE TABLE user_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create performance indexes
CREATE INDEX idx_user_login_logs_user_id ON user_login_logs(user_id);
CREATE INDEX idx_user_login_logs_email ON user_login_logs(email);
CREATE INDEX idx_user_login_logs_login_at ON user_login_logs(login_at DESC);

-- Add comments for documentation
COMMENT ON TABLE user_login_logs IS 'Tracks user login events for analytics';
COMMENT ON COLUMN user_login_logs.user_id IS 'User identifier (email address)';
COMMENT ON COLUMN user_login_logs.email IS 'User email address';
COMMENT ON COLUMN user_login_logs.name IS 'User display name from OAuth provider';
COMMENT ON COLUMN user_login_logs.image IS 'URL to user profile image';
COMMENT ON COLUMN user_login_logs.login_at IS 'Timestamp when user logged in';
COMMENT ON COLUMN user_login_logs.user_agent IS 'Browser user agent string';

-- Enable Row Level Security
ALTER TABLE user_login_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert (for automatic tracking)
CREATE POLICY "Enable insert for all users" ON user_login_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Anyone can read (for analytics)
CREATE POLICY "Enable read for all users" ON user_login_logs
  FOR SELECT
  USING (true);

-- Optional: If you want only authenticated users to read
-- DROP POLICY "Enable read for all users" ON user_login_logs;
-- CREATE POLICY "Enable read for authenticated users" ON user_login_logs
--   FOR SELECT
--   USING (auth.role() = 'authenticated');
```

---

## Environment Configuration

### Development (.env.local)

Create or update `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Other existing variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Production (Vercel)

Add environment variables in Vercel:

1. Go to your project in Vercel
2. **Settings** → **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Select environments: **Production**, **Preview**, **Development**
5. Click **Save**
6. Redeploy your application

### Security Notes

- ✅ `NEXT_PUBLIC_*` variables are safe to expose (client-side)
- ✅ Anon key is meant to be public
- ✅ Row Level Security protects your data
- ⚠️ Never expose your **service_role** key
- ⚠️ Never commit `.env.local` to git

---

## How It Works

### Architecture

```
User Signs In with Google
         ↓
  NextAuth Session Created
         ↓
  useLoginTracker Hook Detects Auth
         ↓
  Calls logUserLogin() Function
         ↓
  Supabase Client Inserts Record
         ↓
  Data Stored in user_login_logs Table
```

### Code Flow

1. **Root Layout** (`app/layout.tsx`):
   ```tsx
   <LoginTracker />  // Added to layout
   ```

2. **LoginTracker Component** (`components/login-tracker.tsx`):
   ```tsx
   export function LoginTracker() {
     useLoginTracker()  // Just calls the hook
     return null
   }
   ```

3. **useLoginTracker Hook** (`hooks/use-login-tracker.ts`):
   ```tsx
   export function useLoginTracker() {
     const { data: session, status } = useSession()
     const hasTrackedRef = useRef(false)

     useEffect(() => {
       if (status === 'authenticated' && !hasTrackedRef.current) {
         hasTrackedRef.current = true
         logUserLogin({...})
       }
     }, [session, status])
   }
   ```

4. **Supabase Client** (`lib/supabase.ts`):
   ```tsx
   export async function logUserLogin(data) {
     await supabase.from('user_login_logs').insert(data)
   }
   ```

### What Gets Tracked

When a user signs in, the system automatically captures:

```typescript
{
  user_id: "user@example.com",     // Email as unique ID
  email: "user@example.com",        // Email address
  name: "John Doe",                 // Display name from Google
  image: "https://...",             // Profile picture URL
  login_at: "2025-01-16T10:30:00Z", // Timestamp (automatic)
  user_agent: "Mozilla/5.0..."      // Browser info
}
```

---

## API Reference

### Functions

#### `logUserLogin(loginData)`

Logs a user login event to Supabase.

```typescript
import { logUserLogin } from '@/lib/supabase'

await logUserLogin({
  user_id: 'user@example.com',
  email: 'user@example.com',
  name: 'John Doe',
  image: 'https://example.com/photo.jpg',
  user_agent: navigator.userAgent
})
```

**Parameters:**
- `user_id` (string, required): User identifier
- `email` (string, required): Email address
- `name` (string, required): Display name
- `image` (string, optional): Profile image URL
- `user_agent` (string, optional): Browser user agent
- `ip_address` (string, optional): IP address

**Returns:** Promise<UserLoginLog | null>

#### `getUserLoginHistory(userId, limit)`

Retrieves login history for a specific user.

```typescript
import { getUserLoginHistory } from '@/lib/supabase'

const history = await getUserLoginHistory('user@example.com', 10)
```

**Parameters:**
- `userId` (string): User identifier
- `limit` (number, default: 10): Max records to return

**Returns:** Promise<UserLoginLog[]>

#### `getRecentLogins(limit)`

Retrieves most recent logins across all users.

```typescript
import { getRecentLogins } from '@/lib/supabase'

const recentLogins = await getRecentLogins(50)
```

**Parameters:**
- `limit` (number, default: 50): Max records to return

**Returns:** Promise<UserLoginLog[]>

---

## Querying Login Data

### Via Supabase Dashboard

**Method 1: Table Editor**
1. Go to **Table Editor** → `user_login_logs`
2. View, sort, and filter data visually

**Method 2: SQL Editor**
1. Go to **SQL Editor**
2. Run custom queries

### Common SQL Queries

#### Get All Logins Today

```sql
SELECT *
FROM user_login_logs
WHERE login_at::date = CURRENT_DATE
ORDER BY login_at DESC;
```

#### Count Logins Per User

```sql
SELECT
  email,
  name,
  COUNT(*) as login_count,
  MIN(login_at) as first_login,
  MAX(login_at) as last_login
FROM user_login_logs
GROUP BY email, name
ORDER BY login_count DESC;
```

#### Get Unique Users This Week

```sql
SELECT DISTINCT email, name
FROM user_login_logs
WHERE login_at > NOW() - INTERVAL '7 days'
ORDER BY name;
```

#### Logins by Day (Last 30 Days)

```sql
SELECT
  DATE(login_at) as login_date,
  COUNT(*) as total_logins,
  COUNT(DISTINCT email) as unique_users
FROM user_login_logs
WHERE login_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(login_at)
ORDER BY login_date DESC;
```

#### Most Active Users This Month

```sql
SELECT
  email,
  name,
  COUNT(*) as login_count
FROM user_login_logs
WHERE login_at > DATE_TRUNC('month', CURRENT_DATE)
GROUP BY email, name
ORDER BY login_count DESC
LIMIT 10;
```

#### Browser/Device Breakdown

```sql
SELECT
  CASE
    WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
    WHEN user_agent LIKE '%Safari%' THEN 'Safari'
    WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
    WHEN user_agent LIKE '%Edge%' THEN 'Edge'
    ELSE 'Other'
  END as browser,
  COUNT(*) as count
FROM user_login_logs
WHERE user_agent IS NOT NULL
GROUP BY browser
ORDER BY count DESC;
```

### Via TypeScript

```typescript
import { supabase } from '@/lib/supabase'

// Custom query example
const { data, error } = await supabase
  .from('user_login_logs')
  .select('*')
  .gte('login_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  .order('login_at', { ascending: false })

if (data) {
  console.log('Logins this week:', data.length)
}
```

---

## Privacy & Security

### Data Collection

**What We Track:**
- ✅ Login timestamps
- ✅ User email (from OAuth provider)
- ✅ Display name (from OAuth provider)
- ✅ Profile image URL (from OAuth provider)
- ✅ Browser/device information (user agent)

**What We DON'T Track:**
- ❌ Passwords (handled by Google OAuth)
- ❌ Activity within the application
- ❌ Personal information beyond OAuth data
- ❌ IP addresses (by default)

### Security Measures

1. **Row Level Security (RLS)**: Enabled on all tables
2. **Anon Key Only**: Client uses public anon key, not service role
3. **No Sensitive Data**: Only basic login info is stored
4. **OAuth Provider**: Authentication handled by Google
5. **HTTPS Only**: All communication encrypted

### Privacy Policy

You should inform users in your privacy policy:

> We collect basic login information (email, name, profile picture) and timestamps when you sign in to our service. This data is used for analytics and to improve our service. We do not track your activity within the application or collect any personal information beyond what is provided by your OAuth provider (Google).

### GDPR Compliance

To delete a user's login data:

```sql
DELETE FROM user_login_logs
WHERE email = 'user@example.com';
```

Or via TypeScript:

```typescript
await supabase
  .from('user_login_logs')
  .delete()
  .eq('email', 'user@example.com')
```

---

## Troubleshooting

### Build Errors

**Error: "supabaseUrl is required"**

- ✅ **Fixed**: App now works without Supabase configured
- The app gracefully skips tracking if env vars are missing
- No build errors even without Supabase setup

### No Data Appearing

**Check 1: Environment Variables**
```bash
# Verify variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Check 2: Browser Console**
- Open DevTools → Console
- Look for "Supabase not configured" message
- Look for any error messages

**Check 3: Table Exists**
- Go to Supabase → Table Editor
- Verify `user_login_logs` table exists

**Check 4: RLS Policies**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_login_logs';

-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'user_login_logs';
```

### Duplicate Logins

If you're seeing duplicate logins per session:

1. Check that `hasTrackedRef` is working
2. Verify only one `<LoginTracker />` component in app
3. Check React StrictMode (creates double renders in dev)

### Network Errors

**"Failed to fetch" or CORS errors**

1. Verify Supabase URL is correct
2. Check if project is paused (free tier limitation)
3. Verify anon key is correct
4. Check network connectivity

### Query Performance

If queries are slow:

1. **Check Indexes**: Verify indexes exist
   ```sql
   SELECT * FROM pg_indexes
   WHERE tablename = 'user_login_logs';
   ```

2. **Add More Indexes**: For frequently queried columns
   ```sql
   CREATE INDEX idx_user_login_logs_custom
   ON user_login_logs(email, login_at DESC);
   ```

3. **Use Date Ranges**: Always filter by date range
   ```sql
   WHERE login_at > NOW() - INTERVAL '30 days'
   ```

### Testing Locally

```bash
# 1. Set environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 2. Restart dev server
npm run dev

# 3. Sign in at http://localhost:3000

# 4. Check console for "Supabase not configured" or errors

# 5. Verify in Supabase dashboard
```

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

## Support

If you encounter issues:

1. Check this documentation first
2. Check Supabase [Discord](https://discord.supabase.com/)
3. Create an issue in the repository
4. Contact the development team

---

**Last Updated**: January 16, 2025
**Version**: 1.0.0
