create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  medium text,
  tags text[] not null default '{}',
  visibility text not null default 'private' check (visibility in ('public', 'unlisted', 'private')),
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index artworks_owner_id_idx on public.artworks (owner_id);
create index artworks_visibility_idx on public.artworks (visibility);

alter table public.artworks enable row level security;

create policy "public artworks are readable by anyone"
  on public.artworks for select
  using (visibility = 'public' or owner_id = auth.uid());

create policy "owners manage their own artworks"
  on public.artworks for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

create table public.artwork_versions (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  image_url text not null,
  version_number integer not null,
  note text,
  created_at timestamptz not null default now(),
  unique (artwork_id, version_number)
);

create index artwork_versions_artwork_id_idx on public.artwork_versions (artwork_id);

alter table public.artwork_versions enable row level security;

create policy "versions readable if parent artwork is readable"
  on public.artwork_versions for select
  using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.visibility = 'public' or a.owner_id = auth.uid())
    )
  );

create policy "owners manage versions of their own artworks"
  on public.artwork_versions for all
  using (exists (select 1 from public.artworks a where a.id = artwork_id and a.owner_id = auth.uid()))
  with check (exists (select 1 from public.artworks a where a.id = artwork_id and a.owner_id = auth.uid()));
