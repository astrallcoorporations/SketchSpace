create table public.quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  xp_reward integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quests enable row level security;

create policy "quests are publicly readable"
  on public.quests for select
  using (true);

-- No insert/update/delete policy: the catalog is curated server-side only.

create table public.quest_progress (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  progress integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quest_id, user_id)
);

create index quest_progress_user_id_idx on public.quest_progress (user_id);
create index quest_progress_quest_id_idx on public.quest_progress (quest_id);

alter table public.quest_progress enable row level security;

create policy "users read their own quest progress"
  on public.quest_progress for select
  using (user_id = auth.uid());

create policy "users manage their own quest progress"
  on public.quest_progress for insert
  with check (user_id = auth.uid());

create policy "users update their own quest progress"
  on public.quest_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger quest_progress_set_updated_at
  before update on public.quest_progress
  for each row execute function public.set_updated_at();
