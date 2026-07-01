# responsive-plan.md — Making **Find Your Hostel** fully responsive (web)

> **What this is.** A senior front‑end lead's end‑to‑end plan to make `apps/web` fully
> responsive across phones, tablets, laptops, and large desktops — building on the design
> system already shipped in [`designer.md`](./designer.md) / [`designerplan.md`](./designerplan.md).
> It audits the current state, sets the breakpoint + spacing + touch standards, specifies
> responsive behavior for every shared primitive and every route, and sequences the work into
> phases. **No implementation here — this is the plan.**
>
> **Scope:** `apps/web` (Next.js App Router + Tailwind v4). `apps/admin` responsive work is
> noted where it differs (data tables) but is a separate track. Per **CLAUDE.md §7.1** nothing
> is committed; per **§7.2** each shipped phase updates CLAUDE.md.

---

## 0. TL;DR

The redesign already gave us a **real responsive spine** — the `AppShell` swaps a fixed desktop
sidebar for a hamburger + off‑canvas drawer at `lg`, the content column is `max-w-[1440px]` with
`px-4 sm:px-6 lg:px-8`, `PageHeader` is full‑bleed, and `FilterTabs` scrolls horizontally. What's
missing is **systematic coverage below `sm` (320–480px)** and **tablet‑specific tuning**: a few
hard grids (`grid-cols-3` gallery, `grid-cols-2` form rows) don't collapse, several **touch
targets are 36px** (below the 44px minimum), the **search filters have no mobile sheet** (they
stack full‑width above results), there's **no safe‑area handling** for notched phones (the FAB and
bottom sheets), and admin **data tables** need horizontal‑scroll wrappers. This plan formalizes a
mobile‑first breakpoint system, fixes those gaps primitive‑by‑primitive, then sweeps every route.

---

## 1. Current responsiveness audit

### 1.1 What already works well
- **App shell** (`AppShell`/`Sidebar`/`Navbar`/`MobileSidebar`): desktop fixed rail (`lg:fixed`,
  `lg:w-[248px]`↔`[76px]`) → **off‑canvas drawer + hamburger** below `lg` (`lg:hidden`), with a
  scroll‑locked backdrop. Content column `mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8`.
- **`PageHeader`**: full‑bleed via `-mx-4 sm:-mx-6 lg:-mx-8`, sticky under the navbar, collapsible
  title on scroll. Toolbars mostly stack (`flex-col gap-3 lg:flex-row`).
- **`FilterTabs`**: `overflow-x-auto` + `min-w-max` → scrolls horizontally instead of overflowing.
- **Landing hero**: already fluid (`text-3xl sm:text-4xl`, `sm:px-12 sm:py-16`, `sm:flex-row`).
- **Forms / PanelSections**: most use `grid gap-4 sm:grid-cols-2` (single column on mobile).
- **Motion**: a global `prefers-reduced-motion` reset already lives in `globals.css`.

### 1.2 Screens / components with issues
| Area | Issue | Where |
|---|---|---|
| **Hostel gallery** | `grid grid-cols-3` is **not responsive** → 3 tiny tiles on a 320px screen | `hostels/[id]/page.tsx` |
| **Search filters** | Sidebar stacks **full‑width above results** on mobile (long scroll before any result); no filter sheet/drawer | `search/page.tsx` + `SearchFilters.tsx` |
| **Search map** | `h-[70vh]` fixed; fine, but toolbar (count + list/map toggle) can crowd at 320px | `search/page.tsx` |
| **Owner hostel rows** | `flex justify-between` with a **wrap of 3–4 action buttons** → cramped/оверflow at 320–360px | `(owner)/owner/page.tsx` |
| **Owner wizard / seat editor** | Hard `grid-cols-2` / `grid-cols-3` for numeric fields → inputs get too narrow on small phones | `HostelWizard.tsx`, `SeatTypeEditor.tsx`, `SubmitOfferForm.tsx` |
| **Booking checkout** | `md:grid-cols-[1fr_18rem]` — price panel drops **below** the form on mobile (no sticky summary / no "Confirm" reachable without scrolling) | `hostels/[id]/book/page.tsx` |
| **Chat thread** | Message area `h-[55vh]` fixed; composer not pinned above the mobile keyboard; long messages ok | `messages/[id]/page.tsx` |
| **Touch targets** | `size="sm"` buttons + icon buttons are **h‑9 (36px)**; sidebar collapse chevron **h‑6 (24px)**; several tap targets < 44px on touch | `ui/button.tsx`, `Sidebar.tsx`, badges |
| **Safe areas** | FAB `bottom-6 right-6` and future bottom sheets don't account for the **home indicator / notch** (`env(safe-area-inset-*)`) | `PageHeader.tsx` (FAB) |
| **Result card** | `w-32` image is fixed; at 320px the text column gets tight but doesn't break | `HostelResultCard.tsx` |
| **Admin tables** | `@tanstack/react-table` grids have **no horizontal‑scroll wrapper** → overflow on tablet/mobile | `apps/admin` |
| **Viewport meta** | No explicit `viewport` export (Next default is fine, but we want `viewport-fit=cover` for safe areas) | `app/layout.tsx` |

