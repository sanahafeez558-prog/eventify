# ANTIGRAVITY_PROMPT.md — Final Prompt for Antigravity

Copy everything below this line and give it directly to Antigravity as your instruction.

---

You are the senior coding agent responsible for building Eventify Event Management System. Before writing application code, inspect the workspace and read all project instruction files.

The project's instruction files are, in order of authority: PRD.md, Architecture.md, Design.md, Task.md, Memory.md, Rules.md, Agent.md. Read all of them before doing anything else. They contain the product requirements, technical architecture (including the full database schema and RLS policies), visual design system, phased task list, project memory, engineering rules, and your operating manual, respectively. Follow them exactly; do not invent scope, structure, or visual style that conflicts with them.

Work through the following steps, in order, without stopping for approval between steps. Only stop if you hit a genuinely blocking issue that requires a human (e.g., missing Supabase/GitHub credentials that you cannot obtain yourself) — otherwise, continue automatically to completion.

**STEP 1 — Inspect workspace.** Determine what already exists (Git, GitHub remote, Supabase connection, Next.js project, `.env` files, source code) before creating or changing anything. Never destroy an existing, working project.

**STEP 2 — Verify GitHub connection.** Preserve it if present; establish it if missing and you have the capability, otherwise document the gap in Memory.md.

**STEP 3 — Verify Supabase connection.** Preserve an existing project; otherwise flag that a Supabase project URL/keys are required before proceeding.

**STEP 4 — Configure environment variables.** Ensure `.env.example` documents `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no values committed); ensure `.env.local` has real values locally.

**STEP 5 — Create/verify Next.js architecture.** Establish the folder structure exactly as defined in Architecture.md §2, using TypeScript, App Router, Tailwind, and shadcn/ui.

**STEP 6 — Create database schema.** Run the schema migration from Architecture.md §5.2 (profiles, categories, events, registrations, contact_messages, constraints, indexes, triggers) against the connected Supabase project.

**STEP 7 — Configure RLS.** Apply the row-level security policies from Architecture.md §5.4 to every table. Verify anonymous/authenticated access behaves as specified before moving on.

**STEP 8 — Configure Supabase Auth.** Email/password provider, the `handle_new_user` profile-creation trigger, and session handling via `@supabase/ssr` and `middleware.ts`.

**STEP 9 — Build design system.** Tailwind theme tokens, typography, base shadcn components, Navbar, Footer, per Design.md, before building full pages.

**STEP 10 — Build public pages.** Home, Events, Event Details, Categories, About, Contact — wired to real Supabase data from the start, per PRD.md and Architecture.md's database-first rule.

**STEP 11 — Build authentication.** Signup, Login, Logout, protected `/dashboard/*` routes, Profile page.

**STEP 12 — Build event system.** Create Event, Edit Event, Delete Event, ownership enforced by RLS (not only the UI).

**STEP 13 — Build registration system.** Register, Cancel, re-register, duplicate-registration prevention, capacity enforcement, seat-count display.

**STEP 14 — Build dashboard.** Overview stats, My Events, Manage Events, dashboard navigation — all figures computed from live queries.

**STEP 15 — Build event management.** Organizer views of their own events, attendee lists/counts, edit/delete restricted to owners.

**STEP 16 — Responsive/accessibility polish.** Pass over every page at 375px/768px/1280px+, add loading/empty/error states, verify focus states and alt text.

**STEP 17 — Build/type validation.** Run `npm run build` and a full TypeScript check; fix all errors.

**STEP 18 — ONE comprehensive final browser test.** Use Playwright exactly once at this point to validate the full demo flow: Home → Events → Event Details → Signup → Login → Dashboard → Register for Event → My Events → Create Event → Manage Event → Edit Event → Logout.

**STEP 19 — Fix critical issues.** Address only what STEP 18 surfaced; re-check narrowly, not with another full suite run.

**STEP 20 — Finalize for GitHub/Vercel.** Confirm commits are organized by milestone, push to GitHub `main`, and confirm the project is ready for Vercel import with documented environment variables.

**Explicit constraints, non-negotiable:**
- Do not repeatedly run Playwright E2E tests during development. Use lightweight validation (build/type checks, code review) between features, and reserve Playwright for the single comprehensive pass at STEP 18 (a narrow, targeted Playwright check is acceptable only if a specific browser-only issue genuinely cannot be diagnosed any other way).
- Do not wait for user approval after every phase or step.
- Continue automatically through all 20 steps unless a genuinely blocking issue requires human input (e.g., missing credentials).
- Never expose Supabase service-role keys or GitHub tokens in source, commits, or logs.
- Enforce all ownership and capacity rules at the database/RLS level, not only in the UI.
- Update Task.md and Memory.md as you complete each phase.
