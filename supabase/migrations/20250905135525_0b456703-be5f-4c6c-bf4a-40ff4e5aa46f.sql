-- Enable required extension for UUIDs
create extension if not exists "pgcrypto";

-- Create photos table
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  photo_url text not null,
  taken_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.photos enable row level security;

-- Recreate policies safely
drop policy if exists "Allow public read of photos" on public.photos;
drop policy if exists "Allow public insert of photos" on public.photos;

create policy "Allow public read of photos"
  on public.photos
  for select
  using (true);

create policy "Allow public insert of photos"
  on public.photos
  for insert
  with check (true);

-- Indexes for sorting
create index if not exists photos_taken_at_idx on public.photos (taken_at desc);
create index if not exists photos_created_at_idx on public.photos (created_at desc);