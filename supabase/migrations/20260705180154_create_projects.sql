create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_id_idx on public.projects (owner_id);

alter table public.projects enable row level security;

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'editor', 'member')),
  joined_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index project_members_project_id_idx on public.project_members (project_id);
create index project_members_user_id_idx on public.project_members (user_id);

alter table public.project_members enable row level security;

-- Projects: visible if public, or the caller owns/belongs to it.
create policy "projects readable if public or member"
  on public.projects for select
  using (
    visibility = 'public'
    or owner_id = auth.uid()
    or exists (select 1 from public.project_members m where m.project_id = id and m.user_id = auth.uid())
  );

create policy "authenticated users can create projects"
  on public.projects for insert
  with check (owner_id = auth.uid());

create policy "owners manage their projects"
  on public.projects for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners delete their projects"
  on public.projects for delete
  using (owner_id = auth.uid());

-- Project members: visible to other members of the same project.
create policy "members readable by project members"
  on public.project_members for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (p.visibility = 'public' or p.owner_id = auth.uid())
    )
    or exists (select 1 from public.project_members m where m.project_id = project_members.project_id and m.user_id = auth.uid())
  );

create policy "project owners add members"
  on public.project_members for insert
  with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

create policy "members can leave, owners can remove"
  on public.project_members for delete
  using (
    user_id = auth.uid()
    or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
  );

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  assignee_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_project_id_idx on public.tasks (project_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);

alter table public.tasks enable row level security;

create policy "tasks readable by project members"
  on public.tasks for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (p.visibility = 'public' or p.owner_id = auth.uid())
    )
    or exists (select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid())
  );

create policy "project members manage tasks"
  on public.tasks for all
  using (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
    or exists (select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
    or exists (select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid())
  );

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
