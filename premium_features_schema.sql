-- ─────────────────────────────────────────────────────────────────────────────
-- DevTech: Create lead_requests table and add show_profile_url column
-- Run this in Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Create lead_requests table if it does not exist
create table if not exists public.lead_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text not null,
  company     text,
  message     text,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security (RLS) on lead_requests
alter table public.lead_requests enable row level security;

-- Allow anonymous and authenticated users to insert lead requests (from landing page)
create policy "Anyone can insert lead requests"
  on public.lead_requests
  for insert
  to anon, authenticated
  with check (true);

-- Allow anonymous users to select lead requests (since admin client fetches using anon key)
create policy "Anon can read lead requests"
  on public.lead_requests
  for select
  to anon
  using (true);

-- Allow authenticated users to select lead requests
create policy "Authenticated can read lead requests"
  on public.lead_requests
  for select
  to authenticated
  using (true);

-- Allow anonymous users to delete lead requests (since admin client uses anon key)
create policy "Anon can delete lead requests"
  on public.lead_requests
  for delete
  to anon
  using (true);

-- Allow authenticated users to delete lead requests
create policy "Authenticated can delete lead requests"
  on public.lead_requests
  for delete
  to authenticated
  using (true);

-- Add show_profile_url column to public.vendors table if it does not exist
alter table public.vendors add column if not exists show_profile_url boolean default false;
