-- ─────────────────────────────────────────────────────────────────────────────
-- DevTech: Create portfolios storage bucket and set RLS policies
-- Run this once in Supabase → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Insert the 'portfolios' bucket into the storage.buckets table
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolios', 'portfolios', true, 5242880, '{application/pdf}')
on conflict (id) do nothing;

-- 2. Allow anyone (including anon users) to select files from the 'portfolios' bucket
create policy "Public access to portfolios"
  on storage.objects
  for select
  to public
  using (bucket_id = 'portfolios');

-- 3. Allow anyone (including anon users) to upload files to the 'portfolios' bucket
create policy "Anyone can upload to portfolios"
  on storage.objects
  for insert
  to public
  with check (bucket_id = 'portfolios');

-- 4. Allow anyone (including anon users) to update files in the 'portfolios' bucket
create policy "Anyone can update portfolios"
  on storage.objects
  for update
  to public
  using (bucket_id = 'portfolios')
  with check (bucket_id = 'portfolios');

-- 5. Allow anyone (including anon users) to delete files in the 'portfolios' bucket
create policy "Anyone can delete portfolios"
  on storage.objects
  for delete
  to public
  using (bucket_id = 'portfolios');
