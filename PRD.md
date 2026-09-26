# PRD.md — Eventify Product Requirements Document

**Product:** Eventify — Event Management System
**Tagline:** Discover. Connect. Experience.
**Course context:** BS IT Web Engineering capstone/course project, built to a professional SaaS standard.
**Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres + Auth), GitHub, Vercel.

---

## 1. Product Overview

Eventify is a web-based Event Management System. It lets visitors discover events, lets registered users register/cancel registration for events, and lets any authenticated user become an organizer by creating and managing their own events. It is a single application with two blended roles (attendee, organizer) rather than separate apps — any signed-in user can both attend and organize events.

## 2. Problem Statement

University communities and small organizations run workshops, tech talks, and networking nights across scattered channels (WhatsApp groups, paper flyers, spreadsheets). There is no lightweight, self-serve place where:

- attendees can browse everything happening in one place, filtered by category/date/location;
- organizers can publish an event and track who's coming without building a spreadsheet by hand;
- registration status (registered / full / cancelled) is a single source of truth instead of a group chat thread.

Eventify solves this with one small, real, database-backed application.

## 3. Project Goals

1. Provide a real, working event discovery + registration flow backed by a live Postgres database (Supabase), not mock data.
2. Provide a self-serve event creation and management flow for any authenticated user.
3. Demonstrate correct use of authentication, authorization, and row-level security — not just UI enforcement.
4. Ship a visually polished, modern, responsive SaaS-style UI (light glassmorphism) suitable for a course demo and a portfolio.
5. Keep the implementation scoped and simple enough for a single student/small team to build and deploy within a course timeline.

## 4. Target Users

**Primary:**
- Students discovering campus/community events
- Event attendees (general public users of the platform)
- Event organizers (students, clubs, small orgs running workshops/talks/meetups)
- University communities
- Workshop participants
- Networking participants

**Design constraint:** the product must be usable by a first-time visitor with no onboarding/tutorial — navigation and actions must be self-explanatory.

## 5. User Personas

### Persona 1 — "Ayesha", the Attendee
- Undergraduate student, discovers events casually between classes on her phone.
- Wants: a fast way to see "what's happening this week", filter by category, register in one tap, and get a clear confirmation.
- Frustration: sign-up flows that ask for too much information before showing any value.

### Persona 2 — "Bilal", the Organizer
- Runs a university tech club, currently manages RSVPs in a spreadsheet.
- Wants: create an event in under two minutes, set a capacity limit, see who registered, edit details if the room changes.
- Frustration: tools that require him to be an "admin" of a whole separate system just to post one event.

### Persona 3 — "Admin/Reviewer" (implicit, course grading context)
- Needs to see that auth, RLS, CRUD, and registration logic actually work end-to-end against a real database, not a static mockup.

## 6. Core Features

- User registration (sign up)
- User login / logout
- User profile (view/edit own profile)
- Event discovery (browse/list)
- Event search (by title/description keyword)
- Event filtering (category, date, location)
- Event categories
- Event details page
- Event registration (register / cancel)
- Registration management (see own registrations)
- Event creation (any authenticated user)
- Event editing (owner only)
- Event deletion (owner only)
- Organizer management of their own events + attendee counts
- Dashboard (stats + quick actions)
- Contact form
- Fully responsive design (mobile / tablet / desktop)

## 7. Functional Requirements

### 7.1 Authentication
- FR-A1: Users can sign up with full name, email, password, confirm password.
- FR-A2: Users can log in with email + password.
- FR-A3: Users can log out from any authenticated page.
- FR-A4: A `profiles` row is automatically created for every new `auth.users` row (DB trigger, not client-side).
- FR-A5: Password fields must be masked with a show/hide toggle.
- FR-A6: Auth forms show inline validation errors and a loading state on submit, and surface Supabase auth errors (e.g. "Invalid login credentials") in a human-readable way.
- FR-A7: All `/dashboard/*` routes are protected; unauthenticated access redirects to `/login?redirect=<original-path>`.

