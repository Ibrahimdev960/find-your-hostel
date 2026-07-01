# Wonderlist — Web Design System (`designer.md`)

> Scope: **web app only** (`apps/web`, Next.js App Router + Tailwind CSS v4).
> Audience: a designer who is also a front‑end developer. Everything below is
> written so you can **replicate the exact look & feel on another site**. Class
> names are Tailwind v4 utilities; raw CSS is given where it matters.

---

## 0. TL;DR — the design in one paragraph

Warm, editorial, **cream‑and‑terracotta** travel product. Calm beige backgrounds,
soft off‑white cards with very subtle large‑radius shadows, a single warm
**terracotta accent** (`#D97757`) for everything interactive. Generous rounded
corners (`16–24px`), a humanist sans (Avenir Next), and a strict **app shell**:
fixed left sidebar + sticky top navbar + a **reusable sticky page header** that
carries the page title, a one‑line subtitle, and a toolbar (tabs / search /
actions). The page header **folds away on scroll** to keep just the toolbar
pinned. Full light/dark theming via CSS variables.

---

## 1. Brand & tone

- **Personality:** warm, premium, trustworthy, unhurried. Think "boutique travel
  agency," not "SaaS dashboard."
- **Accent discipline:** exactly **one** accent color (terracotta). Success /
  warning / error are functional only. Never introduce a second brand color.
- **Surface logic:** the page background is the *darkest* warm tone; **cards are
  lighter than the page** (cream on beige) — the opposite of typical dark‑card
  UIs. This is what gives the "paper" feel.

---

## 2. Color system

All colors are **CSS variables** on `:root` and re‑exposed to Tailwind v4 via
`@theme inline` (so `bg-background`, `text-foreground`, `border-border`, etc.
work as utilities). Dark mode swaps the same variables under
`html[data-theme="dark"]` / `html.dark`.

### 2.1 Light theme (default)

| Token | Hex | Use |
|---|---|---|
| `--background` | `#F4ECDF` | App background (the page) |
| `--background-secondary` | `#EFE4D2` | Insets, hover fills, segmented‑control track |
| `--background-tertiary` | `#E6D7BF` | Deeper insets |
| `--card` | `#FBF6EC` | **Cards / panels / inputs** (lighter than bg) |
| `--foreground` | `#1F1A17` | Primary text |
| `--foreground-secondary` | `#4A4039` | Labels, secondary text |
| `--foreground-muted` | `#8A7E72` | Hints, placeholders, icons |
| `--primary` | `#D97757` | **Accent** — buttons, active states, links, focus |
| `--primary-foreground` | `#FFFFFF` | Text/icons on primary |
| `--secondary` | `#E8D8C0` | Soft chips |
| `--border` | `#DCCFB9` | Default hairline border |
| `--border-secondary` | `#E6D7BF` | Softer dividers |
| `--success` | `#2E7D32` | Confirmed / positive |
| `--warning` | `#ED6C02` | Pending / attention |
| `--error` | `#D32F2F` | Destructive / errors |
| `--ring` | `#D97757` | Focus ring (= primary) |

### 2.2 Dark theme

Same variable names, swapped values (warm dark browns, **not** neutral gray):

| Token | Hex |
|---|---|
| `--background` | `#1A1411` |
| `--background-secondary` | `#221A15` |
| `--card` | `#261D17` |
| `--foreground` | `#F5EDDD` |
| `--foreground-muted` | `#8C8071` |
| `--primary` | `#E0A078` (lighter terracotta so it pops on dark) |
| `--primary-foreground` | `#1A1411` |
| `--border` | `#3B2E25` |

> **Rule:** never hard‑code hex in components. Always use the token utilities
> (`bg-card`, `text-foreground-muted`, `border-border`, `text-primary`, …) so
> dark mode "just works." (A legacy compatibility layer in `globals.css` even
> rewrites old hard‑coded `#C45C3E`/`#F8F7F4`/… classes back onto the tokens.)

### 2.3 Tailwind wiring (Tailwind v4)

```css
/* globals.css */
@import "tailwindcss";
@source "../**/*.{ts,tsx,js,jsx}";

:root { --background:#F4ECDF; --card:#FBF6EC; --primary:#D97757; /* …all tokens… */ }

@theme inline {
  --color-background: var(--background);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-foreground-muted: var(--foreground-muted);
  --color-border: var(--border);
  /* …one --color-* per token… */
  --font-sans: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

html[data-theme="dark"], html.dark { --background:#1A1411; --card:#261D17; /* … */ }
```

