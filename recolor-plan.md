# Recolor Plan — Indigo on Cool White (`recolor-plan.md`)

> **Role:** Senior product designer + design-systems engineer.
> **Goal:** Replace the whole app's **warm cream & terracotta** palette with a fresh, modern,
> industry-best **light** scheme — **Indigo accent on a cool white/slate neutral** — across
> `apps/web`, `apps/admin`, and the shared JS token authority (mobile-ready). Keep it **consistent,
> appealing, and accessible** (WCAG AA), with a matching dark mode.
>
> **The enabling fact:** the D0–D5 redesign already put every surface on **semantic CSS-variable
> tokens** (`--background`, `--card`, `--primary`, …). So recoloring is mostly a **value swap in a
> few token files**, not a per-component rewrite. This plan also fixes the handful of places that
> **bypass tokens** with hard-coded color, so nothing is left warm.
>
> **Scope:** color only — no layout, copy, or component-structure changes. Plan only; nothing
> implemented here. No git commits (§7.1). Document as we build (§7.2).

---

## 1. The palette (chosen: Indigo on cool white)

One vivid accent (**indigo**) on a **cool slate** neutral ramp with a pure-white card surface —
the modern SaaS look (Linear/Stripe family): trustworthy, premium, high-contrast, friendly enough
for a student marketplace. Functional colors move to the standard, cool-compatible Tailwind
600-scale.

### 1.1 Light theme (default)

| Token | New value | Role / notes |
|---|---|---|
| `--background` | `#F8FAFC` | page — cool slate-50 (was warm cream) |
| `--background-secondary` | `#F1F5F9` | subtle raised/hover fills — slate-100 |
| `--background-tertiary` | `#E2E8F0` | deepest neutral fill — slate-200 |
| `--card` | `#FFFFFF` | cards/panels — pure white (the "paper") |
| `--foreground` | `#0F172A` | primary text — slate-900 |
| `--foreground-secondary` | `#334155` | secondary text — slate-700 |
| `--foreground-muted` | `#64748B` | muted/labels — slate-500 |
| `--primary` | `#4F46E5` | **accent — indigo-600** |
| `--primary-hover` | `#4338CA` | indigo-700 |
| `--primary-foreground` | `#FFFFFF` | text/icon on primary |
| `--secondary` | `#EEF2FF` | soft indigo tint surface — indigo-50 |
| `--border` | `#E2E8F0` | hairline borders — slate-200 |
| `--border-secondary` | `#EEF2F6` | faint dividers — slate-100-ish |
| `--success` | `#16A34A` | green-600 |
| `--warning` | `#D97706` | amber-600 |
| `--error` | `#DC2626` | red-600 |
| `--ring` | `#4F46E5` | focus ring = accent |

### 1.2 Dark theme

Cool slate dark. The accent **lightens** (indigo-400) with **dark text on it** — same
light-accent/dark-text pattern the current dark theme already uses — to guarantee button contrast.

| Token | New value | Role / notes |
|---|---|---|
| `--background` | `#0F172A` | page — slate-900 |
| `--background-secondary` | `#172033` | raised fills |
| `--background-tertiary` | `#334155` | slate-700 |
| `--card` | `#1E293B` | cards — slate-800 (lifts off the page) |
| `--foreground` | `#F1F5F9` | slate-100 |
| `--foreground-secondary` | `#CBD5E1` | slate-300 |
| `--foreground-muted` | `#94A3B8` | slate-400 |
| `--primary` | `#818CF8` | **indigo-400** (reads on dark) |
| `--primary-hover` | `#A5B4FC` | indigo-300 |
| `--primary-foreground` | `#0F172A` | dark text on the light accent |
| `--secondary` | `#24284B` | muted indigo tint surface |
| `--border` | `#263143` | subtle on slate-900 |
| `--border-secondary` | `#1B2536` | fainter dividers |
| `--success` | `#4ADE80` | green-400 |
| `--warning` | `#FBBF24` | amber-400 |
| `--error` | `#F87171` | red-400 |
| `--ring` | `#818CF8` | indigo-400 |

### 1.3 Legacy `brand-*` ramp (admin shim only)

