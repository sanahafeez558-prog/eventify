# Task.md — Eventify Phased Implementation Plan

Legend: `[ ]` not started · `[~]` in progress · `[x]` done
Each task lists an ID, description, dependencies, and acceptance criteria. Antigravity must update the checkbox as work completes and must not skip a phase's dependencies.

---

## PHASE 0 — Connection & Foundation

- [x] **T0.1** Inspect existing workspace (files, `package.json`, `.git`, `node_modules`, any existing `app/`).
  Dependencies: none.
  Acceptance: A clear written determination of what already exists vs. what must be created, before any file is created or overwritten.

- [x] **T0.2** Verify Git status (`git status`, `git remote -v`, `git log --oneline -5`).
  Dependencies: T0.1.
  Acceptance: Known whether Git is initialized and whether a GitHub remote is already attached.

- [x] **T0.3** Verify/establish GitHub connection (preserve existing remote if present; otherwise initialize repo and instruct on remote creation if Antigravity lacks the capability to create one itself).
  Dependencies: T0.2.
  Acceptance: `git remote -v` shows a valid GitHub remote, or a clear note is left in Memory.md that this step needs manual completion.

- [x] **T0.4** Verify/establish Supabase project connection (existing project URL/keys present in env, or a new project must be created by the human operator).
  Dependencies: T0.1.
  Acceptance: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are resolvable (present in `.env.local`, not committed).

- [x] **T0.5** Initialize Next.js project (TypeScript, App Router, Tailwind) if not already present. Do not overwrite an existing working `app/` directory.
  Dependencies: T0.1.
  Acceptance: `npm run dev` boots a default Next.js page with no errors.

- [x] **T0.6** Install and configure shadcn/ui.
  Dependencies: T0.5.
  Acceptance: `components/ui/button.tsx` (or equivalent) renders correctly on a scratch page.

- [x] **T0.7** Create `.env.example` documenting required variables; create local `.env.local` (gitignored) with real values.
  Dependencies: T0.4.
  Acceptance: `.env.example` committed with empty values; `.env.local` present locally and ignored by Git.

- [x] **T0.8** Establish project folder structure per Architecture.md.
  Dependencies: T0.5.
  Acceptance: Folder tree matches Architecture.md §2 (adjustments logged in Memory.md if any).

- [x] **T0.9** Establish Git workflow: initial commit, `.gitignore` verified (node_modules, .env*, .next).
  Dependencies: T0.3, T0.8.
  Acceptance: First commit "Initial project setup" pushed to `main`.

---

## PHASE 1 — Architecture & Database

- [x] **T1.1** Write and run migration `0001_init_schema.sql` (tables, constraints, indexes, triggers) per Architecture.md §5.2.
  Dependencies: T0.4.
  Acceptance: All 5 tables exist in Supabase; `select 1 from information_schema.tables` confirms.

- [x] **T1.2** Write and run migration `0002_rls_policies.sql` (enable RLS + all policies) per Architecture.md §5.4.
  Dependencies: T1.1.
  Acceptance: Querying `events` with the anon key and no session returns only `published` rows; inserting an event without a valid session is rejected.

- [x] **T1.3** Write and run seed migration `0003_seed_categories.sql` with the 8 categories (Technology, Business, Education, Networking, Workshops, Entertainment, Sports, Community).
  Dependencies: T1.1.
  Acceptance: `select count(*) from categories` = 8.

- [x] **T1.4** Generate TypeScript types from the live schema (`supabase gen types typescript`) into `types/database.types.ts`.
  Dependencies: T1.1.
  Acceptance: Typed `Database` type importable and used by both Supabase clients.

- [x] **T1.5** Verify basic read/write against Supabase from a throwaway script or a scratch page (insert a test profile-linked event, read it back, delete it).
  Dependencies: T1.1, T1.2.
  Acceptance: Round-trip succeeds; scratch code removed after verification.

- [x] **T1.6** Build `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`.
  Dependencies: T1.4.
  Acceptance: Both clients compile and successfully fetch `categories` in a test render.

---

## PHASE 2 — Design System

- [x] **T2.1** Configure Tailwind theme tokens (colors, radius, shadows) per Design.md.
  Dependencies: T0.6.
- [x] **T2.2** Build base typography styles (headings, body, font imports).
  Dependencies: T2.1.
- [x] **T2.3** Build/verify shadcn components needed: Button, Input, Textarea, Select, Card, Badge, Dialog, Sheet, Toast/Sonner, Skeleton, Avatar, Tabs.
  Dependencies: T0.6.
- [x] **T2.4** Build glass card + glass surface utility classes.
  Dependencies: T2.1.
- [x] **T2.5** Build `Navbar` (desktop + mobile sheet) and `Footer`.
  Dependencies: T2.1–T2.4.
  Acceptance for phase: A scratch page demonstrates every component from Design.md rendering correctly, light theme, responsive.

---

## PHASE 3 — Public Pages

- [x] **T3.1** Home page (`/`) — hero, featured events (live query), categories grid, "How it works", CTA, footer.
  Dependencies: Phase 2, T1.6.
- [x] **T3.2** Events discovery page (`/events`) — search, filters, sort, grid, loading/empty/error states.
  Dependencies: Phase 2, T1.6.
- [x] **T3.3** Event details page (`/events/[id]`) — full detail render, seat counter, register control (auth-gated).
  Dependencies: T3.2.
- [x] **T3.4** Categories page (`/categories`) — grid of categories linking to filtered `/events`.
  Dependencies: T1.6.