---

## 3. Typography

- **Family:** `--font-sans: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial,
  sans-serif`. Applied once on `<body className="font-sans antialiased">`. No
  web‑font file is loaded — it's a **system humanist stack** (fast, no FOUT).
- **Weights used:** 400 (body), 500 (`font-medium`), 600 (`font-semibold`,
  default for headings/labels), 700 (`font-bold`), occasionally 800/900 for
  numbers/eyebrows.

### Type scale (Tailwind utility → size / line-height → where)

| Utility | Size | Usage |
|---|---|---|
| `text-2xl` | 24px | **Page title** (`h1` in the reusable `PageHeader`) |
| `text-xl` | 20px | Card / section heading occasionally |
| `text-lg` | 18px | `ProfileSection` titles, stat values |
| `text-base` | 16px | Subtitle / descriptions under the title |
| `text-sm` | 14px | **Body default**, buttons, inputs, nav items |
| `text-xs` | 12px | Meta, helper text, badges, table labels |
| `text-[11px]` | 11px | Count badges, micro‑labels |

**Eyebrow / overline pattern** (uppercase mini‑label above values):

```html
<p class="text-xs font-bold uppercase tracking-[0.14em] text-foreground-muted">Pending</p>
```

Tracking: tight on big headings (`tracking-[-0.03em]`), **wide** on uppercase
eyebrows (`tracking-[0.12em]`–`[0.2em]`).

---

## 4. Spacing, radius, shadow, motion (the "feel" primitives)

### Radius scale (this is a high‑radius design)
| Token | px | Use |
|---|---|---|
| `rounded-lg` | 8px | Icon chips, small controls |
| `rounded-xl` | 12px | Inputs, nav items, secondary buttons |
| `rounded-2xl` | 16px | **Cards**, search inputs, segmented track |
| `rounded-[24px]` | 24px | **Panels / sections** (the big surfaces) |
| `rounded-full` | ∞ | Primary/secondary buttons, badges, avatars, FAB |

### Spacing rhythm
- Page sections stack with `space-y-6` / `space-y-7` / `space-y-8`.
- Toolbars and button rows use `gap-2` / `gap-3`.
- Card padding: `p-4` (compact) → `p-5` / `p-6` (standard) → `px-5 py-5 sm:px-6` (sections).

### Shadows (very soft, large, low‑opacity — never harsh)
```text
Panel:        shadow-[0_22px_70px_-58px_rgba(31,26,23,0.55)]
Tooltip/pop:  shadow-[0_18px_44px_-20px_rgba(0,0,0,0.55)]
FAB:          shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5)]
Active tab:   shadow-[0_1px_8px_rgba(28,28,28,0.08)]
```
The signature is **big blur + big negative spread** → a soft "lift," not a drop shadow.

### Motion
- Default transition: `transition` / `transition-colors` at **`duration-200`**.
- Custom entrance keyframe (sidebar tooltip):
```css
@keyframes sidebar-tip-in {
  from { opacity:0; transform:translateX(-4px); }
  to   { opacity:1; transform:translateX(0); }
}
/* usage: animate-[sidebar-tip-in_140ms_ease-out] */
```
- Scrollbar is slimmed to 6px using `--border` thumb.

---

## 5. App shell (the global frame)

Three fixed/sticky regions wrap every dashboard page.

```
┌───────────────────────────────────────────────────────────┐
│  Sidebar (fixed, left)   │   Navbar (sticky, top)          │  ← z-30
│  w-62 (248px) / 76px      ├─────────────────────────────────┤
│  collapsible rail         │   PageHeader (sticky top-16)    │  ← z-[25]
│                           │   ───────────────────────────── │
│  • logo + workspace       │   [content max-w-[1440px]]      │
│  • nav items + badges     │                                 │
│  • user + sign out        │                                 │
└───────────────────────────────────────────────────────────┘
```

- **Root:** `min-h-screen bg-background text-foreground`.
- **Sidebar wrapper (desktop):** `hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block`.
- **Main column:** `lg:pl-[248px]` (expanded) / `lg:pl-[76px]` (collapsed),
  with `transition-[padding] duration-200`.
