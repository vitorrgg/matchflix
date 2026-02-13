-- =============================================
-- Bateu! — Supabase schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Rooms
create table if not exists rooms (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  created_at timestamptz default now()
);

-- 2. Room participants
create table if not exists room_participants (
  id        uuid primary key default gen_random_uuid(),
  room_id   uuid not null references rooms(id) on delete cascade,
  user_id   text not null,
  nickname  text not null,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

-- 3. Swipes
create table if not exists swipes (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references rooms(id) on delete cascade,
  user_id    text not null,
  movie_id   integer not null,
  direction  text not null check (direction in ('left', 'right')),
  created_at timestamptz default now(),
  unique(room_id, user_id, movie_id)
);

-- Indexes for fast lookups
create index if not exists idx_swipes_room_movie
  on swipes(room_id, movie_id);

create index if not exists idx_participants_room
  on room_participants(room_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table rooms enable row level security;
alter table room_participants enable row level security;
alter table swipes enable row level security;

-- Allow anyone to read and insert rooms (anonymous access)
create policy "rooms_select" on rooms for select using (true);
create policy "rooms_insert" on rooms for insert with check (true);

-- Allow anyone to read and insert participants
create policy "participants_select" on room_participants for select using (true);
create policy "participants_insert" on room_participants for insert with check (true);
-- Allow upsert (update own row)
create policy "participants_update" on room_participants for update using (true);

-- Allow anyone to read and insert swipes
create policy "swipes_select" on swipes for select using (true);
create policy "swipes_insert" on swipes for insert with check (true);
-- Allow upsert (update own swipe)
create policy "swipes_update" on swipes for update using (true);

-- =============================================
-- Enable Realtime for swipes and participants
-- =============================================
-- In Supabase Dashboard: go to Database > Replication
-- and enable the tables: swipes, room_participants
--
-- Or via SQL:
alter publication supabase_realtime add table swipes;
alter publication supabase_realtime add table room_participants;
