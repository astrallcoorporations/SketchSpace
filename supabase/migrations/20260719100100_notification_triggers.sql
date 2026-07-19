-- notifications had RLS allowing reads but nothing ever wrote rows
-- (no client insert policy by design). Fan out from social events here.

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  artwork_owner uuid;
begin
  select owner_id into artwork_owner from public.artworks where id = new.artwork_id;
  if artwork_owner is not null and artwork_owner <> new.author_id then
    insert into public.notifications (user_id, type, payload)
    values (
      artwork_owner,
      'comment',
      jsonb_build_object('actor_id', new.author_id, 'artwork_id', new.artwork_id, 'comment_id', new.id)
    );
  end if;
  return new;
end;
$$;

create trigger comments_notify
  after insert on public.comments
  for each row execute function public.notify_on_comment();

create or replace function public.notify_on_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  artwork_owner uuid;
begin
  select owner_id into artwork_owner from public.artworks where id = new.artwork_id;
  if artwork_owner is not null and artwork_owner <> new.user_id then
    insert into public.notifications (user_id, type, payload)
    values (
      artwork_owner,
      'like',
      jsonb_build_object('actor_id', new.user_id, 'artwork_id', new.artwork_id)
    );
  end if;
  return new;
end;
$$;

create trigger likes_notify
  after insert on public.likes
  for each row execute function public.notify_on_like();

create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, payload)
  values (new.following_id, 'follow', jsonb_build_object('actor_id', new.follower_id));
  return new;
end;
$$;

create trigger followers_notify
  after insert on public.followers
  for each row execute function public.notify_on_follow();