### 1.3 Existing responsive patterns (the vocabulary already in use)
- Breakpoint prefixes in play today: **`sm:` , `md:` , `lg:`** (no `xl:`/`2xl:` yet).
- Column collapse: `grid gap-4 sm:grid-cols-2` / `sm:grid-cols-3`.
- Row stacking: `flex flex-col gap-3 sm:flex-row` (buttons/toolbars).
- Shell switch: everything keyed to **`lg` (1024px)** — sidebar ↔ drawer.
- Horizontal scroll escape hatch: `overflow-x-auto min-w-max` (FilterTabs).
- Full‑bleed headers: negative margin `-mx-*` matched to container padding `px-*`.

> **Takeaway:** the system is ~70% responsive by construction. The work is **filling the
> sub‑`sm` band, tuning tablets, standardizing touch targets, and adding sheet/safe‑area
> patterns** — not a rebuild.

---

## 2. Responsive design principles

1. **Mobile‑first, always.** Base (unprefixed) styles target the **smallest** screen (320px);
   layer complexity up with `sm:`/`md:`/`lg:`/`xl:`. Never write desktop styles and undo them down.
2. **One spacing scale, scaling by breakpoint.** Section rhythm `space-y-6` (mobile) → `lg:space-y-8`;
   container padding `px-4 sm:px-6 lg:px-8`; card padding `p-4 sm:p-5 lg:p-6`. Don't invent one‑offs.
3. **Touch targets ≥ 44×44px on touch devices.** Interactive controls get a 44px minimum hit area
   on mobile (raise `sm` buttons/icon buttons from `h-9`→`h-11`, or add padding/`::before` hit slop).
4. **Content max‑widths.** App content `max-w-[1440px]`; reading/detail columns `max-w-2xl`; forms
   `max-w-xl`. Never let text run edge‑to‑edge on large desktops.
5. **Typography scales, not jumps.** Page title `text-2xl` (mobile) → optionally `lg:text-3xl` on
   hero/dashboard; body stays `text-sm`. Use a small, deliberate set of steps — avoid fluid `clamp()`
   unless a hero needs it. Keep line length ≤ ~70ch.
6. **Progressive disclosure on small screens.** Filters → **bottom sheet**; multi‑column dashboards
   → single stack; secondary actions → overflow menu; dense tables → stacked cards or horizontal scroll.
7. **Predictable chrome behavior.** Sidebar = drawer < `lg`; header sticky at every size; modals =
   centered dialog on desktop, **bottom sheet** on mobile; FAB only where an action‑bearing header folds.
8. **Respect the device.** Honor `prefers-reduced-motion` (already global), `env(safe-area-inset-*)`
   for notches/home indicator, and both portrait **and landscape** (short‑height phones).

---

## 3. Breakpoint system (official)

We keep **Tailwind's default breakpoints** (already what the code uses) and map them to the
requested device bands. Mobile‑first: the **base** range needs no prefix.

