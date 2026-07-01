# designerplan.md — Redesigning **Find Your Hostel** (web)

> **What this is.** A senior designer + front‑end lead's end‑to‑end plan to redesign
> `apps/web` (and align `apps/admin`) onto the **Wonderlist warm cream‑and‑terracotta
> design system** in [`designer.md`](./designer.md), composed via the five app‑level
> [`page-templates.md`](./page-templates.md). It maps the current app, defines the token
> foundation, the component library, the app‑shell architecture, a per‑route redesign spec,
> and a phased rollout with a definition of done.
>
> **Scope:** web only (`apps/web`, Next.js App Router + Tailwind v4). No business logic
> changes — this is a **presentation‑layer** redesign. All data still flows through
> `@findyourhostel/shared` hooks (see [CLAUDE.md §3, §6](./CLAUDE.md)). Per **CLAUDE.md §7.1**
> nothing is committed; per **§7.2** each shipped slice updates CLAUDE.md.

---

## 0. TL;DR

Move Find Your Hostel from a **generic blue, shell‑less, per‑page‑header** app to a **warm,
editorial, single‑accent product with a real app shell**: fixed sidebar + sticky navbar + one
reusable **`PageHeader`** on every screen, a **`FilterTabs`** segmented control, soft **Panel**
surfaces, pill buttons, and full light/dark theming via CSS variables. Every existing route is
re‑expressed as one of five templates (**List · Detail · Wizard · Dashboard · Settings**). We
build the foundation once (tokens → primitives → shell), then roll it out surface‑by‑surface
(public → student → owner → admin) so the whole product reads as one system.

---

## 1. Current state audit

### 1.1 What exists today
- **Stack (already ideal):** Next 15 App Router, React 19, **Tailwind v4** (`@tailwindcss/postcss`),
  `@radix-ui/react-slot` + `react-label`, `class-variance-authority`, `clsx`, `tailwind-merge`,
  `lucide-react`. This is exactly what `designer.md` assumes — **no dependency changes needed**.
- **Routes (28 pages)** across groups `(auth)`, `(student)`, `(owner)`, plus ungrouped public
  routes (`/`, `/hostels/[id]`, `/community`, `/messages`, `/notifications`, `/profile`).
- **UI primitives:** `ui/button` (blue `brand-600`, `rounded-md`), `ui/input`, `ui/card`,
  `ui/field`, `ui/label`, `ui/textarea`. Feature components: search cards/filters/map, booking
  badges + payment forms, owner wizard, reviews, notifications bell, etc.
- **Theme:** `globals.css` defines a **blue `brand-50…900`** ramp via `@theme`, `color-scheme:
  light` only, `body` hard‑set to `bg-neutral-50 text-neutral-900`.

### 1.2 Gaps vs. the target system (the redesign backlog)
| Gap | Today | Target (`designer.md`) |
|---|---|---|
| **Accent** | Blue `brand-*` ramp | Single **terracotta** `#D97757`, one accent only |
| **Surfaces** | White cards on neutral‑50, hard borders | **Cream cards lighter than beige page**, soft big‑blur shadows |
| **App shell** | ❌ none — every page is standalone, ad‑hoc inline nav (`HomeNav`, per‑page title rows) | Fixed **sidebar** + sticky **navbar** + reusable **`PageHeader`** |
| **Page header** | Bespoke per page (e.g. search re‑declares the logo + toolbar) | One `PageHeader` (title + subtitle + toolbar `children`, collapsible, FAB) |
| **Tabs / filters** | Inline buttons, bordered segmented boxes | `FilterTabs` segmented pill control with count badges |
| **Radius / shape** | `rounded-md` / `rounded-lg` | **High‑radius**: `rounded-2xl` cards, `rounded-[24px]` panels, `rounded-full` buttons |
| **Semantic tokens** | Utilities reference `brand-*` / `neutral-*` directly | Token utilities only: `bg-card`, `text-foreground-muted`, `border-border`, `text-primary` |
| **Dark mode** | ❌ light only | Full light/dark via variable swap |
| **Empty / loading** | Ad‑hoc text; a `SmokeTest` still on the home page | First‑class `EmptyState` + `Skeleton` |
| **Type scale** | Mixed (`text-3xl` hero, `text-lg`) | Fixed scale (`text-2xl` page title, `text-sm` body default) |

---