- **Navbar:** `sticky top-0 z-30 h-16 border-b border-border bg-background/90 backdrop-blur`.
  Shows a 2‑line identity: small uppercase **workspace label** + page title.
- **Content container:** `mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8`.

### 5.1 Z‑index system (memorize this — it prevents 90% of stacking bugs)

| Layer | z |
|---|---|
| Mobile sidebar drawer | `z-50` |
| Modals / dialogs / off‑canvas sheets | `z-50` |
| Mobile overlay backdrop | `z-40` |
| Navbar + desktop sidebar | `z-30` |
| FAB (floating action button) | `z-30` |
| **Sticky `PageHeader`** | **`z-[25]`** |
| In‑content dropdowns / pickers | `z-20` |
| Page content | `z-0` |

> Header sits **above content/pickers** but **below** the top chrome. A picker
> dropdown that must not cover the header lives in a `relative z-20` wrapper so
> its inner `z-30` stays trapped under `z-[25]`.

---

## 6. The reusable **Page Header** (the spine of every screen)

Single component (`components/ui/PageHeader.tsx`) used on **every** tab/page so
the second header is identical everywhere. Props: `title`, `subtitle`,
`actionLabel` + `actionHref`/`onAction`, `backHref` / `useBackNavigation` /
`backFallbackHref`, `centerTitle`, `collapsibleTitle`, `actionIcon`, and a
`children` slot for the toolbar.

**Container (sticky, full‑bleed, blurred):**
```html
<div class="sticky top-16 z-[25] -mx-4 -mt-6 mb-4 border-b border-border
            bg-background/95 px-4 pb-4 pt-6 backdrop-blur
            sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
  <div class="flex items-start justify-between">
    <div><h1 class="text-2xl font-bold text-foreground">Title</h1>
         <p class="mt-1 text-muted-foreground">One-line subtitle.</p></div>
    <a class="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Action</a>
  </div>
  <!-- children: the toolbar (tabs / search / filters) -->
  <div class="mt-3"> … </div>
</div>
```

Key mechanics:
- **`top-16`** = navbar height (64px) → header pins right under the navbar.
- **`-mx-* + px-*`** = the header background **bleeds to the content edges**
  while the inner content stays in the padded column. The matching
  **`-mt-6/-mt-8`** cancels the container's top padding so it tucks under the navbar.
- **Tighter spacing when it carries a toolbar:** `mb-3 pb-3 pt-5 lg:pt-6`
  (vs `mb-4 pb-4 pt-6 lg:pt-8` for a plain header).

### 6.1 Collapsible title (fold‑on‑scroll) + FAB

When `collapsibleTitle` is set, the **title+subtitle fold away on scroll** and
only the toolbar stays pinned. If the header also has an action, that action
**morphs into a floating action button** while folded.

- Fold: wrap the title row in `overflow-hidden transition-all duration-200`,
  toggling `max-h-0 opacity-0` ↔ `max-h-40 opacity-100`.
- **Hysteresis (critical):** collapse only past `scrollY > 120`, expand only
  under `scrollY < 24`. The dead‑band (wider than the title height) stops the
  reflow‑induced flicker that a single threshold causes:
  ```ts
  setCollapsed(prev => (prev ? scrollY >= 24 : scrollY > 120));
  ```
- **FAB** is rendered **outside** the blurred container (a `backdrop-filter`
  ancestor traps `position: fixed`), and scales in:
  ```html
  <a class="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center
            rounded-full bg-primary text-primary-foreground shadow-[0_14px_34px_-10px_rgba(0,0,0,.5)]
            transition-all duration-200
            scale-100 opacity-100  /* hidden state: pointer-events-none scale-0 opacity-0 */">
    <PlusIcon class="h-6 w-6" />
  </a>
  ```

### 6.2 Back navigation
Back arrow uses **history back** (`router.back()`) so the previous page's
**scroll position is restored**, with `backFallbackHref` for deep‑links. (Never
use a plain `<Link>` for "back" — it jumps to the top.)

---

## 7. Tabs — `FilterTabs` (segmented control)

The one tab style across the app: a pill **track** holding pill **segments**.