| Band (device) | Width | Tailwind key | Layout intent |
|---|---|---|---|
| **Small mobile** | 320–479px | *(base, no prefix)* | Single column, stacked everything, drawer nav, sheets, 44px targets |
| **Large mobile** | 480–639px | *(base; optional `xs:475px`)* | Single column with slightly more padding; 2‑up chips allowed |
| **Tablet (portrait)** | 640–767px | **`sm:` (640)** | Two‑column form rows, side‑by‑side toolbars, wider padding |
| **Tablet (landscape) / small tablet** | 768–1023px | **`md:` (768)** | 2‑col content grids, price panel beside form; **still drawer nav** |
| **Small laptop** | 1024–1279px | **`lg:` (1024)** | **Sidebar appears**; multi‑column dashboards; filter sidebar inline |
| **Desktop** | 1280–1365px | **`xl:` (1280)** | Wider gutters, 3–4 col stat bands |
| **Large desktop** | 1366px+ | `xl:` (+ `max-w-[1440px]` cap) | Content capped and centered; generous whitespace |

**Decisions:**
- **`lg` (1024px) is the shell hinge** — sidebar ↔ drawer. This already matches the "small laptop"
  band and stays.
- **Optionally add one custom screen** `xs: 475px` in the Tailwind theme to fine‑tune the two mobile
  bands (e.g. `xs:grid-cols-2` for chip rows). Add it only if a real layout needs it — don't
  pre‑emptively sprinkle `xs:`.
- **Cap at `max-w-[1440px]`** so 1366px+ desktops get centered content, not stretched rows.
- We do **not** use `2xl` (1536) initially; the 1440 cap makes it redundant.

---

## 4. Shared responsive primitives (standards)

For each primitive: the rule at each band + what to fix.

### `AppShell`
- **< lg:** no sidebar; `Navbar` shows hamburger → `MobileSidebar` drawer (`w-[248px]`, backdrop
  `z-40`, panel `z-50`, scroll‑locked). Main column full‑width, `px-4`.
- **≥ lg:** fixed rail; main column `lg:pl-[248px]` / `[76px]`, `lg:px-8`.
- **Fix:** add `min-w-0` to the main column wrapper so wide children (tables/maps) can't force
  horizontal page scroll; add `viewport-fit=cover` + `pb-[env(safe-area-inset-bottom)]` awareness.

### `Sidebar`
- Drawer variant is always **expanded** (never the 76px rail). Nav items already `py-2.5` (~44px).
- **Fix:** collapse chevron (`h-6 w-6`, desktop‑only — acceptable); ensure the drawer scrolls
  independently (`overflow-y-auto`) and respects `safe-area-inset-top/bottom`.

### `Navbar`
- `h-16` at all sizes; hamburger `lg:hidden`. Workspace label may truncate on 320px.
- **Fix:** hide/shorten the workspace label under `sm` if it competes with the bell; keep bell + menu
  always tappable (44px).

### `PageHeader`
- **< sm:** title `text-2xl`, subtitle wraps; toolbar stacks under the title (`flex-col gap-3`).
- **≥ lg:** toolbar can sit inline (`lg:flex-row lg:justify-between`); title may fold on scroll.
- **Standard:** the `children` toolbar must be `flex-col gap-3 lg:flex-row lg:items-center
  lg:justify-between`; the primary action wraps to full‑width button on the smallest screens or folds
  to the FAB. **FAB** gets `bottom-[calc(1.5rem+env(safe-area-inset-bottom))]`.

### `FilterTabs`
- Already `overflow-x-auto min-w-max` → horizontal scroll on mobile. Keep.
- **Standard:** always pass `min-w-0` when it shares a header row with a search box so tabs scroll
  instead of pushing search off‑screen. Add a subtle right‑edge fade to hint scrollability (optional).

### Cards / `Panel`
- Padding scales `p-4 sm:p-5 lg:p-6`; radius constant. Row cards: content `flex` must become
  `flex-col` (or wrap) when it holds a label block **and** an action cluster.
- **Standard:** any "info left / actions right" row = `flex flex-col gap-3 sm:flex-row
  sm:items-center sm:justify-between`; action clusters get `flex-wrap justify-start sm:justify-end`.

### Forms
- Base = **single column**; `sm:grid-cols-2` for paired fields. Inputs already full‑width `h-11`
  (44px ✓). Field labels stay above inputs (never inline on mobile).
