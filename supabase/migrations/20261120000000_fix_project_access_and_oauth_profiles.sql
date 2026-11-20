-- 1. Project access: the original policies referenced each other (projects <-> project_members),
--    which risks "infinite recursion detected in policy", and the projects policy compared
--    `m.project_id = m.id` (always false), so private-project members could never see their project.
--    Move the membership checks into SECURITY DEFINER helpers in a non-API schema.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_project_member(pid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = pid and user_id = (select auth.uid())
  );
$$;

create or replace function private.can_read_project(pid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = pid
      and (
        p.visibility = 'public'
        or p.owner_id = (select auth.uid())
        or exists (
          select 1 from public.project_members m
          where m.project_id = p.id and m.user_id = (select auth.uid())
        )
      )
  );
$$;

grant execute on function private.is_project_member(uuid) to anon, authenticated;
grant execute on function private.can_read_project(uuid) to anon, authenticated;

drop policy if exists "projects readable if public or member" on public.projects;
create policy "projects readable if public or member"
  on public.projects for select
  using (
    visibility = 'public'
    or owner_id = (select auth.uid())
    or private.is_project_member(id)
  );

drop policy if exists "members readable by project members" on public.project_members;
create policy "members readable by project members"
  on public.project_members for select
  using (private.can_read_project(project_id));

-- Owners can add anyone; any signed-in user can add THEMSELVES to a public project.
drop policy if exists "project owners add members" on public.project_members;
create policy "owners add members or users join public projects"
  on public.project_members for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = (select auth.uid())
    )
    or (
      user_id = (select auth.uid())
      and role = 'member'
      and exists (
        select 1 from public.projects p
        where p.id = project_id and p.visibility = 'public'
      )
    )
  );

drop policy if exists "tasks readable by project members" on public.tasks;
create policy "tasks readable by project members"
  on public.tasks for select
  using (private.can_read_project(project_id));

-- 2. OAuth profiles: Google sends `full_name` / `picture`, not `name` / `avatar_url`.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  base_username := lower(regexp_replace(split_part(coalesce(new.email, ''), '@', 1), '[^a-z0-9_]', '', 'g'));
  if base_username = '' then
    base_username := 'artist';
  end if;
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    final_username := base_username || '_' || substr(md5(random()::text), 1, 5);
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(meta ->> 'name', meta ->> 'full_name'),
    coalesce(meta ->> 'avatar_url', meta ->> 'picture')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Backfill any auth user that never got a profile row.
insert into public.profiles (id, username, display_name, avatar_url)
select
  u.id,
  case
    when exists (
      select 1 from public.profiles p
      where p.username = coalesce(nullif(lower(regexp_replace(split_part(coalesce(u.email, ''), '@', 1), '[^a-z0-9_]', '', 'g')), ''), 'artist')
    )
    then coalesce(nullif(lower(regexp_replace(split_part(coalesce(u.email, ''), '@', 1), '[^a-z0-9_]', '', 'g')), ''), 'artist') || '_' || substr(md5(u.id::text), 1, 5)
    else coalesce(nullif(lower(regexp_replace(split_part(coalesce(u.email, ''), '@', 1), '[^a-z0-9_]', '', 'g')), ''), 'artist')
  end,
  coalesce(u.raw_user_meta_data ->> 'name', u.raw_user_meta_data ->> 'full_name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
