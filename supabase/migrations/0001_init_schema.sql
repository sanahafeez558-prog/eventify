-- =========================================================
-- 0001_init_schema.sql
-- =========================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------- profiles ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  avatar_url  text,
  role        text not null default 'attendee'
              check (role in ('attendee', 'organizer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  icon         text, -- lucide-react icon name, e.g. 'Laptop', 'Briefcase'
  created_at   timestamptz not null default now()
);

-- ---------- events ----------
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  organizer_id   uuid not null references public.profiles(id) on delete cascade,
  category_id    uuid references public.categories(id) on delete set null,
  title          text not null,
  description    text not null,
  image_url      text,
  event_date     date not null,
  start_time     time not null,
  end_time       time not null,
  location       text not null,
  max_attendees  integer not null check (max_attendees > 0),
  status         text not null default 'published'
                 check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists idx_events_category_id  on public.events(category_id);
create index if not exists idx_events_organizer_id on public.events(organizer_id);
create index if not exists idx_events_event_date   on public.events(event_date);
create index if not exists idx_events_status       on public.events(status);

-- ---------- registrations ----------
create table if not exists public.registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  registered_at  timestamptz not null default now(),
  status         text not null default 'confirmed'
                 check (status in ('confirmed', 'cancelled')),
  unique (event_id, user_id) -- one registration row per user per event, ever
);

create index if not exists idx_registrations_event_id on public.registrations(event_id);
create index if not exists idx_registrations_user_id  on public.registrations(user_id);

-- ---------- contact_messages ----------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- ---------- updated_at trigger helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------- auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- capacity enforcement on registration ----------
create or replace function public.enforce_event_capacity()
returns trigger language plpgsql as $$
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
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000');

    if confirmed_count >= capacity then
      raise exception 'EVENT_FULL: This event has reached its maximum capacity.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_registrations_capacity on public.registrations;
create trigger trg_registrations_capacity
  before insert or update on public.registrations
  for each row execute function public.enforce_event_capacity();