- **Fix:** hard `grid-cols-2`/`grid-cols-3` in the wizard/seat‑editor/offer form → `grid-cols-1
  sm:grid-cols-2` (and `sm:grid-cols-3` where three fit).

### Tables (admin)
- **< lg:** wrap in `overflow-x-auto` with `min-w-[720px]` inner table **or** switch to a stacked
  "label: value" card list. Prefer **card list** for action‑heavy tables, **scroll** for dense read‑only.
- **Standard:** every `react-table` gets a scroll container + sticky header; never let a table set page width.

### Dialogs → Bottom sheets
- **≥ sm:** centered `Dialog` (current). **< sm:** render as a **bottom sheet** (full‑width, pinned to
  bottom, rounded top corners, `pb-[env(safe-area-inset-bottom)]`, drag‑to‑dismiss optional).
- **Standard:** add a `sheetOnMobile` variant to the `Dialog` primitive (position/animation swap by
  breakpoint) so `ConfirmDialog` and future modals adapt automatically.

### Bottom sheets (new primitive)
- Used for: **search filters**, mobile confirms, "more actions" menus. `fixed inset-x-0 bottom-0
  z-50 max-h-[85vh] overflow-y-auto rounded-t-[24px]` + backdrop `z-40` + safe‑area bottom pad.

### Maps (Leaflet)
- Keep `dynamic(ssr:false)`. Container heights responsive: detail map `h-56 sm:h-64`; search map
  `h-[60vh] lg:h-[70vh]`. Ensure the map lives in a `rounded-[24px] overflow-hidden` box and
  invalidates size on view toggle (Leaflet needs a resize nudge when un‑hidden).

### Search bars / `SearchInput`
- Full‑width on mobile (`w-full`), constrained on desktop (`lg:max-w-md`). Height `h-12` (48px ✓).
  Clear button hit area ≥ 44px. When paired with tabs in a header, stacks above tabs on mobile.

---

## 5. Per‑route responsive review

> Format per route: **M** = small/large mobile (320–767) · **T** = tablet (768–1023) · **D** =
> laptop/desktop (1024+). "Fix" = the concrete change.

### Public / marketing
| Route | M | T | D | Fix |
|---|---|---|---|---|
| `/` landing | Hero stacks, CTAs full‑width; 1‑col "how it works"; recommended list 1‑col | 2‑col steps | 3‑col steps, capped width | Verify hero button row wraps at 320; steps `grid-cols-1 sm:grid-cols-3`. Public top‑nav: collapse role links into a menu on mobile. |
| `/search` | **Filters in a bottom sheet** (button "Filters" in header); results 1‑col; map full‑height toggle | Filters sheet or inline; results 1‑col | Inline filter sidebar `lg:grid-cols-[280px_1fr]`; results 1‑col | **Add filter sheet < lg**; move filters out of the always‑open stack; count+toggle toolbar wraps. |
| `/hostels/[id]` | **Single hero image** (gallery collapses); seat/facility/rules stack; map `h-56`; sticky "Book" bar optional | 2‑col facilities; gallery 2‑up | Full 3‑tile gallery; wider columns | Gallery `grid-cols-1 sm:grid-cols-3`; slim header actions (Save/Message) may collapse to icons on 320. |
| `/hostels/[id]/book` | Form 1‑col; **price summary moves to a sticky bottom bar** (total + Confirm) | Form + price side‑by‑side (`md:grid-cols-[1fr_18rem]`) | Same as T, wider | Make price panel sticky/bottom on mobile so Confirm is always reachable; terms `Switch` already touch‑sized. |