`apps/admin` still uses a `brand-*` ramp (web dropped it in D5). Repoint it from terracotta to an
**indigo ramp** so existing admin pages instantly read on-brand:

```
--color-brand-50:  #EEF2FF   --color-brand-500: #6366F1
--color-brand-100: #E0E7FF   --color-brand-600: #4F46E5
--color-brand-200: #C7D2FE   --color-brand-700: #4338CA
--color-brand-300: #A5B4FC   --color-brand-800: #3730A3
--color-brand-400: #818CF8   --color-brand-900: #312E81
```

### 1.4 Contrast (WCAG AA — verified targets)

- Body text `#0F172A` on `#F8FAFC`/`#FFFFFF` → ~16:1 (AAA).
- Muted `#64748B` on `#FFFFFF` → ~4.8:1 (AA for normal text). ✅
- White on `--primary` `#4F46E5` → ~7.0:1 (AAA) — the primary button is very legible.
- Dark mode: `#0F172A` text on `--primary` `#818CF8` → ~6.5:1 (AA+). `#F1F5F9` on `#0F172A` → ~15:1.
- Focus ring uses the accent at `ring-primary/20` — visible in both themes.

---

## 2. Where color lives (the change surface)

Because of the token architecture, **~4 files carry 95% of the change**; the rest is a short list
of token-bypass fixes found by audit.

### 2.1 Token authorities (the core swap)

| File | What changes |
|---|---|
| `apps/web/src/app/globals.css` | `:root` (light) + `html[data-theme='dark']` blocks → new values (§1.1/§1.2). `@theme inline` mapping is unchanged. |
| `apps/admin/src/app/globals.css` | same `:root`/dark blocks **+** repoint the `brand-*` ramp (§1.3). |
| `packages/shared/src/theme/colors.ts` | JS authority (mobile/NativeWind) — mirror the new light+dark maps + the functional aliases. |
| `apps/web/src/app/layout.tsx` | `viewport.themeColor` hexes: light `#F4ECDF → #F8FAFC`, dark `#1A1411 → #0F172A`. |

### 2.2 Token-bypass fixes (hard-coded color to retune)

Found by audit — these don't read from tokens, so they must change by hand or they'll stay warm:

| File(s) | Current | Fix |
|---|---|---|
| `components/ui/panel.tsx`, `layout/FilterTabs.tsx`, `(student)/search/page.tsx`, `marketing/Hero.tsx` | warm shadow `rgba(31,26,23,…)` / `rgba(28,28,28,…)` | cool shadow **`rgba(15,23,42,…)`** (slate-900) — keep the same blur/spread/opacity |
| `components/hostel/HostelLocationMap.tsx`, `components/search/HostelMap.tsx` | Leaflet marker `#1d5cf5` / `#337bff` | indigo **`#4F46E5`** (stroke) / **`#6366F1`** (fill) to match the accent |
| `app/layout.tsx` | theme-color `#F4ECDF` / `#1A1411` | `#F8FAFC` / `#0F172A` (also in §2.1) |
| image-overlay utilities (`bg-black/50`, `text-white`) on photo thumbnails (hostel media, cover buttons) | black scrim over photos | **keep** — a neutral scrim over user images is correct in any palette (audit: verify none sit on non-image surfaces) |

### 2.3 Admin component sweep (finish the D5 follow-up)

13 admin files still use `brand-*` / `neutral-*` utilities. Two acceptable strategies:

- **Fast (ship-safe):** the repointed `brand-*` ramp (§1.3) makes them on-brand immediately; Tailwind
  default `neutral-*` grays are cool and read fine on the new slate palette. Zero component edits.
- **Clean (recommended follow-up):** migrate those 13 files onto the semantic tokens
  (`bg-card`, `text-foreground[-muted]`, `border-border`, `text-primary`) and then **drop the
  `brand-*` shim** — same end state web reached in D5.

Plan: do **Fast** inside this recolor (so admin is instantly correct), and schedule **Clean** as the
tail phase (C4) since it's mechanical.

### 2.4 What needs **no** change (already token-driven)

