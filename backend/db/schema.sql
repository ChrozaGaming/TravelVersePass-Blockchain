-- ============================================================
-- TravelVerse Pass — Database Schema
-- ============================================================
-- Target: Supabase (PostgreSQL 15+)
--
-- Cara apply:
--   1. Buka Supabase dashboard → SQL Editor
--   2. Paste isi file ini, klik Run
--
-- Atau via CLI:
--   psql <connection_string> -f db/schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- destinations
-- ------------------------------------------------------------
-- Master data destinasi wisata. ID di sini = destinationId on-chain.
create table if not exists destinations (
  id          bigint primary key generated always as identity,
  name        text not null,
  description text,
  location_lat decimal(10, 8),
  location_lng decimal(11, 8),
  image_url   text,
  active      boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists destinations_active_idx on destinations (active);

-- ------------------------------------------------------------
-- visits
-- ------------------------------------------------------------
-- Record setiap check-in user. Sumber of truth on-chain;
-- tabel ini optimasi untuk query history/timeline.
create table if not exists visits (
  id              uuid primary key default gen_random_uuid(),
  user_wallet     text not null,
  destination_id  bigint not null references destinations(id) on delete restrict,
  badge_token_id  bigint,
  visited_at      timestamptz default now(),
  tx_hash_badge   text,
  tx_hash_visit   text,
  tx_hash_reward  text,
  tx_hash_level_up text,
  level_after     text,
  created_at      timestamptz default now()
);

create index if not exists visits_user_idx on visits (user_wallet, visited_at desc);
create index if not exists visits_dest_idx on visits (destination_id, visited_at desc);
create index if not exists visits_badge_idx on visits (badge_token_id);

-- ------------------------------------------------------------
-- Trigger: auto-update updated_at
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists destinations_set_updated_at on destinations;
create trigger destinations_set_updated_at
  before update on destinations
  for each row
  execute function set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------
-- Backend pakai service_role key, jadi bypass RLS.
-- Untuk safety, enable RLS dan block public access.
alter table destinations enable row level security;
alter table visits enable row level security;

-- Public bisa read destinations (kalau diperlukan untuk anon FE call)
drop policy if exists destinations_read on destinations;
create policy destinations_read on destinations
  for select
  using (active = true);

-- Visits hanya bisa diakses lewat backend (service_role)
-- Tidak ada policy untuk anon → otomatis ditolak.
