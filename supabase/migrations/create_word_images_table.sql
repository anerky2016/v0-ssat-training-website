-- Create word_images table for storing AI-generated picture descriptions and images
CREATE TABLE IF NOT EXISTS word_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT UNIQUE NOT NULL,
  definitions TEXT[] NOT NULL,
  part_of_speech TEXT,

  -- AI Generated Description (Step 1: OpenAI)
  picture_description TEXT,
  description_generated_at TIMESTAMP,

  -- Generated Image (Step 2: Runware)
  image_url TEXT,
  image_generated_at TIMESTAMP,
  image_provider TEXT DEFAULT 'runware',

  -- Metadata
  user_id TEXT, -- Track who requested it
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_word_images_word ON word_images(word);
CREATE INDEX IF NOT EXISTS idx_word_images_user_id ON word_images(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE word_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read word images (public data)
CREATE POLICY "Allow public read access" ON word_images
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert/update word images
CREATE POLICY "Allow authenticated users to insert" ON word_images
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON word_images
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
