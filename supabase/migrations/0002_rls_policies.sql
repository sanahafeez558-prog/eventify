-- =========================================================
-- 0002_rls_policies.sql
-- =========================================================
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.events            enable row level security;
alter table public.registrations     enable row level security;
alter table public.contact_messages  enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  using (true); -- names/avatars are shown publicly (organizer display, etc.)

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------- categories ----------
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories for select
  using (true);

-- ---------- events ----------
drop policy if exists "events_select_published_or_own" on public.events;
create policy "events_select_published_or_own"
  on public.events for select
  using (status = 'published' or organizer_id = (select auth.uid()));

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own"
  on public.events for insert
  with check (organizer_id = (select auth.uid()));

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own"
  on public.events for update
  using (organizer_id = (select auth.uid()))
  with check (organizer_id = (select auth.uid()));

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own"
  on public.events for delete
  using (organizer_id = (select auth.uid()));

-- ---------- registrations ----------
drop policy if exists "registrations_select_own_or_organizer" on public.registrations;
create policy "registrations_select_own_or_organizer"
  on public.registrations for select
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.events e
      where e.id = registrations.event_id
        and e.organizer_id = (select auth.uid())
    )
  );

drop policy if exists "registrations_insert_own" on public.registrations;
create policy "registrations_insert_own"
  on public.registrations for insert
  with check (user_id = (select auth.uid()));

drop policy if exists "registrations_update_own" on public.registrations;
create policy "registrations_update_own"
  on public.registrations for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------- contact_messages ----------
drop policy if exists "contact_messages_insert_anyone" on public.contact_messages;
create policy "contact_messages_insert_anyone"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "contact_messages_select_admin_only" on public.contact_messages;
create policy "contact_messages_select_admin_only"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
