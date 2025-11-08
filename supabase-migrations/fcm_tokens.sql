-- FCM Tokens Table
-- Stores Firebase Cloud Messaging tokens for push notifications

-- Create the fcm_tokens table
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android')),
  device_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(user_id, fcm_token)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_fcm_token ON public.fcm_tokens(fcm_token);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_is_active ON public.fcm_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_device_type ON public.fcm_tokens(device_type);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_fcm_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS fcm_tokens_updated_at ON public.fcm_tokens;
CREATE TRIGGER fcm_tokens_updated_at
  BEFORE UPDATE ON public.fcm_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_fcm_tokens_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own tokens
CREATE POLICY "Users can view their own FCM tokens"
  ON public.fcm_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert their own FCM tokens"
  ON public.fcm_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update their own FCM tokens"
  ON public.fcm_tokens
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete their own FCM tokens"
  ON public.fcm_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.fcm_tokens TO authenticated;
GRANT SELECT ON public.fcm_tokens TO anon;

-- Comment on table and columns
COMMENT ON TABLE public.fcm_tokens IS 'Stores Firebase Cloud Messaging tokens for push notifications';
COMMENT ON COLUMN public.fcm_tokens.id IS 'Unique identifier for the token record';
COMMENT ON COLUMN public.fcm_tokens.user_id IS 'Reference to the user who owns this device token';
COMMENT ON COLUMN public.fcm_tokens.fcm_token IS 'The Firebase Cloud Messaging token for this device';
COMMENT ON COLUMN public.fcm_tokens.device_type IS 'Type of device: ios or android';
COMMENT ON COLUMN public.fcm_tokens.device_name IS 'Optional friendly name for the device';
COMMENT ON COLUMN public.fcm_tokens.created_at IS 'Timestamp when the token was first registered';
COMMENT ON COLUMN public.fcm_tokens.updated_at IS 'Timestamp when the token was last updated';
COMMENT ON COLUMN public.fcm_tokens.last_used_at IS 'Timestamp when the token was last used to send a notification';
COMMENT ON COLUMN public.fcm_tokens.is_active IS 'Whether this token is currently active';