### Student (in shell)
| Route | M | T | D | Fix |
|---|---|---|---|---|
| `/bookings` | 1‑col cards; tabs scroll; card = info over price (stack) | 1‑col wider | 1‑col, capped | Card row `flex-col sm:flex-row`; tab bar already scrolls. |
| `/bookings/[id]` | Sections stack; rows `justify-between` keep; cancel bar stacks | same | `max-w-2xl` centered | Ensure payment timeline rows wrap; ConfirmDialog → sheet on mobile. |
| `/requests` | 1‑col; offer‑count badge inline; tabs scroll | 1‑col | capped | Fine; verify card row stacks. |
| `/requests/new` | 1‑col form (collapse the `sm:grid-cols-2` pairs at base) | 2‑col pairs | centered `max-w-xl` | Already `sm:grid-cols-2`; confirm base is 1‑col. |
| `/requests/[id]` | Summary + offers stack; accept/decline buttons wrap; dialogs → sheet | same | `max-w`‑ish | Offer action row `flex-wrap`. |
| `/saved` | 1‑col list; remove (X) 44px | 1‑col | capped | X button hit area to 44px. |
| `/messages` | Full‑width conversation rows; unread badge; pin 44px | same | list capped | Pin button hit area 44px. |
| `/messages/[id]` | **Chat area fills viewport minus header**; composer pinned above keyboard; bubbles `max-w-[85%]` | fixed height ok | `h-[55vh]` panel | Swap `h-[55vh]` for `h-[calc(100dvh-…)]` on mobile; use `dvh`; sticky composer + safe‑area. |
| `/community` | 1‑col posts; topics scroll (FilterTabs); composer full‑width; "Ask"→FAB | 1‑col | capped | Composer `Switch` row already ok. |
| `/community/[id]` | Post + replies stack; reply composer full‑width | same | `max-w`‑ish | Fine. |
| `/notifications` | 1‑col rows; header has 2 buttons — **wrap under sm** | inline buttons | inline | Header toolbar `flex-wrap`/stack the two buttons at 320. |
| `/profile` | Single `max-w-2xl` column; PanelSections stack; save/sign‑out rows stack | same | centered | Button rows `flex-col sm:flex-row sm:justify-end`. |

### Owner (in shell)
| Route | M | T | D | Fix |
|---|---|---|---|---|
| `/owner` | Stat band `grid-cols-1` → `sm:grid-cols-3`; hostel rows: **info over wrapped action buttons** | 3‑col stats | stats + list | Action cluster `flex-wrap`; consider an overflow "⋯" menu when >2 actions on 320. |
| `/owner/bookings` | 1‑col Panels; action buttons wrap; OwnerPaymentReview stacks; tabs scroll | 1‑col | capped | Confirm/Reject/… row `flex-wrap justify-end`. |
| `/owner/requests` | 1‑col; SubmitOfferForm 1‑col (collapse its `grid-cols-2`) | 2‑col offer fields | capped | Offer form `grid-cols-1 sm:grid-cols-2`. |
| `/owner/promotions` | Create form 1‑col; promo cards: info over status | 2‑col form pairs | capped | Form pairs `sm:grid-cols-2`; card `flex-col sm:flex-row`. |
| `/owner/onboarding` | 2‑step wizard 1‑col; doc upload full‑width; nav buttons stack | same | `max-w-xl` | Convert to `PageHeader` later; ensure upload + step nav stack. |
| `/owner/hostels/new` · `[id]/edit` | 5‑step wizard: **one field per row**; stepper scrolls; seat editor 1‑col | 2‑col fields | 2–3‑col | Collapse `grid-cols-2/3` → responsive; make the stepper horizontally scrollable; sticky step nav. |

### Auth
| Route | M/T/D | Fix |
|---|---|---|
| `/login` `/signup` `/forgot` `/reset` | Centered `max-w-md` card on `bg-background`; already fluid | Verify inputs full‑width, 44px; card `px-4` gutters on 320. |

### Admin (separate track)
| Area | Fix |
|---|---|
| Tables (`/owners` `/users` `/bookings` `/reports` `/content` `/promotions` `/listings`) | Wrap in `overflow-x-auto` + `min-w-[720px]`, sticky header; OR stacked cards on mobile. |
| Dashboard KPIs | `grid-cols-2 sm:grid-cols-4`. |
| Admin shell | Same drawer pattern as web (align in the admin responsive track). |

---

## 6. Component‑level fixes (cross‑cutting rules)

- **Flex wrapping:** every "label + actions" row → `flex flex-col gap-3 sm:flex-row
  sm:items-center sm:justify-between`; action clusters → `flex flex-wrap gap-2 justify-start
  sm:justify-end`. Never rely on a single non‑wrapping row of ≥3 buttons.