- [x] **T3.5** About page (`/about`) — static content, on-brand.
  Dependencies: Phase 2.
- [x] **T3.6** Contact page (`/contact`) — form, inserts into `contact_messages`, success/error state.
  Dependencies: T1.6.
  Acceptance for phase: All public pages render real Supabase data (where applicable) and are visually consistent with Design.md.

---

## PHASE 4 — Authentication

- [x] **T4.1** Signup page (`/signup`) — full name, email, password, confirm password; zod validation; calls `supabase.auth.signUp`.
  Dependencies: T1.6, Phase 2.
- [x] **T4.2** Login page (`/login`) — email, password; calls `supabase.auth.signInWithPassword`; honors `?redirect=`.
  Dependencies: T1.6, Phase 2.
- [x] **T4.3** Logout action (navbar + dashboard sidebar) — `supabase.auth.signOut()`, redirect to `/`.
  Dependencies: T4.2.
- [x] **T4.4** `middleware.ts` — session refresh + redirect unauthenticated users away from `/dashboard/*`.
  Dependencies: T4.1–T4.3.
- [x] **T4.5** Profile page (`/dashboard/profile`) — view/edit `full_name`, `avatar_url`.
  Dependencies: T4.4.
  Acceptance for phase: A user can sign up, get redirected appropriately, land in dashboard, log out, and be blocked from `/dashboard` while logged out.

---

## PHASE 5 — Event System

- [x] **T5.1** `EventForm` shared component (create + edit modes).
  Dependencies: Phase 2, Phase 4.
- [x] **T5.2** Create Event page (`/dashboard/create-event`) using `EventForm`, sets `organizer_id` server-side.
  Dependencies: T5.1.
- [x] **T5.3** Manage Events page (`/dashboard/manage-events`) — list own events, edit/delete actions.
  Dependencies: T5.1.
- [x] **T5.4** Edit Event page (`/dashboard/manage-events/[id]/edit`) — pre-filled `EventForm`, RLS-protected update.
  Dependencies: T5.1, T5.3.
- [x] **T5.5** Delete Event flow — confirm dialog, cascades registrations, RLS-protected.
  Dependencies: T5.3.
  Acceptance for phase: A user can create, edit, and delete only their own events; attempting to access another user's edit URL directly is rejected by RLS (verified, not assumed).

---

## PHASE 6 — Registration System

- [ ] **T6.1** `RegisterButton` component — register/cancel with correct state per viewer.
  Dependencies: T3.3, Phase 4.
- [ ] **T6.2** Duplicate-registration prevention verified against the unique constraint + upsert pattern.
  Dependencies: T6.1, T1.2.
- [ ] **T6.3** Capacity enforcement verified against the DB trigger (attempt to exceed `max_attendees`).
  Dependencies: T6.1, T1.1.
- [ ] **T6.4** Seat counter live-updates after register/cancel.
  Dependencies: T6.1.
  Acceptance for phase: Register/cancel/re-register cycle works correctly and cannot be forced past capacity or duplicated.

---

## PHASE 7 — Dashboard

- [ ] **T7.1** Dashboard overview (`/dashboard`) — stat cards (total registrations, upcoming, past, created events), quick actions, recent registrations.
  Dependencies: Phase 4, Phase 5, Phase 6.
- [ ] **T7.2** "My Events" page (`/dashboard/events`) — upcoming/past tabs, sourced from `registrations`.
  Dependencies: Phase 6.
- [ ] **T7.3** Dashboard navigation/sidebar (Overview, My Events, Create Event, Manage Events, Profile, Logout).
  Dependencies: Phase 2.
  Acceptance for phase: All dashboard numbers are computed from live queries and match manual verification against the database.

---

## PHASE 8 — Polish

- [ ] **T8.1** Responsive pass across all pages at 375px / 768px / 1280px.
- [ ] **T8.2** Accessibility pass (labels, focus states, alt text, contrast check on glass surfaces).
- [ ] **T8.3** Loading states (skeletons) on all data-fetching views.
- [ ] **T8.4** Empty states on all list views (events, my events, manage events, registrations).
- [ ] **T8.5** Error states on all data-fetching views (distinct from empty).
- [ ] **T8.6** Subtle animation pass (hover states, page transitions) — restrained, per Design.md "avoid excessive animation."
  Dependencies: Phases 3–7 complete.

---

## PHASE 9 — Deployment

- [ ] **T9.1** Confirm production Supabase project settings (Auth email confirmation on/off decision documented in Memory.md).
- [ ] **T9.2** Push repo to GitHub `main`.
- [ ] **T9.3** Import project into Vercel; set environment variables.
- [ ] **T9.4** Trigger production deploy; verify live URL loads Home and Events with real data.
  Dependencies: T9.1–T9.3.

---

## PHASE 10 — Final Validation

- [ ] **T10.1** `npm run build` passes with zero errors.
- [ ] **T10.2** `tsc --noEmit` (or `npm run build`'s type check) passes with zero errors.
- [ ] **T10.3** ONE comprehensive Playwright browser test covering the full demo flow (Home → Events → Event Details → Signup → Login → Dashboard → Register → My Events → Create Event → Manage Event → Edit Event → Logout).
  Dependencies: T10.1, T10.2, all prior phases.
- [ ] **T10.4** Fix any critical issues found by T10.3 only (do not re-run the full suite repeatedly — targeted re-checks only for what was fixed).
- [ ] **T10.5** Final commit "Final validation" and confirm production deployment reflects it.
