-- Shared files: make uploads visible to other people.
--
-- Before this, the `shared-files` bucket was created by hand (not in any migration) and the UI could
-- only list the signed-in user's own folder, so nobody else could ever discover a file. This adds:
--   1. the bucket, declared in code, with a 50 MB cap;
--   2. a `shared_files` registry table so files can be browsed by everyone (visibility = 'public')
--      or kept link-only (visibility = 'unlisted').

insert into storage.buckets (id, name, public, file_size_limit)
values ('shared-files', 'shared-files', true, 52428800)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

create table if not exists public.shared_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  path text not null unique,
  name text not null,
  size bigint not null default 0,
  mime_type text not null default 'application/octet-stream',
  visibility text not null default 'unlisted' check (visibility in ('public', 'unlisted')),
  created_at timestamptz not null default now()
);

create index if not exists shared_files_visibility_created_idx on public.shared_files (visibility, created_at desc);
create index if not exists shared_files_owner_created_idx on public.shared_files (owner_id, created_at desc);

alter table public.shared_files enable row level security;

drop policy if exists "shared files readable if public or own" on public.shared_files;
create policy "shared files readable if public or own"
  on public.shared_files for select
  using (visibility = 'public' or owner_id = (select auth.uid()));

drop policy if exists "users register own shared files" on public.shared_files;
create policy "users register own shared files"
  on public.shared_files for insert
  with check (
    owner_id = (select auth.uid())
    and (storage.foldername(path))[1] = (select auth.uid())::text
  );

drop policy if exists "users update own shared files" on public.shared_files;
create policy "users update own shared files"
  on public.shared_files for update
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "users delete own shared files" on public.shared_files;
create policy "users delete own shared files"
  on public.shared_files for delete
  using (owner_id = (select auth.uid()));

-- Backfill: existing files were only reachable by link, so register them as unlisted. Owners opt in to public.
insert into public.shared_files (owner_id, path, name, size, mime_type, visibility, created_at)
select
  (storage.foldername(o.name))[1]::uuid,
  o.name,
  regexp_replace(storage.filename(o.name), '^\d+-', ''),
  coalesce((o.metadata ->> 'size')::bigint, 0),
  coalesce(o.metadata ->> 'mimetype', 'application/octet-stream'),
  'unlisted',
  o.created_at
from storage.objects o
where o.bucket_id = 'shared-files'
  and (storage.foldername(o.name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and exists (select 1 from public.profiles p where p.id = (storage.foldername(o.name))[1]::uuid)
on conflict (path) do nothing;