- **Grid changes:** replace all bare `grid-cols-2` / `grid-cols-3` with `grid-cols-1
  sm:grid-cols-2` (and `lg:grid-cols-3` / `sm:grid-cols-3` where three genuinely fit). Gallery →
  `grid-cols-1 sm:grid-cols-3`.
- **Overflow handling:** wide, un‑collapsible content (tables, code, long tokens) → local
  `overflow-x-auto` container, **never** page‑level horizontal scroll. Add `min-w-0` on fl/grid
  children that contain truncating text so `truncate` works.
- **Horizontal scrolling rules:** allowed **only** for FilterTabs and table containers; every such
  region must be finger‑scrollable and not trap vertical scroll. No accidental body overflow (audit
  with `overflow-x: clip` on `html` as a backstop while debugging).
- **Sticky elements:** navbar (`top-0`), PageHeader (`top-16`) — verify the 64px offset holds at all
  sizes; sticky footers (booking price bar, chat composer) use `sticky bottom-0` + safe‑area pad.
- **Safe‑area handling:** add `viewport-fit=cover`; FAB, bottom sheets, sticky footers, and the
  drawer use `env(safe-area-inset-*)` (`pb-[env(safe-area-inset-bottom)]`, etc.).
- **Landscape behavior:** on short viewports (`max-height` landscape phones) the sticky header +
  chat area must not eat the whole screen — use `dvh`/`svh` units for full‑height regions (chat,
  map) instead of `vh`, and allow the header to fold.

---

## 7. Performance considerations

- **Avoid layout shift (CLS):** reserve media boxes with aspect ratios (`aspect-[16/10]`) — already
  used on the gallery; extend to result‑card thumbnails. Skeletons must match final card heights.
  The `PageHeader` fold uses a hysteresis dead‑band to prevent reflow flicker — keep it.
- **Prevent unnecessary renders:** breakpoint behavior should be **CSS‑driven** (Tailwind
  responsive utilities), not JS `window.innerWidth` state, so resizing doesn't re‑render trees.
  Where JS must know the breakpoint (e.g. dialog‑vs‑sheet), use a single `matchMedia` hook, memoized.
- **Lightweight animations:** stick to `transform`/`opacity` transitions at `duration-200`; avoid
  animating `width`/`height`/`top`. The drawer/sheet slide uses `transform`.
- **Respect `prefers-reduced-motion`:** already globally reset in `globals.css`; ensure new
  sheet/drawer transitions inherit it (no motion when reduced).
- **Images:** keep `unoptimized` for now but always set explicit box dimensions; lazy‑load
  below‑the‑fold gallery thumbnails.
- **Fonts:** system humanist stack (no web‑font) → zero FOUT, nothing to tune.

---

## 8. Rollout phases

Each phase ends with `turbo run type-check lint build` clean and a real device/emulator pass at
**320 / 375 / 414 / 768 / 1024 / 1440**. Ship in this order so the highest‑traffic, highest‑risk
surfaces harden first.

| Phase | Name | Scope | Exit criteria |
|---|---|---|---|
| **R0** | **Foundations** | Add `viewport-fit=cover` viewport export; optional `xs:475px` screen; global safe‑area + `dvh` utilities; audit backstop (`overflow-x` check). Standardize the **button/icon touch‑target** sizes (44px on touch). | No horizontal body scroll at 320; all primary controls ≥44px on touch; build green. |
| **R1** | **Primitives** | Make `Dialog` a **bottom sheet < sm**; build the **BottomSheet** primitive; finalize `PageHeader` toolbar stack rule + safe‑area FAB; `FilterTabs` fade hint; table scroll wrapper util. | Primitives verified in isolation at all bands; ConfirmDialog is a sheet on mobile. |
| **R2** | **Shell & nav** | Verify `AppShell`/`Sidebar`/`Navbar`/`MobileSidebar` at every band; drawer safe‑area; navbar label truncation; `min-w-0` on main column. | Nav works 320→1440; no overflow; drawer scroll‑locks + respects safe area. |
| **R3** | **Public + student list/detail** | `/`, `/search` (**filter sheet**), `/hostels/[id]` (**gallery collapse**, map heights), `/bookings`(+detail), `/requests`(+new/detail), `/saved`, `/notifications`, `/community`(+detail). Card row stacking, grid collapses. | Every listed route passes the device matrix; no clipped content/CTA. |
| **R4** | **Chat + checkout (hard cases)** | `/messages/[id]` (`dvh` chat + pinned composer + keyboard/safe‑area), `/hostels/[id]/book` (**sticky mobile price bar**). | Chat usable with keyboard open; Confirm always reachable on mobile. |
| **R5** | **Owner surface** | `/owner` (action‑cluster wrap/overflow menu), `/owner/bookings`, `/owner/requests`, `/owner/promotions`, `/owner/onboarding`, hostel **wizard** (grid collapse + scrollable stepper + sticky step nav). | Owner flows complete on a 320px phone end‑to‑end. |
| **R6** | **Admin + polish** | Admin table scroll/stack wrappers + KPI grids + admin drawer; final landscape pass; CLS/reduced‑motion audit; remove any debug backstops. | Admin usable on tablet; Lighthouse mobile a11y ≥ 95; no CLS regressions. |

