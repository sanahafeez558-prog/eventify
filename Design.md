# Design.md — Eventify Design System

**Direction:** Light + Premium + Modern + Glassmorphism. Calm, spacious, trustworthy — a SaaS product, not a poster. Every rule below exists to keep the UI restrained; when in doubt, remove an effect rather than add one.

---

## 1. Color Tokens

Define as CSS variables in `app/globals.css`, consumed via Tailwind theme extension.

```css
:root {
  /* Base surfaces */
  --background: 210 40% 98%;        /* off-white, very slight cool tint */
  --surface: 0 0% 100%;             /* pure white cards */
  --surface-muted: 210 30% 96%;     /* light gray sections */
  --border: 214 32% 91%;            /* soft border gray */

  /* Text */
  --foreground: 222 30% 14%;        /* near-black, not pure black */
  --muted-foreground: 215 16% 45%;

  /* Brand accents */
  --primary: 221 83% 63%;           /* soft blue */
  --primary-foreground: 0 0% 100%;
  --accent: 262 72% 68%;            /* soft purple */
  --accent-foreground: 0 0% 100%;

  /* Semantic */
  --success: 152 58% 45%;
  --warning: 38 92% 58%;
  --destructive: 0 72% 58%;

  /* Glass */
  --glass-bg: 0 0% 100% / 0.6;
  --glass-border: 0 0% 100% / 0.4;

  --radius: 1rem; /* 16px base radius */
}
```

- Gradients are used subtly and only in two places: the hero background wash and the primary CTA button — a soft `from-primary to-accent` at low opacity. Never gradient text on body copy.
- Never use pure black (`#000`) for text; use `--foreground`.

## 2. Typography

- **Headings:** `Geist` or `Outfit` (geometric, modern, free/open license) — weight 600–700.
- **Body:** `Inter` — weight 400–500.
- Load both via `next/font` (self-hosted, no external font request at runtime — keeps CSP simple and avoids FOUC).

| Token | Size | Weight | Use |
|---|---|---|---|
| `text-display` | 3rem–3.75rem (48–60px), responsive | 700 | Hero headline |
| `text-h1` | 2.25rem (36px) | 700 | Page titles |
| `text-h2` | 1.5rem (24px) | 600 | Section titles |
| `text-h3` | 1.25rem (20px) | 600 | Card titles |
| `text-body` | 1rem (16px) | 400 | Paragraphs |
| `text-small` | 0.875rem (14px) | 400 | Meta text, captions |
| `text-tiny` | 0.75rem (12px) | 500 | Badges, labels |

## 3. Spacing & Layout

- Spacing scale: Tailwind default (4px base unit), used consistently — avoid arbitrary pixel values.
- Page max width: `max-w-7xl`, horizontal padding `px-4 md:px-8`.
- Section vertical rhythm: `py-16 md:py-24` between major homepage sections.
- Card internal padding: `p-6`.

## 4. Border Radius

- `--radius-sm`: 0.5rem — inputs, badges.
- `--radius`: 1rem — buttons, cards.
- `--radius-lg`: 1.5rem — hero panels, modals, feature cards.
- Never sharp (0px) corners anywhere in this system.

## 5. Shadows

- `shadow-soft`: `0 2px 8px rgba(16, 24, 40, 0.06)` — default card resting state.
- `shadow-medium`: `0 8px 24px rgba(16, 24, 40, 0.10)` — hover/elevated card, modals.
- Never harsh/high-contrast drop shadows; always cool-gray tinted, low opacity.

## 6. Glass Effect Recipe

```css
.glass-panel {
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid hsl(var(--glass-border));
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
  border-radius: var(--radius-lg);
}
```

Use glass panels sparingly and intentionally: the hero visual, the navbar (subtle, on scroll), and feature highlight cards on the homepage. Do **not** apply glass to every card — regular content cards (event cards, dashboard stat cards) use plain white `--surface` with `shadow-soft`, not glass, so text stays crisp and legible. Blur radius never exceeds 16px.

## 7. Components

### Buttons
- **Primary:** solid `--primary` background, white text, `radius`, `shadow-soft`, subtle scale-up (1.02) + `shadow-medium` on hover, 150ms ease transition.
- **Secondary/Outline:** transparent background, `--border` outline, `--foreground` text.
- **Ghost:** no border/background, used for nav links and low-emphasis actions.
- **Destructive:** `--destructive` background, used only for Delete Event confirmation.
- Sizes: `sm` (h-9), `default` (h-10), `lg` (h-12, used for hero CTAs).

### Inputs
- Height `h-11`, `radius-sm`, 1px `--border`, focus ring `ring-2 ring-primary/40` + border color shift to `--primary`.
- Label always above the input, `text-small font-medium`.
- Error state: border `--destructive`, helper text below in `--destructive`, `text-tiny`.

### Cards
- Default: `--surface` background, `1px --border`, `radius-lg`, `shadow-soft`, hover → `shadow-medium` + `translate-y-[-2px]` (150ms).
- `EventCard` specifically: image (16:9, `radius-lg` top corners only), category badge overlapping the image bottom-left, title (`text-h3`), 2-line clamped description, date/location meta row with icons, organizer name + small avatar, footer row with registration-status badge and "View Event" button.

