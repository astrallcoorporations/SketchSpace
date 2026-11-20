-- The notification trigger functions are SECURITY DEFINER and only ever run as triggers.
-- Revoke API execute so they are not exposed at /rest/v1/rpc/*. Triggers keep firing:
-- Postgres checks EXECUTE when the trigger is created, not when it fires.

revoke execute on function public.notify_on_comment() from public, anon, authenticated;
revoke execute on function public.notify_on_like() from public, anon, authenticated;
revoke execute on function public.notify_on_follow() from public, anon, authenticated;
