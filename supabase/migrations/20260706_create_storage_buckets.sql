insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png','image/jpeg','image/webp']),
  ('banners', 'banners', true, 8388608, array['image/png','image/jpeg','image/webp']),
  ('artworks', 'artworks', true, 20971520, array['image/png','image/jpeg','image/webp']);

-- Convention: every object path is "{user_id}/{filename}" — write policies
-- check the first path segment against auth.uid(). Public buckets skip RLS
-- for reads entirely (that's what "public" means), so only write policies
-- are needed here.
--
-- Caveat: because these buckets are public, the raw file URL is fetchable by
-- anyone who has it, even for artworks whose DB row is 'unlisted'/'private'.
-- Paths are unguessable UUIDs, so this is "unlisted by obscurity" rather than
-- truly access-controlled. True private storage would need signed URLs
-- (createSignedUrl) — a deliberate scope cut, not an oversight.
create policy "avatars: owner can upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: owner can update"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars: owner can delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "banners: owner can upload"
  on storage.objects for insert
  with check (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "banners: owner can update"
  on storage.objects for update
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "banners: owner can delete"
  on storage.objects for delete
  using (bucket_id = 'banners' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "artworks: owner can upload"
  on storage.objects for insert
  with check (bucket_id = 'artworks' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "artworks: owner can update"
  on storage.objects for update
  using (bucket_id = 'artworks' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "artworks: owner can delete"
  on storage.objects for delete
  using (bucket_id = 'artworks' and (storage.foldername(name))[1] = auth.uid()::text);