```html
<div class="w-full overflow-x-auto pb-1">           <!-- pass min-w-0 to share a row -->
  <div class="inline-flex min-w-max gap-1 rounded-2xl border border-border
              bg-background-secondary/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
    <!-- active -->
    <button class="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold
                   bg-card text-primary shadow-[0_1px_8px_rgba(28,28,28,0.08)]">
      All <span class="inline-flex h-5 min-w-5 items-center justify-center rounded-full
                       bg-primary/10 px-1.5 text-[11px] font-bold text-primary">43</span>
    </button>
    <!-- inactive -->
    <button class="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground-muted
                   hover:bg-card/60 hover:text-foreground-secondary">Unread</button>
  </div>
</div>
```
- Active segment = **raised card** (`bg-card` + soft shadow + primary text).
- Counts ride inside the segment as a soft pill badge.
- It lives in the `PageHeader` children slot; give it `min-w-0` so a search box
  can share the row and the tabs scroll instead of pushing the search out.

---

## 8. Surfaces — cards, panels, sections

**Panel** (the base surface):
```html
<section class="flex flex-col rounded-[24px] border border-border bg-card
                shadow-[0_22px_70px_-58px_rgba(31,26,23,0.55)]"> … </section>
```

**ProfileSection / form section** = Panel with a bordered header + padded body:
```html
<Panel>
  <div class="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row
              sm:items-start sm:justify-between sm:px-6">
    <div><h2 class="text-lg font-semibold text-foreground">Security</h2>
         <p class="mt-1 text-sm leading-6 text-foreground-muted">Description.</p></div>
  </div>
  <div class="flex-1 px-5 py-5 sm:px-6"> …fields… </div>
</Panel>
```

**List card** (e.g. a package/booking tile): `rounded-2xl border border-border
bg-card` + `overflow-hidden` for media, `hover:-translate-y-0.5 hover:shadow-md
transition`. Status pills use tinted token backgrounds (`bg-primary/10
text-primary`, `bg-warning/10 text-warning`, …).

---

## 9. Buttons

| Variant | Classes |
|---|---|
| **Primary** | `rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover` |
| **Secondary / Cancel** | `rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground-secondary transition hover:bg-background-secondary` |
| **Destructive** | `rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700` |
| **De‑emphasized destructive** | neutral button that only reddens on hover: `border border-border bg-card text-foreground-secondary hover:border-red-200 hover:bg-red-50 hover:text-red-600` |
| **Icon button** | `inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground-secondary hover:bg-background-secondary` |
| **Filter/secondary toolbar btn** | `h-12 rounded-2xl border border-border bg-card px-4 … hover:border-primary/40 hover:text-foreground` with an optional count badge |

