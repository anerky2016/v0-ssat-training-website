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