## 2. Design principles for this redesign

1. **Thin apps, fat shared core (unchanged).** This is presentation only — components call the
   same shared hooks. If it's not rendering, it does **not** move here.
2. **One accent, warmer/rounder/softer.** Terracotta is the only brand color. Success/warning/
   error are functional. Never a second brand hue.
3. **Token‑only color.** No component ever hard‑codes hex or `brand-*`/`neutral-*`. Only
   semantic token utilities → dark mode "just works."
4. **Reuse the `PageHeader` + `FilterTabs` pair on every screen.** Consistency beats novelty.
5. **Every screen is one of five templates.** Extend List/Detail before inventing structure.
6. **States are first‑class.** Every list/detail ships loading (skeleton) + empty designs.
7. **Accessible by default.** Radix primitives, visible focus rings (`ring-primary/…`), roles
   on switches/tabs, `aria-current` on nav, respect `prefers-reduced-motion`.

---

## 3. Foundation — the token layer (Phase D0)

Rewrite `apps/web/src/app/globals.css` to the token system. Keep the Tailwind v4 wiring; replace
the blue ramp.

### 3.1 `globals.css` structure
```css
@import "tailwindcss";
@source "../**/*.{ts,tsx}";

:root {
  /* Light (default) — see designer.md §2.1 */
  --background:#F4ECDF; --background-secondary:#EFE4D2; --background-tertiary:#E6D7BF;
  --card:#FBF6EC;
  --foreground:#1F1A17; --foreground-secondary:#4A4039; --foreground-muted:#8A7E72;
  --primary:#D97757; --primary-hover:#C45C3E; --primary-foreground:#FFFFFF;
  --secondary:#E8D8C0; --border:#DCCFB9; --border-secondary:#E6D7BF;
  --success:#2E7D32; --warning:#ED6C02; --error:#D32F2F; --ring:#D97757;
  color-scheme: light;
}
html[data-theme="dark"], html.dark {
  /* Dark — designer.md §2.2 (warm browns, not gray) */
  --background:#1A1411; --background-secondary:#221A15; --background-tertiary:#2A201A;
  --card:#261D17;
  --foreground:#F5EDDD; --foreground-secondary:#D8CBB8; --foreground-muted:#8C8071;
  --primary:#E0A078; --primary-hover:#EAB48F; --primary-foreground:#1A1411;
  --secondary:#3A2C22; --border:#3B2E25; --border-secondary:#332720;
  --ring:#E0A078; color-scheme: dark;
}

@theme inline {
  --color-background: var(--background);
  --color-background-secondary: var(--background-secondary);
  --color-background-tertiary: var(--background-tertiary);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-foreground-secondary: var(--foreground-secondary);
  --color-foreground-muted: var(--foreground-muted);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-border: var(--border);
  --color-border-secondary: var(--border-secondary);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-error: var(--error);
  --color-ring: var(--ring);
  --font-sans: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

@keyframes sidebar-tip-in { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:translateX(0)} }

body { @apply bg-background text-foreground font-sans antialiased; }
/* slim 6px scrollbar w/ --border thumb; @media (prefers-reduced-motion) → kill transitions */
```

- **Source of truth note:** CLAUDE.md says `packages/shared/src/theme/colors.ts` mirrors the web
  tokens (for mobile parity). Update `colors.ts` to the terracotta palette in the **same** slice
  so web + future mobile agree. `globals.css` stays the CSS authority; `colors.ts` the JS authority.
- **Typography:** system humanist stack (no web‑font file → no FOUT). Body defaults `text-sm`;
  headings `font-semibold`. Type scale per `designer.md §3`.
- **Radius / shadow / motion:** adopt `designer.md §4` verbatim — `rounded-2xl` cards,
  `rounded-[24px]` panels, `rounded-full` buttons/badges; signature panel shadow
  `shadow-[0_22px_70px_-58px_rgba(31,26,23,0.55)]`; transitions `duration-200`.
- **Theme toggle:** a `ThemeProvider` (reads `localStorage` + `prefers-color-scheme`, sets
  `html[data-theme]`) mounted in `providers`, with a toggle in the sidebar user block. Add an
  inline no‑flash script in `layout.tsx` `<head>` to set the attribute before paint.

**Migration aid:** add a small legacy compat layer in `globals.css` (as `designer.md §2.2` notes)
mapping leftover `brand-*` usages during the transition, then delete once all routes are migrated.

