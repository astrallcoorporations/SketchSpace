create table public.comments (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_artwork_id_idx on public.comments (artwork_id);
create index comments_author_id_idx on public.comments (author_id);

alter table public.comments enable row level security;

create policy "comments readable if parent artwork is readable"
  on public.comments for select
  using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.visibility = 'public' or a.owner_id = auth.uid())
    )
  );

create policy "authenticated users can comment on readable artworks"
  on public.comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.visibility = 'public' or a.owner_id = auth.uid())
    )
  );

create policy "authors manage their own comments"
  on public.comments for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "authors delete their own comments"
  on public.comments for delete
  using (author_id = auth.uid());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);

alter table public.notifications enable row level security;

create policy "users read their own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "users mark their own notifications read"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users delete their own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());

-- No client insert policy — notifications are written by trigger/service role.

create table public.followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index followers_follower_id_idx on public.followers (follower_id);
create index followers_following_id_idx on public.followers (following_id);

alter table public.followers enable row level security;

create policy "follow graph is publicly readable"
  on public.followers for select
  using (true);

create policy "users manage their own follows"
  on public.followers for insert
  with check (follower_id = auth.uid());

create policy "users remove their own follows"
  on public.followers for delete
  using (follower_id = auth.uid());

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artwork_id)
);

create index likes_user_id_idx on public.likes (user_id);
create index likes_artwork_id_idx on public.likes (artwork_id);

alter table public.likes enable row level security;

create policy "likes readable if parent artwork is readable"
  on public.likes for select
  using (
    exists (
      select 1 from public.artworks a
      where a.id = artwork_id
        and (a.visibility = 'public' or a.owner_id = auth.uid())
    )
  );

create policy "users manage their own likes"
  on public.likes for insert
  with check (user_id = auth.uid());

create policy "users remove their own likes"
  on public.likes for delete
  using (user_id = auth.uid());

create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  verb text not null,
  object_type text,
  object_id uuid,
  created_at timestamptz not null default now()
);

create index activity_feed_user_id_idx on public.activity_feed (user_id, created_at desc);

alter table public.activity_feed enable row level security;

create policy "users read their own activity feed"
  on public.activity_feed for select
  using (user_id = auth.uid());

-- No client insert policy — the feed is fanned out by trigger/service role.
