# Architecture.md — Eventify Technical Architecture

## 1. Application Architecture (High Level)

```
Browser (Next.js App Router, React Server + Client Components)
        │
        ▼
Next.js Middleware (session refresh, route protection)
        │
        ▼
Supabase Client Libraries (@supabase/ssr)
   ├── Server client   → used in Server Components / Route Handlers / Server Actions
   └── Browser client  → used in Client Components (forms, interactive widgets)
        │
        ▼
Supabase Auth (email/password, JWT session in httpOnly cookies)
        │
        ▼
PostgreSQL (Supabase-hosted) — tables + RLS policies + triggers
```

Eventify is a single Next.js application. There is no separate custom backend server — Supabase acts as the backend (Postgres + Auth + RLS + auto-generated REST/RPC via `postgrest`, accessed through the Supabase JS client). Server Actions and Route Handlers are used only where server-side privilege or secret handling is required (there is minimal need for this, since RLS does the authorization work).

## 2. Folder Structure

```
eventify/
│
├── app/
│   ├── layout.tsx                  # Root layout (fonts, providers, toaster)
│   ├── page.tsx                    # Home ("/")
│   ├── globals.css                 # Tailwind base + design tokens
│   │
│   ├── events/
│   │   ├── page.tsx                # Events discovery ("/events")
│   │   └── [id]/
│   │       └── page.tsx            # Event details ("/events/[id]")
│   │
│   ├── categories/
│   │   └── page.tsx                # "/categories"
│   │
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx              # Protected layout (auth check + sidebar)
│   │   ├── page.tsx                # Overview
│   │   ├── events/
│   │   │   └── page.tsx            # "My Events" (registrations)
│   │   ├── create-event/
│   │   │   └── page.tsx
│   │   ├── manage-events/
│   │   │   ├── page.tsx            # List of owned events
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   │
│   └── auth/
│       └── callback/
│           └── route.ts            # Supabase auth callback (if using email confirmation links)
│
├── components/
│   ├── ui/                         # shadcn/ui primitives (button, input, card, dialog, etc.)
│   ├── layout/                     # Navbar, Footer, DashboardSidebar, MobileNav
│   ├── events/                     # EventCard, EventFilters, EventForm, SeatCounter, RegisterButton
│   └── dashboard/                  # StatCard, RecentRegistrations, QuickActions
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient()
│   │   ├── server.ts               # createServerClient() for Server Components/Actions
│   │   └── middleware.ts           # session refresh helper used by middleware.ts
│   ├── validations/                # zod schemas (auth, event, registration, contact)
│   └── utils.ts                    # cn(), date formatters, misc helpers
│
├── types/
│   └── database.types.ts           # Generated Supabase types (supabase gen types typescript)
│
├── public/
│   └── (logo.svg, favicon, static images)
│
├── supabase/
│   └── migrations/
│       ├── 0001_init_schema.sql
│       ├── 0002_rls_policies.sql
│       └── 0003_seed_categories.sql
│
├── middleware.ts                   # Route protection + session refresh
├── PRD.md
├── Architecture.md
├── Task.md
├── Memory.md
├── Design.md
├── Rules.md
├── Agent.md
├── ANTIGRAVITY_PROMPT.md
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

Adjustment vs. the brief: `auth/callback` is added because Supabase's SSR auth helpers need a route handler to exchange the auth code for a session on flows involving email confirmation; if email confirmation is disabled in the Supabase Auth settings, this route is inert but harmless to keep.

## 3. Frontend Architecture

- **Rendering model:** Server Components by default. Pages that only read data (Home, Events list, Event details, Categories, About) are Server Components that query Supabase directly on the server. Interactive pieces (forms, register button, filters, dashboard actions) are Client Components (`"use client"`) nested inside.
- **Routing:** Next.js App Router, file-based, matching the folder structure above.
- **Data fetching:** Server Components call `lib/supabase/server.ts`'s client directly inside an `async` component. Client Components that mutate data call `lib/supabase/client.ts`'s client directly (Supabase JS handles the network call; RLS is the authorization boundary, so no bespoke API layer is required for CRUD).
- **Forms:** `react-hook-form` + `zod` resolver for all forms (signup, login, contact, create/edit event). Validation schemas live in `lib/validations/`.

## 4. Backend Architecture

Eventify does not run a custom Node/Express backend. "Backend logic" lives in two places:

1. **Supabase (Postgres + RLS + triggers)** — the authorization and data-integrity boundary (ownership checks, duplicate-registration prevention, capacity enforcement).
2. **Next.js Server Actions / Route Handlers** — used sparingly, only for: (a) the `auth/callback` route, and (b) any mutation that benefits from running on the server to avoid exposing multi-step logic to the client (e.g., "create event" can be a Server Action that validates with zod then inserts).

This keeps the system simple: no separate API service to deploy, secure, or version.

## 5. Database Architecture

### 5.1 Entity-Relationship Summary

```
auth.users (Supabase-managed)
     │ 1:1
     ▼
profiles ──────────────< events >──────────────── categories
     │                        │
     │                        │ 1:N
     │                        ▼
     └────────────────< registrations