---

## 9. Definition of done (measurable)

- [ ] **No horizontal page scroll** at 320, 360, 375, 414, 480, 640, 768, 1024, 1280, 1440px on
      **every** route (portrait) and no clipped content in landscape on short phones.
- [ ] **Touch targets ≥ 44×44px** for all interactive controls on touch devices (buttons, icon
      buttons, tabs, pins, clears, switches, nav items).
- [ ] **Sidebar → drawer** below `lg`; drawer scroll‑locks, closes on nav, respects safe areas.
- [ ] **Filters** open as a **bottom sheet** below `lg` on `/search`; results reachable without
      scrolling past the whole filter set.
- [ ] **Dialogs render as bottom sheets** below `sm`; all confirms reachable and dismissable.
- [ ] **Hostel gallery, all form grids, stat bands, and card action rows collapse** correctly
      (single column / wrapped) at 320px.
- [ ] **Chat** fills the viewport with a **pinned composer** and works with the keyboard open
      (`dvh`/`svh`, safe‑area).
- [ ] **Booking checkout** keeps the total + **Confirm** reachable via a sticky mobile bar.
- [ ] **Admin tables** never force page width (scroll container or stacked cards).
- [ ] **Content capped** at `max-w-[1440px]`; reading columns `max-w-2xl`, forms `max-w-xl`.
- [ ] **CLS < 0.1** on key routes; animations are transform/opacity only; `prefers-reduced-motion`
      honored; **safe‑area insets** applied to FAB/sheets/sticky footers/drawer.
- [ ] `turbo run type-check lint build` clean; verified on the device matrix; CLAUDE.md updated
      per phase (§7.2); nothing committed (§7.1).

---

## 10. Appendix — quick reference (paste‑ready)

**Container:** `mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8`
**Page stack:** `space-y-6 pb-8 lg:space-y-8`
**Info/actions row:** `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
**Action cluster:** `flex flex-wrap gap-2 justify-start sm:justify-end`
**Form grid:** `grid gap-4 sm:grid-cols-2` (three‑up: `sm:grid-cols-3`)
**Card padding:** `p-4 sm:p-5 lg:p-6`
**Stat band:** `grid gap-3 grid-cols-1 sm:grid-cols-3` (admin KPI: `grid-cols-2 sm:grid-cols-4`)
**Full‑height region (chat/map):** `h-[calc(100dvh-4rem)]` / `h-[60svh] lg:h-[70vh]`
**Safe‑area sticky footer/FAB:** `pb-[env(safe-area-inset-bottom)]` / `bottom-[calc(1.5rem+env(safe-area-inset-bottom))]`
**Table wrapper:** `-mx-4 overflow-x-auto sm:mx-0` → inner `min-w-[720px]`
**Bottom sheet:** `fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[24px] pb-[env(safe-area-inset-bottom)]`

> **North star:** *mobile‑first, thumb‑friendly, no horizontal scroll, capped on large screens* —
> the same `AppShell` + `PageHeader` + `FilterTabs` spine adapting cleanly from 320px to 1440px+.
