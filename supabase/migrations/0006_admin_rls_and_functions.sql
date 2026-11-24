-- =========================================================
-- 0006_admin_rls_and_functions.sql
-- =========================================================

-- Helper function to check if current authenticated user is an admin
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Grant execute on is_admin to authenticated users and anon
grant execute on function public.is_admin() to authenticated, anon;

-- Update RLS policies for profiles to allow Admin full management
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin() or (select auth.uid()) = id)
  with check (public.is_admin() or (select auth.uid()) = id);

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin() or (select auth.uid()) = id);

-- Update RLS policies for events to allow Admin full management
drop policy if exists "events_select_published_or_own" on public.events;
drop policy if exists "events_select_admin" on public.events;
create policy "events_select_admin"
  on public.events for select
  using (status = 'published' or organizer_id = (select auth.uid()) or public.is_admin());

drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_insert_admin" on public.events;
create policy "events_insert_admin"
  on public.events for insert
  with check (organizer_id = (select auth.uid()) or public.is_admin());

drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_update_admin" on public.events;
create policy "events_update_admin"
  on public.events for update
  using (organizer_id = (select auth.uid()) or public.is_admin())
  with check (organizer_id = (select auth.uid()) or public.is_admin());

drop policy if exists "events_delete_own" on public.events;
drop policy if exists "events_delete_admin" on public.events;
create policy "events_delete_admin"
  on public.events for delete
  using (organizer_id = (select auth.uid()) or public.is_admin());

-- Update RLS policies for registrations to allow Admin full management
drop policy if exists "registrations_select_own_or_organizer" on public.registrations;
drop policy if exists "registrations_select_admin" on public.registrations;
create policy "registrations_select_admin"
  on public.registrations for select
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.events e
      where e.id = registrations.event_id
        and e.organizer_id = (select auth.uid())
    )
    or public.is_admin()
  );

drop policy if exists "registrations_insert_own" on public.registrations;
drop policy if exists "registrations_insert_admin" on public.registrations;
create policy "registrations_insert_admin"
  on public.registrations for insert
  with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "registrations_update_own" on public.registrations;
drop policy if exists "registrations_update_admin" on public.registrations;
create policy "registrations_update_admin"
  on public.registrations for update
  using (user_id = (select auth.uid()) or public.is_admin())
  with check (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "registrations_delete_admin" on public.registrations;
create policy "registrations_delete_admin"
  on public.registrations for delete
  using (user_id = (select auth.uid()) or public.is_admin());

-- Update RLS policies for contact_messages to allow Admin full management
drop policy if exists "contact_messages_delete_admin" on public.contact_messages;
create policy "contact_messages_delete_admin"
  on public.contact_messages for delete
  using (public.is_admin());
