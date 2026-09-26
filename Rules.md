# Rules.md — Rules for the Antigravity Coding Agent

These rules govern every session of work on Eventify. They are not suggestions.

## General

1. Read PRD.md, Architecture.md, Task.md, Memory.md, Design.md, Agent.md, and this file before writing any code in a new session.
2. Follow Architecture.md for structure, schema, and data flow decisions.
3. Follow Design.md for every visual/UI decision — do not invent a different visual style.
4. Follow PRD.md for scope — do not add features listed in PRD.md §19 Out-of-Scope.
5. Follow Task.md's phase order — do not build Phase 5 (Event System) before Phase 1 (Database) is real and verified.
6. Follow this file (Rules.md) for engineering discipline.
7. Follow Agent.md for operating procedure and session behavior.
8. Do not rewrite working code without a concrete reason (a bug, a requirement change, or a Task.md item that requires it). No stylistic rewrites of code that already meets Design.md/Architecture.md.
9. Do not introduce a new dependency unless it is required to meet a stated requirement and is not already achievable with the existing stack (Next.js, React, Tailwind, shadcn/ui, Supabase JS, react-hook-form, zod).
10. Do not over-engineer: no premature abstraction, no generic "plugin systems," no speculative configurability beyond what PRD.md asks for.

## Supabase

11. Use real Supabase functionality for every feature once Supabase is connected — never fake/mock database behavior, hardcoded arrays standing in for tables, or `setTimeout`-simulated network calls.
12. Row Level Security must be enabled on every table, with no exceptions and no "temporarily disabled for testing" states left in migrations.
13. Protect user-owned data: every mutating policy must check `auth.uid()` against the row's real owner column.
14. Never expose the Supabase service-role key in any client code, any committed file, or any environment variable prefixed `NEXT_PUBLIC_`.
15. Use environment variables for all Supabase configuration; never hardcode a project URL or key as a string literal in source.

## UI

16. Maintain design consistency: reuse `components/ui/*` and the shared feature components (`EventCard`, `EventForm`, etc.) rather than writing page-local variants.
17. Keep every page mobile responsive at the breakpoints defined in Design.md §8 before marking a Task.md item done.
18. Use reusable components: if a UI block is needed on a second page, extract it before duplicating markup.
19. Avoid duplicated UI code — if two components are 80%+ identical, unify them with props instead of maintaining two copies.

## Security

20. Validate all inputs client-side (immediate UX feedback via zod) and never trust client-side validation as the security boundary — the database constraint/RLS policy is the boundary.
21. Protect every `/dashboard/*` route via middleware; never rely solely on hiding a nav link.
22. Enforce authorization (ownership, capacity) at the database/RLS level; UI-level hiding of a button is convenience only, not a control.
23. Prevent duplicate registrations via the schema-level unique constraint, not just a client-side check before insert.

## Critical Testing Rule

**DO NOT REPEATEDLY RUN PLAYWRIGHT E2E TESTS.**

Antigravity must **not** perform this loop during normal development:

```
write code → Playwright → change code → Playwright → change code → Playwright → ...
```

Instead, the correct loop is:

```
implement → inspect → fix compile/type/runtime issues → continue implementation
→ complete major functionality → build/type check → ONE comprehensive browser test
→ fix critical issues found → finalize
```

During development, use lightweight validation wherever possible: TypeScript compiler checks, `npm run build`, reading the code, manual reasoning about RLS policies against the SQL, and if genuinely necessary, a single manual check of a specific page — not a scripted browser test.

Playwright is reserved primarily for the **one** final comprehensive validation pass covering the full demo flow (see Task.md T10.3). If, and only if, a critical browser-specific issue cannot reasonably be diagnosed any other way during development, a single **targeted** Playwright test of that specific issue is permitted — but repeated full end-to-end test runs during normal feature-building are prohibited.

## Documentation Discipline

24. Update Task.md checkboxes as items complete.
25. Update Memory.md whenever an architectural decision is made, changed, or a constraint/issue is discovered — do not let Memory.md go stale relative to the real codebase.
26. If an implementation detail must diverge from Architecture.md or Design.md, update that file in the same commit as the code change, with a one-line rationale.
