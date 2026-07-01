# Application Page Templates

> Reusable, app-level **page templates** (like WordPress page templates) — not
> feature screens. Pick a template, fill the slots, ship. Don't invent new
> structures unless none of these fit. All templates assume the shared shell
> (fixed sidebar + sticky navbar) and the reusable **`PageHeader`** (sticky
> `top-16`, title + one-line subtitle + a `children` toolbar slot). See
> `designer.md` for tokens/components.

**Global rules (every template):**
- One `PageHeader` per page: **title + one-line subtitle** (never a bare title).
- **Primary CTA lives in the header's action slot** (top-right). On scroll it may
  fold into a FAB (bottom-right) for action-bearing pages.
- Page body is a single vertical stack (`space-y-6`), max content width inherited
  from the shell.
- Always design **loading (skeleton)** and **empty** states.

---

## 1. List Page

**Purpose:** Browse / filter / search a collection of records and drill into one.

**Layout (top → bottom):**
1. `PageHeader` → title + subtitle + **primary CTA** (e.g. "Create"), with the
   **toolbar in its `children` slot**: filter **tabs** (left) + **search / filter**
   controls (right).
2. *(optional)* Stat band — only metrics the tabs don't already show.
3. Active-filter chips row (if filters applied).
4. The list/grid of cards or rows.
5. Pagination / "load more" (or infinite scroll).

**UX rules:**
- Tabs + search live **inside** the header so they pin together; tabs carry
  counts as badges (don't duplicate counts as stat cards).
- Filtering/searching is **live or apply-on-submit**, but never silently partial —
  show what's filtered via chips; provide a "Reset all".
- Card = whole row is the click target into the Detail Page.
- Header may use `collapsibleTitle` (title folds on scroll, toolbar stays pinned).

**CTA placement:**
- **Primary** ("Create / Add / New") → header action slot → FAB on scroll.
- **Per-item** actions live on each card (kebab / inline), never compete with the page CTA.

**Use when:** the screen's job is "find one of many" — Orders, Packages,
Requests, Bookings, Inbox, Notifications, Bucketlists.

---

## 2. Detail Page

**Purpose:** Read/act on a **single record**; the canonical "show" view.

**Layout (top → bottom):**
1. `PageHeader` → **back arrow** (history-back, restores list scroll) + record
   title + status/subtitle. Primary record action in the action slot.
2. Hero / summary block (key facts, status pill, primary image).
3. Content sections (`Panel`/section cards), each a titled group of details.
4. Secondary/related lists (timeline, attachments, related items).
5. Footer action bar for the main action(s) on long pages.

**UX rules:**
- **Back returns to the previous scroll position** (use history back + fallback href).
- Status is shown as a tinted pill near the title.
- Group details into titled sections; never a wall of fields.
- Destructive/irreversible actions are **de-emphasized** and **confirmed** (dialog).

**CTA placement:**
- **Primary record action** (Accept, Pay, Edit, Confirm) → header action slot
  and/or a sticky/footer bar on long pages.
- **Destructive** (Delete/Cancel) → bottom of the relevant section, muted styling,
  always behind a confirm.

**Use when:** viewing/acting on one entity — a proposal, booking, package,
request, profile, order.

---

## 3. Multi-Step Form / Wizard

**Purpose:** Capture a long/branching input as small, ordered steps.

**Layout (top → bottom):**
1. **Sticky header = title + step progress** (the stepper lives in the
   `PageHeader` `children` so it pins with the title). Title may be centered.
2. *(optional)* Context banner (e.g. "locked / limited edit").
3. **Single step card** at a time (`Panel`), with a step heading + helper text.
4. **Requirements hint** — list what still blocks the Continue button.
5. **Step nav row:** Back (left) + Continue/Submit (right).

**UX rules:**
- Only **one step visible**; reset scroll to top on step change.
- Progress bar/stepper spans full width and reflects the current step; completed
  steps are tappable to go back.
- **Disable Continue** until the step is valid **and say why** (requirements hint).
- Persist entered data across steps; support edit/clone prefill.
- Final step submits **once** (guard against double-submit).

**CTA placement:**
- **Continue / Submit** → bottom-right of the step. **Back** → bottom-left (or the
  header back arrow). Final action labeled by outcome ("Create…", "Submit…").
- No header FAB here — the step's Continue is the action.

**Use when:** creating/editing something with ≥3 fields-groups or branching logic
— package creation, trip request, onboarding, bucketlist creation.

---

## 4. Dashboard Page

**Purpose:** At-a-glance overview + fast routes into deeper work (the landing screen).

**Layout (top → bottom):**
1. `PageHeader` (or a greeting hero) → who/what + a primary CTA.
2. **KPI / stat band** — a responsive grid of metric cards (label + big value + trend/icon).
3. **Primary spotlight** — the single most important thing right now (a featured
   card, pending action, or reminder; may be a pinned/sticky banner).
4. **Quick actions** — a small grid of shortcut tiles.
5. **Recent / recommended** lists (compact, each linking into a List or Detail page).

**UX rules:**
- Lead with **status, not chrome**: surface what needs attention first.
- Stat cards are read-only summaries; clicking a card routes to the filtered List.
- Keep it scannable — short lists with "View all" links, not full tables.
- Reminders/nudges can be **sticky** so they persist while scrolling.

**CTA placement:**
- **One primary CTA** in the header (the main job: "Create Package", "Create request").
- Each stat card / quick tile / list item is its own secondary CTA (navigation).

**Use when:** the home/landing screen of a role — agency dashboard, traveler home.

---

## 5. Settings Page

**Purpose:** Read/change account, preferences, and policies; a hub + its sub-pages.

**Layout (top → bottom):**
- **Hub:** `PageHeader` (title + subtitle) → grouped **link list** sections
  (each row: icon + label + chevron → sub-page), with destructive items last.
- **Sub-page:** `PageHeader` with **back arrow** + subtitle → centered
  `max-w-xl` column → titled `Panel` section(s) with `ProfileFormField`s →
  **Cancel + Save** button row (right-aligned).

**UX rules:**
- All sub-pages share **one header treatment** (same component, same size) — never
  a one-off larger header.
- Forms use the standard labeled fields with inline errors and a clear focus ring.
- Confirm destructive changes (delete account, etc.); keep them in a clearly
  separated, de-emphasized section.
- Back restores the hub's scroll position.

**CTA placement:**
- **Save** → primary, bottom-right of the form row; **Cancel** → secondary beside it.
- **Destructive** ("Delete account") → its own section, red button behind a confirm.
- No header FAB on settings forms.

**Use when:** account/profile, security (email/password), preferences, policies,
blocked content, reports — anything configuration-shaped.

---

## Choosing a template

| If the screen is about… | Use |
|---|---|
| finding one of many | **List Page** |
| viewing/acting on one record | **Detail Page** |
| capturing long/branching input | **Multi-Step Form / Wizard** |
| overview + routing into work | **Dashboard Page** |
| changing account/preferences/policies | **Settings Page** |

> If a screen doesn't fit cleanly, it's usually a **List or Detail** with extra
> sections — extend those before inventing a new structure.
