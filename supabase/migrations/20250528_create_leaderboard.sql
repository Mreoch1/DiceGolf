CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY,
  player_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location JSONB,
  hole_count INTEGER NOT NULL
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON leaderboard;
DROP POLICY IF EXISTS "Allow public insert access" ON leaderboard;

-- Allow anyone to read all rows
CREATE POLICY "Allow public read access" ON leaderboard
  FOR SELECT USING (true);

-- Allow anyone to insert new rows
CREATE POLICY "Allow public insert access" ON leaderboard
  FOR INSERT WITH CHECK (true); 