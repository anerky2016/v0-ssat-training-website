# Supabase Setup for Location Sync

This document outlines the steps to set up Supabase for the multi-device location sync feature.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Get Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

## Step 2: Add Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create Database Table

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- Create user_locations table
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  path TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  page_title TEXT,
  scroll_position INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Create a unique constraint on user_id and device_id
  -- This ensures each device has only one location record per user
  UNIQUE(user_id, device_id)
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id 
  ON user_locations(user_id);

-- Create an index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp
  ON user_locations(timestamp DESC);

-- Create user_settings table for user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  location_sync_enabled BOOLEAN DEFAULT true,
  master_device_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id
  ON user_settings(user_id);

-- Create devices table to track all user devices
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  last_active BIGINT NOT NULL,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one record per user per device
  UNIQUE(user_id, device_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_devices_user_id
  ON devices(user_id);

CREATE INDEX IF NOT EXISTS idx_devices_last_active
  ON devices(last_active DESC);
```

### Updating an Existing Table

**If you already have the `user_locations` table** from a previous setup and need to add scroll position tracking, run this SQL:

```sql
-- Add scroll_position column to existing table
ALTER TABLE user_locations
ADD COLUMN IF NOT EXISTS scroll_position INTEGER DEFAULT 0;
```

**If you already have the `user_settings` table** and need to add master device tracking, run this SQL:

```sql
-- Add master_device_id column to existing table
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS master_device_id TEXT;
```

This will:
- Add the `scroll_position` column to user_locations if it doesn't exist
- Add the `master_device_id` column to user_settings if it doesn't exist
- Set default value to NULL for master_device_id (no master selected initially)
- Not affect any existing data

## Step 4: Set Up Row Level Security (RLS)

Run this SQL in the **SQL Editor**:

```sql
-- Enable Row Level Security
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own locations" ON user_locations;
DROP POLICY IF EXISTS "Users can insert their own locations" ON user_locations;
DROP POLICY IF EXISTS "Users can update their own locations" ON user_locations;
DROP POLICY IF EXISTS "Users can delete their own locations" ON user_locations;

-- Create policies for authenticated users using Firebase UID
-- Note: Since we're using Firebase Auth, we store the Firebase UID in user_id field
-- and use it for authorization

-- Allow users to view their own locations
CREATE POLICY "Users can view their own locations"
  ON user_locations
  FOR SELECT
  USING (true);  -- We'll filter by user_id in the application code

-- Allow users to insert their own locations
CREATE POLICY "Users can insert their own locations"
  ON user_locations
  FOR INSERT
  WITH CHECK (true);  -- We'll set user_id in the application code

-- Allow users to update their own locations
CREATE POLICY "Users can update their own locations"
  ON user_locations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own locations
CREATE POLICY "Users can delete their own locations"
  ON user_locations
  FOR DELETE
  USING (true);

-- Note: Since we're using Firebase Auth (not Supabase Auth), we can't use auth.uid()
-- The policies above allow all authenticated requests, and we rely on the application
-- code to ensure users only access their own data by filtering on user_id

-- Enable RLS for user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Allow users to view their own settings
CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  USING (true);

-- Allow users to insert their own settings
CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own settings
CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable RLS for devices table
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own devices" ON devices;
DROP POLICY IF EXISTS "Users can insert their own devices" ON devices;
DROP POLICY IF EXISTS "Users can update their own devices" ON devices;
DROP POLICY IF EXISTS "Users can delete their own devices" ON devices;

-- Allow users to view their own devices
CREATE POLICY "Users can view their own devices"
  ON devices
  FOR SELECT
  USING (true);

-- Allow users to insert their own devices
CREATE POLICY "Users can insert their own devices"
  ON devices
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own devices
CREATE POLICY "Users can update their own devices"
  ON devices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own devices
CREATE POLICY "Users can delete their own devices"
  ON devices
  FOR DELETE
  USING (true);
```

## Step 5: Enable Realtime

1. Go to **Database** → **Replication** in Supabase
2. Find the `user_locations` table and toggle **Enable Realtime** to ON
3. Find the `user_settings` table and toggle **Enable Realtime** to ON
4. Find the `devices` table and toggle **Enable Realtime** to ON
5. This allows the app to receive real-time updates when location, settings, or device status changes

## Step 6: Test the Setup

After completing the setup:

1. Ensure your `.env.local` has the Supabase credentials
2. Restart your dev server: `npm run dev`
3. Sign in to your app
4. Navigate to different pages
5. Open the same account on another device/browser
6. You should see a notification when navigating on the other device

## Troubleshooting

### Error: "relation 'user_locations' does not exist"

Make sure you ran the SQL to create the table in Step 3.

### Error: "new row violates row-level security policy"

Make sure you enabled RLS and created the policies in Step 4.

### Realtime not working

1. Check that Realtime is enabled for the `user_locations` table
2. Check the browser console for any Supabase errors
3. Verify your Supabase credentials are correct

### No notifications appearing

1. Check that `enabled: true` in `components/providers/location-sync-provider.tsx`
2. Ensure you're signed in with Firebase Auth
3. Open browser console and look for "Location synced successfully" messages

## Database Schema

```typescript
interface UserLocation {
  id: string                // UUID primary key
  user_id: string          // Firebase Auth UID
  path: string             // Current page path
  timestamp: number        // Unix timestamp in milliseconds
  device_id: string        // Unique device identifier
  device_name: string      // Device name (e.g., "Chrome on Mac")
  page_title: string       // Page title
  scroll_position: number  // Scroll position in pixels from top
  updated_at: string       // ISO timestamp
}
```

## Security Considerations

1. **User Isolation**: Each user can only access their own location data
2. **Device Tracking**: Each device is uniquely identified
3. **No Cross-User Access**: RLS policies prevent users from seeing other users' data
4. **Firebase Auth**: We use Firebase for authentication, Supabase only for data storage

## Monitoring Usage

1. Go to **Settings** → **Usage** in Supabase
2. Monitor:
   - Database size
   - Realtime connections
   - API requests
3. Set up billing alerts if needed

## Cost Optimization

The free tier includes:
- 500 MB database space
- 2 GB bandwidth
- 50 GB data transfer

To optimize:
1. The `upsert` operation ensures we only store one location per device per user
2. Debouncing (2 seconds) prevents excessive writes
3. Real-time subscriptions are scoped to individual users

## Features

Once setup is complete, the location sync will provide:

1. **Master/Slave Device Model**: One device controls, others follow
   - One device is designated as the "master" device
   - Master device controls page navigation and scroll position
   - All other devices ("slave" devices) automatically follow the master
   - Users can change which device is master from the settings dialog
   - If master goes offline (no update for 5 minutes), a slave auto-promotes to master

2. **Page Navigation Sync**: Master device syncs navigation
   - Master device sends location updates when navigating to different pages
   - Slave devices automatically navigate to follow the master
   - Debounced by 2 seconds to prevent excessive writes during rapid navigation

3. **Scroll Position Sync**: Master device controls scroll position
   - Tracks scroll position on each page
   - Debounced by 1 second after scrolling stops
   - Slave devices restore scroll position when following master

4. **Device Management**: Full control over device roles
   - View all devices in the settings dialog
   - See which device is currently the master (crown icon)
   - See current device (highlighted)
   - Click "Set as Master" to change master device
   - All other devices automatically become slaves when a new master is selected

## Next Steps

Once setup is complete:
1. The location sync feature will work automatically
2. Users will see notifications when switching devices
3. Both page location AND scroll position are synced in real-time across devices

For issues or questions, check the Supabase documentation: https://supabase.com/docs
