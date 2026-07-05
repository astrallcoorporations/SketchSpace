alter table public.profiles
  add column banner_url text,
  add column social_links jsonb not null default '[]'::jsonb,
  add column favorite_mediums text[] not null default '{}',
  add column skills text[] not null default '{}',
  add column accent_color text,
  add column xp integer not null default 0;

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collections_owner_id_idx on public.collections (owner_id);

alter table public.collections enable row level security;

create policy "collections are publicly readable"
  on public.collections for select
  using (true);

create policy "owners manage their own collections"
  on public.collections for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

create table public.artwork_collections (
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (artwork_id, collection_id)
);

create index artwork_collections_collection_id_idx on public.artwork_collections (collection_id);

alter table public.artwork_collections enable row level security;

create policy "artwork_collections readable if artwork is readable"
  on public.artwork_collections for select
  using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.visibility = 'public' or a.owner_id = auth.uid())
    )
  );

create policy "owners manage their own artwork_collections"
  on public.artwork_collections for all
  using (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()));
