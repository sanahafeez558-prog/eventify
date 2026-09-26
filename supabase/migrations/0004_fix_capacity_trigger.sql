-- ---------- fix capacity trigger for upsert & security definer ----------
-- 1. Must be SECURITY DEFINER with search_path = public so the trigger
--    can accurately count all confirmed registrations across all users,
--    bypassing the attendee-only SELECT RLS policy.
-- 2. Exclude current user_id so re-confirmations / duplicate upserts for
--    the same user do not count their own existing seat against capacity.

create or replace function public.enforce_event_capacity()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  confirmed_count integer;
  capacity integer;
begin
  if new.status = 'confirmed' then
    select max_attendees into capacity from public.events where id = new.event_id;

    select count(*) into confirmed_count
    from public.registrations
    where event_id = new.event_id
      and status = 'confirmed'
      and (user_id <> new.user_id);

    if confirmed_count >= capacity then
      raise exception 'EVENT_FULL: This event has reached its maximum capacity.';
    end if;
  end if;
  return new;
end;
$$;
