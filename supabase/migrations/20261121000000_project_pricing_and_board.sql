-- Project pricing + kanban board support.
--
-- Pricing rule: every user owns up to 3 projects for free; each project beyond that needs one
-- paid slot (INR 5). Enforced here, in the database, so no client can skip it.
--   payments         one row per Razorpay order (created by the server, settled by the webhook)
--   project_credits  one row per verified payment = one extra project slot
-- Allowed number of owned projects = 3 + count(project_credits).

-- ---------------------------------------------------------------------------
-- 1. Payments + credits
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text not null unique,
  provider_payment_id text unique,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index payments_user_id_idx on public.payments (user_id);

create table public.project_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  payment_id uuid not null unique references public.payments (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index project_credits_user_id_idx on public.project_credits (user_id);

alter table public.payments enable row level security;
alter table public.project_credits enable row level security;

-- Users can read their own rows. There are deliberately NO insert/update/delete policies:
-- only the server (service role, after a verified Razorpay event) writes these tables.
create policy "users read own payments"
  on public.payments for select
  using (user_id = (select auth.uid()));

create policy "users read own credits"
  on public.project_credits for select
  using (user_id = (select auth.uid()));

revoke insert, update, delete on public.payments from anon, authenticated;
revoke insert, update, delete on public.project_credits from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Limit constants + enforcement trigger
-- ---------------------------------------------------------------------------
create schema if not exists private;

create or replace function private.free_project_limit()
returns integer
language sql
immutable
as $$ select 3 $$;

create or replace function private.project_price_paise()
returns integer
language sql
immutable
as $$ select 500 $$;

-- Runs inside the INSERT, so a refusal rolls the whole statement back.
create or replace function private.enforce_project_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owned integer;
  credits integer;
begin
  -- Serialise concurrent creates by the same owner so two parallel inserts cannot both pass.
  perform pg_advisory_xact_lock(hashtextextended('project-limit:' || new.owner_id::text, 0));

  select count(*) into owned from public.projects where owner_id = new.owner_id;
  select count(*) into credits from public.project_credits where user_id = new.owner_id;

  if owned >= private.free_project_limit() + credits then
    raise exception 'PROJECT_LIMIT_REACHED: % projects owned, % allowed. Buy a project slot to create more.',
      owned, private.free_project_limit() + credits
      using errcode = 'P0001',
            hint = 'A paid project slot costs INR 5.';
  end if;

  return new;
end;
$$;

revoke execute on function private.enforce_project_limit() from public, anon, authenticated;

create trigger projects_enforce_limit
  before insert on public.projects
  for each row execute function private.enforce_project_limit();

-- The owner becomes a member in the same transaction (the client used to do this in a second
-- request, which could leave a project nobody could assign tasks in).
create or replace function private.add_owner_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$$;

revoke execute on function private.add_owner_as_member() from public, anon, authenticated;

create trigger projects_add_owner_member
  after insert on public.projects
  for each row execute function private.add_owner_as_member();

insert into public.project_members (project_id, user_id, role)
select p.id, p.owner_id, 'owner' from public.projects p
on conflict (project_id, user_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Quota read for the UI (SECURITY INVOKER: it only sees the caller's own rows)
-- ---------------------------------------------------------------------------
create or replace function public.my_project_quota()
returns jsonb
language sql
stable
set search_path = public
as $$
  with c as (
    select
      (select count(*) from public.projects where owner_id = (select auth.uid()))::int as owned,
      (select count(*) from public.project_credits where user_id = (select auth.uid()))::int as credits
  )
  select jsonb_build_object(
    'owned', c.owned,
    'free_limit', private.free_project_limit(),
    'paid_slots', c.credits,
    'allowed', private.free_project_limit() + c.credits,
    'free_remaining', greatest(private.free_project_limit() - c.owned, 0),
    'slots_remaining', greatest(private.free_project_limit() + c.credits - c.owned, 0),
    'can_create', c.owned < private.free_project_limit() + c.credits,
    'price_paise', private.project_price_paise(),
    'currency', 'INR'
  )
  from c;
$$;

revoke execute on function public.my_project_quota() from public, anon;
grant execute on function public.my_project_quota() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Fulfilment: atomic + idempotent. Only the service role (the verified webhook) may call it.
-- ---------------------------------------------------------------------------
create or replace function public.fulfill_payment(p_order_id text, p_payment_id text, p_amount_paise integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  pay public.payments%rowtype;
begin
  select * into pay from public.payments where provider_order_id = p_order_id for update;
  if not found then
    return false;
  end if;
  if pay.status = 'paid' then
    return true; -- already granted, webhook retry
  end if;
  if pay.amount_paise <> p_amount_paise then
    return false; -- never grant on an amount mismatch
  end if;

  update public.payments
     set status = 'paid', provider_payment_id = p_payment_id, paid_at = now()
   where id = pay.id;

  insert into public.project_credits (user_id, payment_id) values (pay.user_id, pay.id);
  return true;
end;
$$;

revoke execute on function public.fulfill_payment(text, text, integer) from public, anon, authenticated;
grant execute on function public.fulfill_payment(text, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Kanban: review column, ordering, assignee must be a member, realtime
-- ---------------------------------------------------------------------------
alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks
  add constraint tasks_status_check check (status in ('todo', 'in_progress', 'review', 'done'));

-- Fractional position: a move only rewrites the moved task (midpoint between neighbours).
alter table public.tasks add column if not exists position double precision not null default 0;

update public.tasks t
   set position = r.rn * 1024
  from (
    select id, row_number() over (partition by project_id, status order by created_at) as rn
    from public.tasks
  ) r
 where r.id = t.id;

create index if not exists tasks_board_idx on public.tasks (project_id, status, position);

alter table public.tasks
  add constraint tasks_title_length check (char_length(title) between 1 and 200);

create or replace function private.validate_task_assignee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assignee_id is not null and not exists (
    select 1 from public.project_members m
    where m.project_id = new.project_id and m.user_id = new.assignee_id
  ) then
    raise exception 'Assignee must be a member of the project.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke execute on function private.validate_task_assignee() from public, anon, authenticated;

create trigger tasks_validate_assignee
  before insert or update of assignee_id, project_id on public.tasks
  for each row execute function private.validate_task_assignee();

-- Realtime: members receive task changes (RLS still applies to what they are sent).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks'
  ) then
    alter publication supabase_realtime add table public.tasks;
  end if;
end $$;