```

- One `profiles` row per `auth.users` row (created by trigger on signup).
- One `profiles` row (organizer) has many `events`.
- One `categories` row has many `events` (nullable — a category can be deleted without deleting its events).
- One `events` row has many `registrations`; one `profiles` row (attendee) has many `registrations`.
- `contact_messages` is standalone (no FK to auth), since the contact form does not require login.

### 5.2 Schema DDL

```sql
-- =========================================================
-- 0001_init_schema.sql
-- =========================================================
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------- profiles ----------
create table public.profiles (
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
create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  description  text,
  icon         text, -- lucide-react icon name, e.g. 'Laptop', 'Briefcase'
  created_at   timestamptz not null default now()
);

-- ---------- events ----------
create table public.events (
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

create index idx_events_category_id  on public.events(category_id);
create index idx_events_organizer_id on public.events(organizer_id);
create index idx_events_event_date   on public.events(event_date);
create index idx_events_status       on public.events(status);

-- ---------- registrations ----------
create table public.registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  registered_at  timestamptz not null default now(),
  status         text not null default 'confirmed'
                 check (status in ('confirmed', 'cancelled')),
  unique (event_id, user_id) -- one registration row per user per event, ever
);

create index idx_registrations_event_id on public.registrations(event_id);
create index idx_registrations_user_id  on public.registrations(user_id);

-- ---------- contact_messages ----------
create table public.contact_messages (
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

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

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

create trigger trg_registrations_capacity
  before insert or update on public.registrations
  for each row execute function public.enforce_event_capacity();
```

### 5.3 Constraints & Relationships Summary

| Table | PK | FK | Unique | Cascade behavior |
|---|---|---|---|---|
| `profiles` | `id` | `id → auth.users.id` | `email` | Deleting the auth user deletes the profile. |
| `categories` | `id` | — | `name` | — |
| `events` | `id` | `organizer_id → profiles.id`, `category_id → categories.id` | — | Deleting a profile deletes their events (cascade). Deleting a category sets `category_id` null on its events (preserve events). |
| `registrations` | `id` | `event_id → events.id`, `user_id → profiles.id` | `(event_id, user_id)` | Deleting an event or a profile deletes related registrations (cascade). |
| `contact_messages` | `id` | — | — | Standalone. |

Duplicate-registration prevention is the `unique (event_id, user_id)` constraint combined with a soft-cancel pattern: cancelling sets `status = 'cancelled'` on the existing row instead of deleting it; re-registering updates that same row back to `'confirmed'` (upsert on conflict), so the constraint can never be defeated by insert races.

### 5.4 Row Level Security (RLS)

```sql
-- =========================================================
-- 0002_rls_policies.sql
-- =========================================================
alter table public.profiles          enable row level security;
alter table public.categories        enable row level security;
alter table public.events            enable row level security;
alter table public.registrations     enable row level security;
alter table public.contact_messages  enable row level security;

-- ---------- profiles ----------
create policy "profiles_select_public"
  on public.profiles for select
  using (true); -- names/avatars are shown publicly (organizer display, etc.)

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------- categories ----------
create policy "categories_select_public"
  on public.categories for select
  using (true);
-- No insert/update/delete policy for regular users: categories are
-- managed via migration/seed only for this course build.

-- ---------- events ----------
create policy "events_select_published_or_own"
  on public.events for select
  using (status = 'published' or organizer_id = auth.uid());

create policy "events_insert_own"
  on public.events for insert
  with check (organizer_id = auth.uid());

create policy "events_update_own"
  on public.events for update
  using (organizer_id = auth.uid())
  with check (organizer_id = auth.uid());

create policy "events_delete_own"
  on public.events for delete
  using (organizer_id = auth.uid());

-- ---------- registrations ----------
create policy "registrations_select_own_or_organizer"
  on public.registrations for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.events e
      where e.id = registrations.event_id
        and e.organizer_id = auth.uid()
    )
  );

create policy "registrations_insert_own"
  on public.registrations for insert
  with check (user_id = auth.uid());

create policy "registrations_update_own"
  on public.registrations for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------- contact_messages ----------
create policy "contact_messages_insert_anyone"
  on public.contact_messages for insert
  with check (true);

