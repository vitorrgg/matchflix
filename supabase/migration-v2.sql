-- =============================================
-- Matchflix v2 — Room enhancements
-- Run this in the Supabase SQL Editor AFTER migration.sql
-- =============================================

-- 1. rooms: new columns for group settings
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS expected_count integer NOT NULL DEFAULT 2;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS movie_count integer NOT NULL DEFAULT 20;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'waiting'
  CHECK (status IN ('waiting', 'swiping', 'results'));
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS movie_ids jsonb DEFAULT '[]';

-- 2. room_participants: filter tracking
ALTER TABLE room_participants ADD COLUMN IF NOT EXISTS filters_ready boolean DEFAULT false;
ALTER TABLE room_participants ADD COLUMN IF NOT EXISTS filter_data jsonb DEFAULT '{}';

-- 3. Allow updates on rooms (for status transitions)
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (true);
