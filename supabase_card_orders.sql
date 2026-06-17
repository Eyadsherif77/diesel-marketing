-- ─────────────────────────────────────────────────────────────────────────────
-- DevTech: Create card_orders table
-- Run this once in Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.card_orders (
  id            uuid primary key default gen_random_uuid(),
  username      text,
  email         text,
  phone_number  text,
  referral_vendor text not null default '',
  status        text not null default 'pending'
                  check (status in ('pending','contacted','completed')),
  created_at    timestamptz not null default now()
);

-- Allow anonymous users (customers) to INSERT only
alter table public.card_orders enable row level security;

create policy "Anyone can place an order"
  on public.card_orders
  for insert
  to anon, authenticated
  with check (true);

-- Only authenticated sessions (admin) can SELECT / UPDATE / DELETE
create policy "Authenticated can read orders"
  on public.card_orders
  for select
  to authenticated
  using (true);

create policy "Authenticated can update orders"
  on public.card_orders
  for update
  to authenticated
  using (true);

create policy "Authenticated can delete orders"
  on public.card_orders
  for delete
  to authenticated
  using (true);

-- Allow anon to read too (admin uses anon key in this project)
create policy "Anon can read orders"
  on public.card_orders
  for select
  to anon
  using (true);

create policy "Anon can update orders"
  on public.card_orders
  for update
  to anon
  using (true);

create policy "Anon can delete orders"
  on public.card_orders
  for delete
  to anon
  using (true);
