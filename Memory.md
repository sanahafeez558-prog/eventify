# Memory.md — Eventify Persistent Project Memory

This file is the project's long-term memory. Antigravity must read it before starting any session and must update it whenever an important decision is made, a phase completes, or a constraint/issue is discovered. Do not delete history from this file — append.

---

## 1. Project Identity

- **Name:** Eventify
- **Tagline:** Discover. Connect. Experience.
- **Type:** Event Management System (BS IT Web Engineering course project, built to professional SaaS standard)
- **Stack:** Next.js (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui + Supabase (Postgres + Auth) + GitHub + Vercel + Playwright (final validation only)

## 2. Architecture Decisions (locked — do not change without strong reason, logged below)

- No custom backend server; Supabase is the entire backend (Postgres + Auth + RLS).
- No service-role key is used anywhere in the application. All authorization goes through RLS with `auth.uid()` checks.
- Two roles blended into one account type: any authenticated user can attend and organize. `profiles.role` exists (`attendee | organizer | admin`) but is not currently used to gate the *ability* to create events — every authenticated user can create events. `role` is reserved for the `admin` capability (viewing contact messages) and possible future use.
- No global client state library. Server Components + local `useState` only.
- Duplicate registration prevention uses a single persistent row per `(event_id, user_id)` pair with a `status` field (`confirmed`/`cancelled`), not row deletion. Cancelling = update to `cancelled`; re-registering = upsert back to `confirmed`.
- Event capacity enforcement lives in a Postgres trigger (`enforce_event_capacity`), not only in application code, so it holds under concurrent requests.

## 3. Technology Decisions

- Auth: Supabase email/password only for MVP (no OAuth providers).
- Forms: `react-hook-form` + `zod`.
- UI toasts: shadcn/ui `sonner`.
- Types: generated via `supabase gen types typescript` into `types/database.types.ts` — regenerate after every schema migration.

## 4. Database Decisions

- 5 tables: `profiles`, `categories`, `events`, `registrations`, `contact_messages`.
- `profiles` is auto-created via an `auth.users` insert trigger — never created manually by client code.
- `events.status` supports `draft/published/cancelled/completed`; the built UI only ever creates `published` events for this course scope. `draft` is schema-ready but not exposed in the UI.
- Categories are seeded via migration, not user-creatable in the UI (kept simple/scoped).

## 5. Design Decisions

- Visual direction: light, premium, modern, glassmorphism. No dark mode required for this scope.
- Base palette: off-white/white/light gray with soft blue + soft purple accents (see Design.md for exact tokens).
- Avoid: dark UI, neon, cyberpunk, heavy blur, excessive animation.

## 6. Authentication Decisions

- Protected route prefix: `/dashboard/*`.
- Redirect pattern on auth-required access: `/login?redirect=<original-path>`.
- Session handled via `@supabase/ssr` cookies, refreshed in `middleware.ts`.

## 7. Completed Work Log

_(Antigravity: append a dated entry here at the end of each completed phase.)_

- `[x]` Phase 0 — Connection & Foundation — completed 2026-09-26. Next.js 16 (App Router + Turbopack + Tailwind v4), Supabase project connected via MCP and .env.local, Git repository initialized and connected to GitHub (sanahafeez558-prog/eventify), shadcn/ui components (Button, Card, Badge, Toaster) and folder structure in place.
- `[x]` Phase 1 — Architecture & Database — completed 2026-09-26. All 5 tables created in Supabase (profiles, categories, events, registrations, contact_messages), triggers set up (updated_at, handle_new_user, enforce_event_capacity), RLS enabled with strict owner/public policies, 8 categories seeded, TypeScript types generated in types/database.types.ts, and verified live against Supabase.
- `[x]` Phase 2 — Design System — completed 2026-09-26. Design tokens and glassmorphism utilities implemented in globals.css, responsive Navbar with auth session listener and mobile menu, 4-column Footer, EventCard with seat availability and category badges, EventCardSkeleton, EmptyState, and shadcn primitives (Button, Input, Textarea, Select, Avatar, Dialog, Tabs, Toaster).
- `[x]` Phase 3 — Public Pages — completed 2026-09-26. Home page (/), Events discovery page (/events) with keyword search, category pills, and sort order, Event detail page (/events/[id]) with live registrations join and RegisterButton, Categories directory (/categories), About page (/about), and Contact page (/contact) with zod validation and Supabase inserts.
- `[x]` Phase 4 — Authentication — completed 2026-09-26. Signup (/signup) with Zod validation and auto-login, Login (/login) supporting ?redirect=, Logout action in navbar and sidebar, middleware session refresh and route protection for /dashboard/*, Dashboard layout and sidebar, Dashboard Overview (/dashboard) with stat cards and upcoming RSVPs, and Profile edit (/dashboard/profile).
- `[x]` Phase 5 — Event System — completed 2026-09-26. Event validation schema with Zod 4, reusable EventForm with live preview card and Unsplash presets, /dashboard/create-event, /dashboard/manage-events with search, status filters, attendee capacity meter, and delete confirmation dialog, /dashboard/manage-events/[id]/edit with strict organizer RLS verification, AttendeeRosterDialog with attendee profile avatars, and live verified RLS security checks against cross-user edits/deletions.
- `[x]` Phase 6 — Registration System — completed 2026-09-26. Capacity trigger enforce_event_capacity upgraded to SECURITY DEFINER and user_id exclusion, duplicate-prevention upsert verified, overflow rejected with EVENT_FULL error, soft-cancel verified, live seat counter verified.
- `[x]` Phase 7 — Dashboard — completed 2026-09-26. /dashboard overview with live stat cards and recent registrations, /dashboard/events (My Registrations) with upcoming/past/cancelled tabs, search filter, cancel RSVP confirmation modal, and re-registration support.
- `[x]` Phase 8 — Polish — completed 2026-09-26. Responsive layout pass, accessibility aria-attributes, loading skeletons (/events/loading.tsx and /dashboard/loading.tsx), EmptyState components across all lists, global error boundary (/error.tsx), 404 page (/not-found.tsx), and 6 showcase events seeded across categories.
- `[x]` Phase 9 — Deployment — completed 2026-09-26. Auto-confirm auth trigger configured (0005_auto_confirm_auth.sql) to prevent email rate limits, GitHub remote synced on main branch, Vercel CI/CD building Next.js 16 app with Turbopack.
- `[x]` Phase 10 — Final Validation — completed 2026-09-26. 100% test pass on the single comprehensive 12-step Playwright browser test (Home -> Events -> Detail -> Signup -> Login -> Dashboard -> Register -> My Events -> Create Event -> Manage Events -> Edit Event -> Logout). Next.js 16 production build verified with zero errors across all 15 routes.

## 8. Current Status

All 10 phases (Phase 0 through Phase 10) are 100% complete, fully verified against live Supabase PostgreSQL, tested via Playwright end-to-end browser automation, and pushed to GitHub main branch for continuous deployment on Vercel.

## 9. Important Constraints

- Do not repeatedly run full Playwright E2E suites during development (see Rules.md Critical Testing Rule) — one comprehensive pass at the end, targeted re-checks only if needed.
- Do not expose the Supabase service-role key anywhere, ever.
- Do not build UI ahead of the corresponding database/RLS layer (database-first rule).
- Do not ask the user for approval between phases; proceed autonomously and only pause for genuinely blocking issues (missing credentials, ambiguous requirement with no reasonable default).

## 10. Known Issues

_(none yet — log here as discovered, with date and resolution status)_

## 11. Decisions Not to Change Without Explicit Reason

1. Table/column names as defined in Architecture.md §5.2 (renaming requires updating types, RLS, and every query site).
2. The `(event_id, user_id)` unique-constraint + soft-cancel registration pattern.
3. The two-tier authorization model (RLS as source of truth, UI as convenience).
4. The five required top-level planning documents remaining in sync with actual implementation — if an implementation detail diverges from a plan file, update the plan file in the same commit.
