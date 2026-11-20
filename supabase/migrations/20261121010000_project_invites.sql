-- Adding people to a project.
--   * an added member gets a 'project_invite' notification (who added them, which project)
--   * removing a member un-assigns their tasks in that project, so no task points at a stranger
--   * only the project owner may add or remove other people (existing RLS), members may leave

create or replace function private.notify_project_member_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := (select auth.uid());
  project_name text;
begin
  -- Skip the owner's own row (created with the project) and people joining a public project themselves.
  if new.role <> 'member' or actor is null or actor = new.user_id then
    return new;
  end if;

  select name into project_name from public.projects where id = new.project_id;

  insert into public.notifications (user_id, type, payload)
  values (
    new.user_id,
    'project_invite',
    jsonb_build_object('actor_id', actor, 'project_id', new.project_id, 'project_name', project_name)
  );
  return new;
end;
$$;

revoke execute on function private.notify_project_member_added() from public, anon, authenticated;

drop trigger if exists project_members_notify on public.project_members;
create trigger project_members_notify
  after insert on public.project_members
  for each row execute function private.notify_project_member_added();

create or replace function private.unassign_removed_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tasks
     set assignee_id = null
   where project_id = old.project_id and assignee_id = old.user_id;
  return old;
end;
$$;

revoke execute on function private.unassign_removed_member() from public, anon, authenticated;

drop trigger if exists project_members_unassign on public.project_members;
create trigger project_members_unassign
  after delete on public.project_members
  for each row execute function private.unassign_removed_member();