Conventions: buttons are **pill‑shaped** (`rounded-full`), `text-sm
font-semibold`, height ~36–48px (`py-2.5` or `h-9/h-11/h-12`), disabled =
`disabled:opacity-60 disabled:cursor-not-allowed`. Button rows align right:
`flex flex-col gap-3 sm:flex-row sm:justify-end`. **Destructive actions are
visually de‑emphasized** (don't give "Delete/Clear" the loudest styling).

---

## 10. Forms & inputs

Search / standard input (the "attractive search" recipe — note `border` width
**and** color, contrasting `bg-card`, and a soft ring):
```html
<div class="relative">
  <SearchIcon class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
  <input placeholder="Search…"
    class="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-10 text-sm
           text-foreground outline-none transition placeholder:text-foreground-muted
           focus:border-primary focus:ring-4 focus:ring-primary/10" />
  <!-- clear button: absolute right-2, circular, hover:bg-background-secondary -->
</div>
```

Labeled field (`ProfileFormField`) + profile input:
```html
<div>
  <label class="mb-2 block text-sm font-medium text-foreground-secondary">New email address</label>
  <input class="w-full rounded-2xl border border-[#D4D0C8] bg-white px-4 py-3 text-sm
                outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
  <p class="mt-2 text-xs text-error">Inline error…</p>   <!-- or text-foreground-muted helper -->
</div>
```
Error banner: `rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600`.

> ⚠️ Gotcha: the shared `Input` component switches to an **`unstyled`** variant
> the moment you pass a `className`. If you pass a className, you must supply the
> **complete** style (including `border` *width*, not just `border-border`).

**Toggle / switch** — flex track so the knob can never escape (don't use
absolute‑positioned translate knobs):
```html
<button role="switch" aria-checked="true"
  class="flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors
         justify-end bg-primary">          <!-- off: justify-start bg-border -->
  <span class="h-5 w-5 rounded-full bg-white shadow-sm"></span>
</button>
```

---

## 11. Sidebar (collapsible rail)

- **Expanded:** `w-62` (248px) — logo + workspace label, nav items (icon chip +
  label + unread count badge), user block + "Sign Out".
- **Collapsed:** `w-[76px]` icons‑only rail (`transition-[width] duration-200`),
  toggled by a circular chevron button straddling the right edge
  (`absolute -right-3 top-7 h-6 w-6 rounded-full border bg-card`). **Persisted in
  `localStorage`**; main column padding animates to match.
- Nav item:
  ```html
  <a class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
            text-foreground-muted hover:bg-card hover:text-foreground
            [aria-current]:border [aria-current]:bg-card [aria-current]:text-foreground">
    <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground-muted
                 group-[active]:bg-primary group-[active]:text-primary-foreground"><Icon/></span>
    <span class="truncate">Label</span>
    <span class="ml-auto … rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">3</span>
  </a>
  ```
- **Collapsed badges** become a dot on the icon (`absolute -right-0.5 -top-0.5
  h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background-secondary`).
- **Hover flyout label** (collapsed): rendered via a **portal to `document.body`**
  with `position: fixed` at the icon's rect (so the nav's scroll‑overflow can't
  clip it), with a little diamond arrow and the `sidebar-tip-in` animation.

---

## 12. Page composition — how to build any list screen

Every tab page follows the same recipe (this is the "template"):

```tsx
<div className="space-y-6 pb-8">
  <PageHeader
    title="Orders"
    subtitle="Track and manage your confirmed bookings."
    actionLabel="Create"          // optional → primary button / FAB when folded
    actionHref="/…"
    collapsibleTitle               // fold title on scroll, keep toolbar pinned
  >
    {/* toolbar in the children slot: tabs left, search/filter right */}
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <FilterTabs … className="min-w-0" />
      <div className="flex w-full gap-2 lg:max-w-md"> {/* search + filter button */} </div>
    </div>
  </PageHeader>

  {/* optional stat-card band */}
  <section className="grid gap-3 md:grid-cols-4"> {/* metric cards */} </section>

  {/* the list / grid / empty / loading state */}
</div>
```

Rules of thumb:
- **Title + one‑line subtitle** on every page (never a bare title).
- **Tabs + search/filter live inside the header** (`children`), not as separate
  scrolling bars — so they pin together and never mis‑offset.
- **Counts go in tab badges**, not separate stat cards (drop redundant stat tiles).
- **Stat bands** (Pending / Active value / …) sit *below* the header when they add
  info the tabs don't.
- Empty & loading states are first‑class (skeleton cards / `EmptyState`).

---

## 13. Replication checklist (port this look to a new site)

1. Drop in the **CSS variables** (light + dark) and wire them through
   `@theme inline` (or your framework's token system). One accent only.
2. Set the **system humanist font stack**; default body `text-sm`, headings
   `font-semibold`.
3. Adopt the **radius + soft‑shadow** primitives (`rounded-2xl`/`[24px]`,
   `shadow-[0_22px_70px_-58px_…]`).
4. Build the **shell**: fixed sidebar (`z-30`) + sticky navbar (`z-30`, `h-16`) +
   content container (`max-w-[1440px]`, responsive padding).
5. Build the **reusable PageHeader** (`sticky top-16 z-[25]`, full‑bleed via
   `-mx/px`, title `text-2xl` + subtitle, `children` toolbar, collapsible w/
   hysteresis, FAB outside the blur).
6. Build **FilterTabs** (segmented pill control, active = raised card).
7. Standardize **buttons** (pill, `text-sm font-semibold`), **inputs** (bordered
   `bg-card`, primary focus ring), **Panels/sections**.
8. Enforce the **z‑index table** and the **token‑only color rule** everywhere.

> When in doubt: warmer, rounder, softer, one accent — and **reuse the
> `PageHeader` + `FilterTabs` pair on every screen** so the whole product reads
> as one system.
```