### Badges
- Category badge: soft-tinted background (12% opacity of the category's assigned accent color from a fixed small palette), `text-tiny font-medium`, `radius-sm`, `px-2.5 py-1`.
- Status badge (registration): `Open` (soft green), `Full` (soft red), `You're Registered` (soft blue, checkmark icon).

### Navbar
- Sticky top, `glass-panel` background once scrolled past 8px (plain transparent at the very top of the Home hero for a premium feel), height `h-16`.
- Logo left, nav links center/left-of-actions, `Login` (ghost) + `Get Started` (primary) right on desktop.
- Below `md`: hamburger → shadcn `Sheet` sliding from the right with stacked nav links.

### Footer
- `--surface-muted` background, 4-column layout (Brand blurb + logo, Explore links, Company links, Contact/social), bottom bar with copyright + "Built for BS IT Web Engineering" note.

### Dashboard
- Left sidebar (desktop, `w-64`, `--surface` background, `--border` right edge) with nav items (Overview, My Events, Create Event, Manage Events, Profile, Logout pinned at bottom). Collapses to a top horizontal scroll tab bar on mobile.
- Stat cards: 4-up grid on desktop, 2-up on tablet, 1-up on mobile; icon + big number (`text-h1`) + label (`text-small text-muted-foreground`).

### Modals
- shadcn `Dialog`, `radius-lg`, `shadow-medium`, max-width `max-w-md` for confirmations (e.g., Delete Event), `max-w-lg` for richer content.
- Always include a clear title, a short supporting sentence, and two actions (Cancel = outline, Confirm = primary or destructive).

### Toasts
- shadcn `sonner`, top-right on desktop, top-center on mobile, `radius`, `shadow-medium`, auto-dismiss 4s, manual dismiss always available.

### Empty States
- Centered icon (soft-tinted circular background), `text-h3` heading, one-line supporting `text-small text-muted-foreground`, and a relevant primary action (e.g., "No events match your filters" → "Clear Filters" button).

### Loading States
- Skeleton components matching the exact shape of the real content (image block + 3 text lines for `EventCard` skeletons), never a generic spinner for list content. A centered spinner is acceptable only for full-page/auth transitions.

## 8. Responsive Breakpoints

Tailwind defaults, used as-is: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.

- Event grid: 1 col (base) → 2 col (`sm`) → 3 col (`lg`).
- Dashboard: sidebar hidden below `lg`, replaced by top tabs.
- Navbar: hamburger below `md`.

## 9. Accessibility Rules

- Minimum 4.5:1 contrast for body text; verify text-over-glass panels specifically (glass panels may need a slightly higher background opacity behind text-heavy content).
- All interactive elements: visible `focus-visible` ring, never `outline: none` without a replacement.
- All images: descriptive `alt` text (event title as alt for event images).
- All icon-only buttons: `aria-label`.
- Form errors: linked to their input via `aria-describedby`, announced via `role="alert"` or `aria-live="polite"`.

## 10. Animation Rules

- Durations: 150ms (micro-interactions: hover, focus) to 250ms (panel/modal open) — never longer for UI chrome.
- Easing: `ease-out` for entrances, `ease-in` for exits.
- Page-level transitions: none required; keep navigation instant.
- Absolutely avoid: parallax scroll effects, looping background animations, auto-playing carousels, and any animation that fires on every scroll into view for content below the fold — a single fade-in on initial hero load is the ceiling.

## 11. Logo Concept

Simple geometric mark: a rounded-square "calendar" glyph (a square with a small notch/tab at the top like a torn calendar page) containing a small dot-and-line motif suggesting connected people (two small circles joined by a short line), rendered in the `--primary`→`--accent` gradient, paired with the "Eventify" wordmark in the heading font at weight 700.

```svg
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="5" width="28" height="24" rx="7" fill="url(#g)"/>
  <rect x="9" y="2" width="3" height="6" rx="1.5" fill="hsl(var(--accent))"/>
  <rect x="20" y="2" width="3" height="6" rx="1.5" fill="hsl(var(--accent))"/>
  <circle cx="12" cy="19" r="2.4" fill="white"/>
  <circle cx="20" cy="19" r="2.4" fill="white"/>
  <line x1="14.4" y1="19" x2="17.6" y2="19" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
  <defs>
    <linearGradient id="g" x1="2" y1="5" x2="30" y2="29" gradientUnits="userSpaceOnUse">
      <stop stop-color="hsl(221 83% 63%)"/>
      <stop offset="1" stop-color="hsl(262 72% 68%)"/>
    </linearGradient>
  </defs>
</svg>
```

Usage: this exact SVG (color inline, not token-dependent, since favicons/emails can't read CSS vars) for favicon and any static export; a token-driven inline version (using `currentColor`/CSS vars) for in-app navbar/footer/dashboard so it responds correctly if theming is ever extended. Wordmark always in `--foreground`, never inside the glyph itself.
