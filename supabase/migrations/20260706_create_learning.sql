create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  icon text not null default 'Compass',
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.learning_paths enable row level security;

create policy "learning_paths are publicly readable"
  on public.learning_paths for select
  using (true);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  title text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index units_path_id_idx on public.units (path_id);

alter table public.units enable row level security;

create policy "units are publicly readable"
  on public.units for select
  using (true);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units (id) on delete cascade,
  title text not null,
  description text,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  xp_reward integer not null default 10,
  order_index integer not null default 0,
  content text,
  created_at timestamptz not null default now()
);

create index lessons_unit_id_idx on public.lessons (unit_id);

alter table public.lessons enable row level security;

create policy "lessons are publicly readable"
  on public.lessons for select
  using (true);

-- No write policies on learning_paths/units/lessons: curated catalog, server-side only.

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index lesson_progress_user_id_idx on public.lesson_progress (user_id);
create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);

alter table public.lesson_progress enable row level security;

create policy "users read their own lesson progress"
  on public.lesson_progress for select
  using (user_id = auth.uid());

create policy "users manage their own lesson progress"
  on public.lesson_progress for insert
  with check (user_id = auth.uid());

create policy "users update their own lesson progress"
  on public.lesson_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row execute function public.set_updated_at();

create table public.learning_streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

alter table public.learning_streaks enable row level security;

create policy "users read their own streak"
  on public.learning_streaks for select
  using (user_id = auth.uid());

create policy "users manage their own streak"
  on public.learning_streaks for insert
  with check (user_id = auth.uid());

create policy "users update their own streak"
  on public.learning_streaks for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger learning_streaks_set_updated_at
  before update on public.learning_streaks
  for each row execute function public.set_updated_at();

-- xp must only move through complete_lesson(), never a direct client UPDATE
-- (otherwise any signed-in user could just PATCH their own profile to any
-- xp value). Column-level privileges enforce this; RLS is row-level only.
revoke update on public.profiles from authenticated;
grant update (username, display_name, avatar_url, bio, banner_url, social_links, favorite_mediums, skills, accent_color)
  on public.profiles to authenticated;

-- Atomically complete a lesson: marks progress, awards XP once (guards
-- against double-award on re-submit), and updates the caller's streak.
-- security definer so it runs as the table owner (full column privileges)
-- regardless of the column-level revoke above; RLS on lesson_progress /
-- learning_streaks still applies via explicit auth.uid() checks inside.
create or replace function public.complete_lesson(p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_xp integer;
  v_already_completed boolean;
  v_last_date date;
  v_current integer;
  v_longest integer;
begin
  if v_user_id is null then
    raise exception 'complete_lesson requires an authenticated user';
  end if;

  select xp_reward into v_xp from public.lessons where id = p_lesson_id;
  if v_xp is null then
    raise exception 'unknown lesson %', p_lesson_id;
  end if;

  select exists (
    select 1 from public.lesson_progress
    where user_id = v_user_id and lesson_id = p_lesson_id and status = 'completed'
  ) into v_already_completed;

  insert into public.lesson_progress (user_id, lesson_id, status, completed_at)
  values (v_user_id, p_lesson_id, 'completed', now())
  on conflict (user_id, lesson_id)
  do update set status = 'completed', completed_at = now();

  if v_already_completed then
    return;
  end if;

  update public.profiles set xp = xp + v_xp where id = v_user_id;

  select last_activity_date, current_streak, longest_streak
    into v_last_date, v_current, v_longest
    from public.learning_streaks where user_id = v_user_id;

  if v_last_date is null then
    v_current := 1;
  elsif v_last_date = current_date then
    null;
  elsif v_last_date = current_date - 1 then
    v_current := v_current + 1;
  else
    v_current := 1;
  end if;

  v_longest := greatest(coalesce(v_longest, 0), v_current);

  insert into public.learning_streaks (user_id, current_streak, longest_streak, last_activity_date)
  values (v_user_id, v_current, v_longest, current_date)
  on conflict (user_id)
  do update set
    current_streak = v_current,
    longest_streak = v_longest,
    last_activity_date = current_date;
end;
$$;

revoke execute on function public.complete_lesson(uuid) from public, anon;
grant execute on function public.complete_lesson(uuid) to authenticated;
