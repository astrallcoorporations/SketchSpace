-- Pin search_path so these functions can't be hijacked by a malicious schema
-- earlier in a caller's search_path.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user is only ever meant to run via the on_auth_user_created
-- trigger (which doesn't need API-level EXECUTE grants) — revoke direct
-- callability through the PostgREST RPC surface.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