### 7.2 Event Discovery
- FR-E1: `/events` lists all events with `status = 'published'`, newest/soonest first (default sort: soonest upcoming date).
- FR-E2: Users can search events by keyword (matches title and description).
- FR-E3: Users can filter by category, by date (upcoming/this week/this month/custom), and by location (text match).
- FR-E4: Users can sort by date, or by name (A–Z).
- FR-E5: The events list has distinct loading, empty ("No events match your filters"), and error states.
- FR-E6: Each event card shows image, category badge, title, short description, date, location, organizer name, and registration status (Open / Full / You're Registered).

### 7.3 Event Details
- FR-D1: `/events/[id]` shows full details: hero image, title, category, organizer, date, start/end time, location, full description, seats remaining out of max, and a register/cancel control.
- FR-D2: If the event is full and the viewer is not registered, the register control is disabled and shows "Event Full".
- FR-D3: If the viewer is already registered, the page shows "You're Registered" with a "Cancel Registration" action.
- FR-D4: Registering/cancelling updates the seat count optimistically and reconciles with the server response.

### 7.4 Registration
- FR-R1: A user can register for a published, non-full, future event exactly once. Duplicate registration is prevented at the database level (unique constraint on `event_id, user_id`), not only in the UI.
- FR-R2: A user can cancel their registration, freeing a seat.
- FR-R3: A user can re-register after cancelling.
- FR-R4: Registering for an event at capacity must fail server-side (DB trigger/check), even if two users attempt registration concurrently for the last seat.

### 7.5 Event Management (Organizer)
- FR-M1: Any authenticated user can create an event via `/dashboard/create-event` with: title, description, category, date, start time, end time, location, max attendees, image (URL or upload).
- FR-M2: The creator becomes `organizer_id` on the event automatically (never a client-supplied field).
- FR-M3: An organizer can edit only events where `organizer_id = auth.uid()`.
- FR-M4: An organizer can delete only their own events; deleting an event cascades to its registrations.
- FR-M5: An organizer can view the attendee list and count for their own events only.
- FR-M6: Ownership is enforced by RLS at the database layer, independent of any UI restriction.

### 7.6 Dashboard
- FR-B1: `/dashboard` shows: welcome message, total registrations, count of upcoming registered events, count of past attended events, count of events created, and quick action links.
- FR-B2: `/dashboard/events` (aka "My Events") lists the user's own registrations, split into upcoming/past.
- FR-B3: `/dashboard/manage-events` lists events the user organizes, with edit/delete/view-attendees actions.
- FR-B4: `/dashboard/profile` lets the user update full name and avatar.

### 7.7 Contact
- FR-C1: `/contact` submits name, email, subject, message into `contact_messages`. No auth required. Shows success/error feedback.

## 8. Non-Functional Requirements

- NFR-1 (Performance): Public pages should be server-rendered/streamed where practical; event list queries must use indexed columns.
- NFR-2 (Security): No secret key (Supabase service role key) may ever ship to the browser. All ownership rules enforced via RLS, not just conditional UI rendering.
- NFR-3 (Reliability): Every Supabase call must handle and surface errors distinctly from empty results.
- NFR-4 (Maintainability): Shared UI (cards, buttons, form fields) must be componentized once and reused, not copy-pasted per page.
- NFR-5 (Responsiveness): Every page must be usable at 375px, 768px, and 1280px+ widths without horizontal scroll or clipped content.
- NFR-6 (Accessibility): Interactive elements are keyboard-reachable, have visible focus states, and images have alt text.
- NFR-7 (Portability): The app must run from a clean clone with only `.env` values filled in and `npm install && npm run dev`.

## 9. User Journeys

**Attendee journey:** Home → browse Events → filter by category → open Event Details → prompted to sign up (if not logged in) → Sign Up → Login → redirected back to the event → Register → confirmation shown → visible under Dashboard → My Events.

**Organizer journey:** Login → Dashboard → Create Event → fill form → event published → visible on public Events page → Manage Events → view attendees → Edit Event → Delete Event (when event is over/cancelled).

## 10. Authentication Requirements
See §7.1. Additionally:
- Protected routes: `/dashboard`, `/dashboard/events`, `/dashboard/profile`, `/dashboard/create-event`, `/dashboard/manage-events`.
- Session must persist across page reloads (Supabase SSR cookie-based session).
- Middleware refreshes the session on every request to protected routes.

## 11. Event Management Requirements
See §7.5. Status field supports `draft | published | cancelled | completed`; MVP UI always creates as `published` (draft is schema-supported for future use, not required in the built UI).

## 12. Registration Requirements
See §7.4. Capacity enforcement is a hard requirement, not optional polish.

## 13. Dashboard Requirements
See §7.6. Numbers shown must be computed from real queries against Supabase, not hardcoded.

## 14. Security Requirements
- All tables have RLS enabled; no table is left with RLS disabled "temporarily."
- Anonymous (`anon`) key is the only Supabase key in frontend code/env.
- All forms validate input client-side (immediate feedback) and rely on DB constraints server-side (source of truth).
- Contact form is rate-limit-tolerant by design (simple insert, no PII beyond what's submitted).

## 15. Responsive Requirements
- Mobile-first layout; navbar collapses to a sheet/drawer menu below `md`.
- Event grid: 1 column (mobile) → 2 columns (`sm`/`md`) → 3 columns (`lg+`).
- Dashboard sidebar collapses to a top tab bar or drawer on mobile.

## 16. Accessibility Requirements
- Minimum text contrast ratio 4.5:1 for body text against its background (including glass surfaces).
- All form inputs have associated `<label>`s.
- Focus-visible outlines on all interactive elements.
- Toast/alert messages are announced via `aria-live="polite"`.

## 17. Deployment Requirements
- Source hosted on GitHub.
- Database/auth hosted on Supabase (hosted Postgres project).
- Frontend deployed on Vercel, connected to the GitHub repo for CI-less git-push deploys.
- Environment variables configured in Vercel project settings, mirroring `.env.example`.

## 18. Acceptance Criteria (per feature)

| Feature | Acceptance Criteria |
|---|---|
| Sign up | New user can register; a matching `profiles` row exists afterward; duplicate email is rejected with a readable error. |
| Login/Logout | Valid credentials log the user in and redirect to dashboard or original destination; logout clears session and redirects to home. |
| Event list | Events render from live Supabase data; search/filter/sort all change the rendered set; empty state shows when no matches. |
| Event details | Seats-remaining is accurate; register/cancel changes persist and reflect on reload. |
| Duplicate registration | Attempting to register twice for the same event does not create two rows and does not error the UI ungracefully. |
| Capacity limit | Registering when `confirmed count == max_attendees` is rejected with a clear message. |
| Create event | Submitting the form creates a row with `organizer_id = auth.uid()`; event appears on `/events`. |
| Edit/Delete event | Only the owning organizer can edit/delete; attempting via a crafted request as another user is rejected by RLS. |
| Dashboard stats | Counts match the underlying `registrations`/`events` rows for that user. |
| Contact form | Submission creates a row in `contact_messages`; user sees success confirmation. |
| Responsive | No horizontal scroll or overlapping elements at 375px/768px/1280px on every page. |

## 19. Out-of-Scope (for this course build)

- Payments / paid ticketing
- Email notifications (confirmation emails, reminders)
- Waitlists for full events
- Multi-organizer/team ownership of a single event
- Admin moderation UI (approving/rejecting events)
- Native mobile apps
- Real-time collaborative editing
- Internationalization / multi-language UI
- Calendar (.ics) export
- Social login providers (Google/GitHub OAuth) — email/password only for MVP
