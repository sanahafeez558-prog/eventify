-- =========================================================
-- 0008_chatbot_audit_and_categories.sql
-- =========================================================

-- 1. Chatbot Sessions & Token Usage Tracking
create table if not exists public.chatbot_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  tokens_used integer not null default 0 check (tokens_used >= 0),
  max_tokens integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chatbot_sessions enable row level security;

drop policy if exists "chatbot_sessions_select_all" on public.chatbot_sessions;
create policy "chatbot_sessions_select_all"
  on public.chatbot_sessions for select
  using (true);

drop policy if exists "chatbot_sessions_insert_all" on public.chatbot_sessions;
create policy "chatbot_sessions_insert_all"
  on public.chatbot_sessions for insert
  with check (true);

drop policy if exists "chatbot_sessions_update_all" on public.chatbot_sessions;
create policy "chatbot_sessions_update_all"
  on public.chatbot_sessions for update
  using (true)
  with check (true);

-- 2. Audit Logs Table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text not null,
  target_id text,
  ip_address text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  using (public.is_admin());

drop policy if exists "audit_logs_insert_all" on public.audit_logs;
create policy "audit_logs_insert_all"
  on public.audit_logs for insert
  with check (true);

-- 3. Category Admin CRUD Policies
drop policy if exists "categories_insert_admin" on public.categories;
create policy "categories_insert_admin"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "categories_update_admin" on public.categories;
create policy "categories_update_admin"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories_delete_admin" on public.categories;
create policy "categories_delete_admin"
  on public.categories for delete
  using (public.is_admin());