create policy "contact_messages_select_admin_only"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
```

**Ownership rule in force:** every mutating policy checks `auth.uid()` against the row's owner column (`organizer_id` for events, `user_id` for registrations, `id` for profiles). The frontend never sends a client-trusted "owner" field — Postgres derives and checks it from the authenticated JWT on every request. A crafted request from another user's session for someone else's `event.id` will be rejected by Postgres before it reaches application logic.

## 6. Authentication Architecture

- Supabase Auth, email/password provider only.
- `@supabase/ssr` is used to keep the session in httpOnly cookies, readable by both Server Components and middleware.
- `middleware.ts` runs on every request: refreshes the Supabase session cookie, and for any path under `/dashboard`, checks for a valid session; if absent, redirects to `/login?redirect=<path>`.
- On successful login, if a `redirect` query param is present, the app pushes the user there; otherwise to `/dashboard`.
- Logout calls `supabase.auth.signOut()` client-side, then redirects to `/`.

## 7. Authorization Architecture

Authorization is enforced at two layers, in this order of trust:

1. **Database (source of truth):** RLS policies above. This is the layer that actually matters for security.
2. **UI (convenience only):** conditionally hiding Edit/Delete buttons, disabling a full Register button, etc. — purely to avoid showing users controls that would fail; never relied upon as the real guard.

## 8. Supabase Integration

- `lib/supabase/client.ts` — `createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`, used in Client Components.
- `lib/supabase/server.ts` — `createServerClient(...)` wired to Next's `cookies()`, used in Server Components, Route Handlers, and Server Actions.
- The **service role key is never used in this application** — every operation, including "admin" reads like the contact-message inbox, goes through RLS with the `admin` role check on `profiles.role`, not through a privileged key. This keeps the entire codebase safe to opensource for the course submission.

## 9. Data Flow (representative)

**Register for an event (client-driven):**
```
User clicks "Register"
  → Client Component calls supabase.from('registrations').upsert({ event_id, user_id: session.user.id, status: 'confirmed' }, { onConflict: 'event_id,user_id' })
  → Postgres: RLS checks user_id = auth.uid() ✓
  → Trigger enforce_event_capacity() checks confirmed count < max_attendees
  → Row committed or exception surfaced
  → Client reads the typed Postgres error, maps 'EVENT_FULL' to a friendly toast
  → UI revalidates seat count (refetch or optimistic rollback)
```

**Create an event (server-driven via Server Action):**
```
Form submit → zod validation (client) → Server Action
  → zod validation (server, defense in depth)
  → supabase.from('events').insert({ ...fields, organizer_id: session.user.id })
  → RLS checks organizer_id = auth.uid() ✓
  → redirect to /dashboard/manage-events with success toast
```

## 10. Component Architecture

- `components/ui/*` — shadcn/ui primitives only (Button, Input, Card, Dialog, Select, Badge, Skeleton, Toast/Sonner). Never edited for one-off styling; compose instead.
- `components/layout/*` — `Navbar`, `Footer`, `DashboardSidebar`, `MobileNav`. Rendered once per relevant layout (`app/layout.tsx` for public, `app/dashboard/layout.tsx` for dashboard).
- `components/events/*` — `EventCard`, `EventFilters`, `EventForm` (shared by create + edit), `RegisterButton`, `SeatCounter`, `CategoryBadge`.
- `components/dashboard/*` — `StatCard`, `RecentRegistrationsList`, `QuickActions`.

Rule: any UI block used on 2+ pages becomes a component before a second copy is written.

## 11. State Management Approach

No global state library. Justification: almost all state is server state (Supabase rows), which belongs in Server Components or is refetched after mutation. Local UI-only state (form fields, filter selections, modal open/closed) uses React's `useState`/`useReducer`. If cross-component client state is ever needed (e.g., filters shared between a sidebar and a list on the same page), lift state to the nearest common Client Component parent — do not introduce Redux/Zustand/Context for this scope.

## 12. Error Handling

- Supabase errors are typed (`PostgrestError`); a small `lib/utils.ts` helper `getFriendlyError(error)` maps known codes/messages (unique violation, `EVENT_FULL`, RLS denial) to short user-facing strings, and falls back to a generic "Something went wrong, please try again."
- All async mutations show a loading state on the trigger control (disabled button + spinner) and a toast (via shadcn/ui `sonner`) on success/failure.
- Server Components that fetch lists wrap the query in a `try/catch`-equivalent (checking `{ data, error }`) and render a dedicated error state component, distinct from the empty state.
- `app/error.tsx` and `app/global-error.tsx` provide top-level React error boundaries for unexpected render-time failures.

## 13. Environment Configuration

`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

These are the only two variables required at this scope (matching current Supabase JS client conventions — the anon key is safe for browser exposure by design, and RLS is what actually protects data). No service-role key is defined anywhere in the app or its env files.

## 14. Deployment Architecture

```
git push → GitHub (main branch)
              │
              ▼
        Vercel (connected to repo, auto-deploy on push to main)
              │
              ▼
   Next.js build (npm run build) served from Vercel edge/serverless
              │
              ▼
   Runtime calls out to Supabase (hosted Postgres + Auth), using
   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY from
   Vercel Project → Settings → Environment Variables
```

## 15. GitHub Workflow

- Single `main` branch is sufficient for this scope (course project, small team). Feature branches optional but encouraged for larger changes.
- Commits are grouped by milestone (see Rules.md / Task.md), not per-file — aim for one meaningful commit per completed Task.md phase item, not per keystroke.
- `.env` and `.env.local` are gitignored; only `.env.example` is committed.

## 16. Vercel Deployment Flow

1. Import the GitHub repo into Vercel.
2. Framework preset: Next.js (auto-detected).
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel → Project → Settings → Environment Variables (Production + Preview).
4. Build command: `next build` (default). Output: `.next` (default, no override needed).
5. Every push to `main` triggers a new Production deployment; pull requests get Preview deployments automatically.