Status pills/badges (`StatusPill` keyed on `StatusTone` → success/warning/error/neutral tokens),
all buttons/inputs/panels/dialogs, the marketing sections + `Hero` gradients
(`from-primary/15 via-background-secondary …`), `Reveal` motion, scrollbar (`var(--border)`),
dialog overlay (`bg-foreground/40`). These recolor automatically the moment the tokens change.

---

## 3. Design decisions & rationale

- **Pure-white cards on a slate-50 page.** Maximizes the "lift" of surfaces and makes indigo pop —
  the crispest, most premium light-UI pattern. (The old system used cream-on-cream; white cards are
  a deliberate, cleaner upgrade.)
- **One accent, everywhere.** Indigo is the *only* brand hue; success/warning/error stay strictly
  functional. No secondary brand color — consistency by constraint (unchanged principle from
  `designer.md §1`).
- **Cool neutrals (slate), not pure gray.** Slate has a faint blue undertone that harmonizes with
  indigo; pure `#808080` grays would feel flat next to it.
- **Shadows go cool.** A warm-tinted shadow under an indigo/white UI looks muddy; slate-900 shadows
  at the same low opacity keep the soft, large, diffuse feel from `designer.md §4`.
- **Dark mode keeps the light-accent/dark-text button.** Guarantees AA on the button without a
  second accent value, and matches the mechanism already in the codebase.

---

## 4. Phased rollout (C0 → C5)

Each phase ends green on `turbo run type-check lint build` (web 25/25, admin 12/12) and is left
uncommitted (§7.1). Update `CLAUDE.md` §8.6 per phase (§7.2).

| Phase | Scope | Output |
|---|---|---|
| **C0 — Web tokens** | Swap `apps/web/src/app/globals.css` `:root` + dark blocks to §1.1/§1.2; update `layout.tsx` theme-color. | Whole web app recolors in one shot. |
| **C1 — Shared JS authority** | Mirror the new light+dark maps in `packages/shared/src/theme/colors.ts` (+ functional aliases). | Mobile-ready parity; single source of truth stays true. |
| **C2 — Token-bypass fixes** | Cool shadows (`panel`, `FilterTabs`, `search`, `Hero`); indigo Leaflet markers; audit `bg-black/text-white` overlays. | No warm residue anywhere in web. |
| **C3 — Admin tokens + brand ramp** | Swap `apps/admin/src/app/globals.css` `:root`/dark + repoint `brand-*` to indigo (§1.3). | Admin instantly on the new palette. |
| **C4 — Admin component sweep (follow-up)** | Migrate the 13 `brand-*`/`neutral-*` admin files onto semantic tokens; drop the admin `brand-*` shim. | Admin fully tokenized (matches web). |
| **C5 — Verify & polish** | In-browser light+dark pass (landing, search, booking, owner, admin), contrast spot-checks, map markers, focus rings, screenshots. | Signed-off, consistent recolor. |

> C0–C3 deliver a complete, consistent recolor of both apps. C4 is mechanical cleanup that can trail.

---

## 5. Verification checklist (definition of done)

- [ ] No warm cream/terracotta remains: `grep` finds no `#f4ecdf|#d97757|#1f1a17|rgba(31,26,23`
      residue in `apps/web`; admin brand ramp points to indigo.
- [ ] `apps/web/globals.css`, `apps/admin/globals.css`, `packages/shared/theme/colors.ts`, and
      `layout.tsx` theme-color all agree on the new values (light + dark).
- [ ] Primary buttons, links, focus rings, active nav, badges, charts, and map markers all read
      indigo; success/warning/error still read green/amber/red.
- [ ] Light **and** dark verified in-browser on: landing `/`, `/search` (+ map), a hostel detail,
      booking + payment, owner dashboard, and 2–3 admin pages.
- [ ] WCAG AA holds for body, muted text, and the primary button in both themes (§1.4).
- [ ] `turbo run type-check lint build` clean (web 25/25, admin 12/12); nothing committed (§7.1);
      `CLAUDE.md` §8.6 updated per phase.

> Once C0–C3 land and the checklist passes, the entire product reads as a modern **Indigo on cool
> white** system — consistent across web + admin, light + dark — with C4 as optional tidy-up.
