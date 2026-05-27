CREATE TABLE components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'AI Designer Bot',
  source_url TEXT NOT NULL DEFAULT 'https://live-pixvault.vercel.app',
  html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public components are viewable by everyone"
ON components FOR SELECT
TO anon
USING (true);

-- Allow public insert access (for the Edge Function using anon key)
CREATE POLICY "Public components can be inserted by anon"
ON components FOR INSERT
TO anon
WITH CHECK (true);