---

## 4. Component library (Phase D1)

Build/upgrade a shared web UI kit under `apps/web/src/components/ui`. Each is token‑driven and
matches `designer.md`. Legend: 🆕 new · ♻️ rewrite existing · ✅ keep, minor token pass.

### 4.1 Primitives
| Component | State | Spec (from `designer.md`) |
|---|---|---|
| `Button` | ♻️ | Pill `rounded-full`, `text-sm font-semibold`. Variants: **primary** (`bg-primary … hover:bg-primary-hover`), **secondary** (`border-border bg-card`), **destructive** (de‑emphasized: reddens on hover), **ghost**, **icon** (`h-9 w-9 rounded-full`). Sizes sm/md/lg. §9 |
| `Input` / search input | ♻️ | `h-12 rounded-2xl border border-border bg-card`, `focus:border-primary focus:ring-4 focus:ring-primary/10`. Search variant w/ leading icon + clear button. §10 |
| `Textarea` | ♻️ | Same border/focus recipe, `rounded-2xl`. |
| `Label` / `Field` | ✅ | `text-sm font-medium text-foreground-secondary`, inline error `text-error`, error banner recipe. §10 |
| `Select` | 🆕 | Radix Select styled as input; `z-20` content, token colors. |
| `Toggle`/`Switch` | 🆕 | **Flex track** (knob can't escape), `role="switch"` + `aria-checked`. §10 |
| `Badge` / `StatusPill` | 🆕 | Tinted token bg (`bg-primary/10 text-primary`, `bg-warning/10 text-warning`…). Unify the 6 existing status badges (Booking/Payment/Hostel/Request/Offer/Promotion) onto one primitive + a status→tone map (reuse `bookingStatusTone` etc. already in shared `utils/bookings.ts`). |
| `Card` / `Panel` | ♻️ | Panel = `rounded-[24px] border border-border bg-card` + soft shadow. `Panel.Section` = bordered header + padded body. §8 |
| `Avatar` | 🆕 | `rounded-full`, initials fallback (Radix Avatar). |
| `Skeleton` | 🆕 | `animate-pulse bg-background-secondary rounded-2xl`; skeleton card variants for list/detail. |
| `EmptyState` | 🆕 | Icon chip + title + one‑liner + optional CTA, centered in a Panel. |
| `Dialog` / `ConfirmDialog` | 🆕 | Radix Dialog (`z-50`), for destructive confirms (cancel booking, delete hostel, reject). |
| `Tooltip` | 🆕 | Radix Tooltip, pop shadow `§4`. |
| `Toast` | ✅ | Wire shared `toast` adapter to `react-hot-toast` styled to tokens (already a dep target). |

### 4.2 Shell + composition components (the spine)
| Component | Spec |
|---|---|
| `AppShell` 🆕 | Root frame: `min-h-screen bg-background`, renders `Sidebar` + `Navbar` + main column with `lg:pl-[248px]`/`[76px]` transition. |
| `Sidebar` 🆕 | Fixed left rail `w-62`↔`w-[76px]`, collapse persisted in `localStorage`; logo + workspace label, nav items (icon chip + label + count badge, `aria-current`), user block + theme toggle + sign out; collapsed dot badges + portal hover flyout. §11 |
| `Navbar` 🆕 | `sticky top-0 z-30 h-16 border-b bg-background/90 backdrop-blur`; workspace label + page title, `NotificationBell`, mobile menu button. |
| **`PageHeader`** 🆕 | **The centerpiece.** `sticky top-16 z-[25]`, full‑bleed via `-mx/px`, title `text-2xl` + subtitle, `children` toolbar slot, `collapsibleTitle` (fold w/ hysteresis 120/24), action → **FAB** when folded (rendered outside the blur), back arrow = `router.back()` + `backFallbackHref`. §6 |
| **`FilterTabs`** 🆕 | Segmented pill track; active = raised `bg-card` + soft shadow + `text-primary`; count badges inside segments; `min-w-0` to share a row with search. §7 |
| `StatCard` 🆕 | Metric card: eyebrow label + big value + icon/trend; grid band; clickable → filtered list. |
| `MobileSidebar` 🆕 | Off‑canvas drawer `z-50` + backdrop `z-40` for `< lg`. |
| `NotificationBell` ✅ | Re‑token; move into `Navbar`. |

> **Note on `apps/admin`:** it already runs the Radix + `cva` + `cn()` trio and a partial shell.
> After the web kit stabilizes, port the token layer + `PageHeader`/`FilterTabs`/`Panel` so admin
> and web read identically. Admin is **Phase D5** (last), since M13 is still in progress.

---

## 5. App‑shell architecture — route groups & layouts (Phase D2)

Today there are **no group layouts** (only `(auth)/layout.tsx`). Introduce per‑surface shells so
each role gets the right nav without threading props.

```
app/
├─ layout.tsx                     # RootLayout: <Providers> + ThemeProvider + no‑flash script (keep thin)
├─ (marketing)/                   # 🆕 public, shell‑less: landing + hostel browse
│  ├─ layout.tsx                  #   slim public top‑nav (logo + auth CTAs / role links), footer
│  ├─ page.tsx                    #   redesigned landing (hero, search CTA, RecommendedRow) — drop SmokeTest
│  ├─ search/                     #   (moved) public search — List template, own filter shell
│  └─ hostels/[id]/(+/book)/      #   (moved) hostel detail + booking — Detail / Wizard
├─ (auth)/layout.tsx              # ♻️ centered card on beige, terracotta logo, dark‑aware
├─ (student)/
│  ├─ layout.tsx                  # 🆕 AppShell w/ STUDENT sidebar nav (Home, Search, Bookings,
│  │                             #     Requests, Saved, Messages, Community, Notifications, Profile)
│  ├─ bookings/…  requests/…  saved/…
├─ (owner)/
│  ├─ layout.tsx                  # 🆕 AppShell w/ OWNER sidebar nav (Dashboard, My Hostels,
│  │                             #     Bookings, Requests/Offers, Promotions, Messages, Profile)
│  └─ owner/…
└─ (shared surfaces)              # messages, notifications, community, profile:
   render inside the acting role's shell (student/owner) — see §5.1
```

### 5.1 Decisions
- **Marketing vs. app split.** `/`, `/search`, `/hostels/[id]` are **public** (anonymous
  browsing per M3) → a light **marketing shell** (no sidebar), not the app shell. Booking/detail
  actions still deep‑link into auth when needed.
- **Shared surfaces (messages/notifications/community/profile)** are used by both roles. Rather
  than duplicate, they live under a neutral group that renders the **acting role's** sidebar
  (student vs owner) chosen from `authStore.user.role`. Implement as a single `AppShell` that
  takes a `nav` config; the group layout picks the config by role.
- **Sidebar nav config** is data (array of `{label, href, icon, badgeKey}`), one per role, with
  live count badges fed by existing hooks (`useUnreadCount`, owner pending offers, etc.).
- **Admin** keeps its own app (`apps/admin`) and its own shell — aligned in D5, not merged.

---

## 6. Template mapping — every route → a template

Per `page-templates.md`, each screen is one of five templates. This is the redesign contract.

| Route | Template | Header title / subtitle | Toolbar (`children`) | Notes |
|---|---|---|---|---|
| `/` (marketing) | **Dashboard**‑lite / hero | "Find a hostel seat near you" | search CTA | Drop `SmokeTest`; hero + `RecommendedRow` + how‑it‑works. |
| `/search` | **List** | "Search hostels" / "Find a seat near your institution" | `FilterTabs` (category) + search + filter button; list/map toggle | Filters sidebar → collapses into a filter sheet on mobile; map view retained. |
| `/hostels/[id]` | **Detail** | hostel name / status + area | back arrow; primary CTA "Book a seat" | Hero gallery, seat‑type panels w/ price breakdown, amenities, map, reviews, save/report. |
| `/hostels/[id]/book` | **Wizard** (or focused Detail) | "Confirm booking" (centered) | step/summary | Seat snapshot + price breakdown + method + terms; single submit guard. |
| `/bookings` | **List** | "My bookings" / "Track your seats" | `FilterTabs` by status | Cards → detail; status pill badges. |
| `/bookings/[id]` | **Detail** | booking ref / status | back; primary = pay/cancel | Payment timeline panel + `PaymentForm`; review panel for active/completed. |
| `/requests` | **List** | "My requests" / "Owners send you offers" | `FilterTabs` by status | Live offer‑count badge on cards. |
| `/requests/new` | **Wizard** | "Post a request" (centered) | stepper | Area/institution → budget → seat/date → notes. |
| `/requests/[id]` | **Detail** | request / status | back; "Start a new request" (clone) | Offers list w/ accept/decline; confirm dialog on accept. |
| `/saved` | **List** | "Saved hostels" / "Your shortlist" | (optional sort) | Grid of `HostelResultCard`; empty state. |
| `/messages` | **List** | "Messages" | search conversations; pin filter | Conversation rows w/ unread badges. |
| `/messages/[id]` | **Detail** (chat) | partner name / context | back; block/unblock | Realtime thread + composer; sticky composer footer. |
| `/community` | **List** | "Community" / "Ask & answer" | `FilterTabs` by topic + "Ask" CTA→FAB | Post cards w/ like/reply counts. |
| `/community/[id]` | **Detail** | post title | back | Post + replies + composer (anon option). |
| `/notifications` | **List** | "Notifications" | "Mark all read" action; unread tab | Realtime rows; enable‑push banner. |
| `/profile` | **Settings** | "Profile" / "Manage your account" | — | Sections in Panels; save/cancel row; sign out. |
| **Owner** `/owner` | **Dashboard** | greeting + "Create hostel" CTA | — | KPI band, pending‑action spotlight, my‑hostels list, quick tiles. |
| `/owner/hostels/new` · `[id]/edit` | **Wizard** | "Create/Edit hostel" (centered) | 5‑step stepper | Existing `HostelWizard` re‑skinned; edit‑lock context banner. |
| `/owner/bookings` | **List** | "Bookings" | `FilterTabs` by status | Confirm/reject/move‑in + `OwnerPaymentReview`. |
| `/owner/requests` | **List** | "Open requests" | `FilterTabs` | Inline `SubmitOfferForm`; withdraw. |
| `/owner/promotions` | **List** + create | "Promotions" / "Feature your listings" | "Promote" CTA | Plan picker + proof upload; promo cards w/ views/clicks. |
| `/owner/onboarding` | **Wizard** | "Owner verification" (centered) | 2‑step | Doc upload + status states. |
| **Auth** signup/login/forgot/reset | focused **card** | — | — | Centered on beige; terracotta accents; dark‑aware. |

---

## 7. Rollout plan (phases & sequencing)

Each phase ends with `turbo run type-check lint build` clean (CLAUDE.md gate) and a CLAUDE.md
build‑log entry. Ship **surface‑by‑surface** so the app is never half‑broken.

| Phase | Name | Deliverables | Exit criteria |
|---|---|---|---|
| **D0** | **Token foundation** | Rewrite `globals.css` (light+dark tokens, `@theme inline`, font, radius/shadow, keyframes); update `shared/theme/colors.ts`; `ThemeProvider` + no‑flash script; legacy compat shim. | Build clean; existing pages still render (via compat shim); dark toggle flips. |
| **D1** | **Component kit** | Rewrite `Button`/`Input`/`Textarea`/`Card→Panel`; add `Badge`/`StatusPill`, `Select`, `Toggle`, `Skeleton`, `EmptyState`, `Dialog`, `Avatar`, `Tooltip`; unify 6 status badges. | Kit renders in isolation; primitives token‑only; a11y roles present. |
| **D2** | **App shell** | `AppShell`, `Sidebar` (collapse+persist+flyout), `Navbar`, **`PageHeader`**, **`FilterTabs`**, `StatCard`, `MobileSidebar`; group layouts `(student)`/`(owner)`/`(marketing)`; role nav configs w/ live badges. | Shell wraps a pilot page; z‑index table honored; responsive drawer works. |
| **D3** | **Student + public surfaces** | Redesign `/`, `/search`, `/hostels/[id]`(+`/book`), `/bookings`(+`[id]`), `/requests`(+`new`,`[id]`), `/saved`, `/messages`(+`[id]`), `/community`(+`[id]`), `/notifications`, `/profile` onto templates. Skeleton + empty states each. | Every student/public route on a template; no `brand-*`/`neutral-*` left; states designed. |
| **D4** | **Owner surface** | Redesign `/owner` (Dashboard), `/owner/hostels/*` (Wizard reskin), `/owner/bookings`, `/owner/requests`, `/owner/promotions`, `/owner/onboarding`; auth screens. | Owner + auth on templates; edit‑lock banners; wizard hysteresis‑free. |
| **D5** | **Admin alignment + cleanup** | Port token layer + `PageHeader`/`FilterTabs`/`Panel` to `apps/admin`; remove legacy compat shim, delete `SmokeTest`, purge dead `brand-*` tokens; visual QA pass. | Admin matches; zero legacy tokens; Lighthouse a11y ≥ 95; dark mode audited. |

**Suggested order rationale:** foundation → kit → shell must precede any page work (templates
depend on them). Student/public first (highest traffic, anonymous funnel), owner next, admin last
(M13 still in progress, so align once its pages settle).

---

## 8. Cross‑cutting standards

- **Responsive:** mobile‑first. Sidebar → off‑canvas drawer `< lg`; `PageHeader` toolbar stacks
  (`flex-col gap-3 lg:flex-row`); filter sidebars → bottom‑sheet on mobile; content
  `max-w-[1440px]` with responsive padding (`px-4 sm:px-6 lg:px-8`).
- **Dark mode:** every screen verified in both themes (token‑only rule makes this free; audit for
  any leftover raw colors, images, and map tiles).
- **Accessibility:** visible focus rings everywhere (`focus:ring-4 ring-primary/10`); `aria-current`
  on active nav; `role="switch"`/`role="tablist"`; confirm dialogs trap focus (Radix); color is
  never the only status signal (pill has text); target sizes ≥ 44px on mobile; honor
  `prefers-reduced-motion`.
- **Performance:** system font (no FOUT); keep map + heavy views `dynamic(ssr:false)` as today;
  skeletons over spinners; avoid layout shift in `PageHeader` fold (hysteresis dead‑band).
- **Z‑index discipline:** memorize `designer.md §5.1` — drawer/modal `z-50`, backdrop `z-40`,
  navbar/sidebar/FAB `z-30`, **`PageHeader` `z-[25]`**, in‑content pickers `z-20`, content `z-0`.
- **Consistency guardrails (lint‑enforceable later):** no hard‑coded hex/`brand-*`/`neutral-*` in
  components; every page uses exactly one `PageHeader`; tabs use `FilterTabs`; buttons are pills.

---

## 9. Definition of done (redesign)

- [ ] `globals.css` on the terracotta token system (light+dark); `colors.ts` mirrors it.
- [ ] `ThemeProvider` + no‑flash script; sidebar theme toggle works; no theme flash on load.
- [ ] Component kit complete (§4), token‑only, a11y roles present; 6 status badges unified.
- [ ] `AppShell` + `Sidebar` (collapse/persist/flyout) + `Navbar` + `PageHeader` + `FilterTabs`.
- [ ] Group layouts `(marketing)`/`(student)`/`(owner)`; shared surfaces render the acting role's shell.
- [ ] **Every route** matches its assigned template (§6) with title + one‑line subtitle.
- [ ] Every list/detail ships **skeleton + empty** states; destructive actions behind confirms.
- [ ] Zero `brand-*`/`neutral-*`/hard‑coded hex in `apps/web` components; `SmokeTest` removed.
- [ ] `apps/admin` aligned to the same tokens + `PageHeader`/`FilterTabs`/`Panel`.
- [ ] `turbo run type-check lint build` clean; Lighthouse a11y ≥ 95; dark mode audited per screen.
- [ ] CLAUDE.md updated per phase (§7.2); nothing committed (§7.1) — left in the working tree.

---

## 10. Appendix — quick reference (paste‑ready)

**Panel:** `rounded-[24px] border border-border bg-card shadow-[0_22px_70px_-58px_rgba(31,26,23,0.55)]`
**Primary button:** `rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover`
**Search input:** `h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10`
**PageHeader shell:** `sticky top-16 z-[25] -mx-4 -mt-6 mb-4 border-b border-border bg-background/95 px-4 pb-4 pt-6 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8`
**Active tab segment:** `rounded-xl bg-card px-4 py-2.5 text-sm font-semibold text-primary shadow-[0_1px_8px_rgba(28,28,28,0.08)]`
**Status pill (tinted):** `rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning`
**Page recipe:** `<div className="space-y-6 pb-8"><PageHeader …><FilterTabs …/></PageHeader>…</div>`

> **North star:** *warmer, rounder, softer, one accent* — and the **`PageHeader` + `FilterTabs`**
> pair on every screen so Find Your Hostel reads as one coherent, premium product.
