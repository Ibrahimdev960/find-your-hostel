# CLAUDE.md — Find Your Hostel

This file is the quick-reference for the **Find Your Hostel** project. It explains what the
project is, the tech stack, and **what modules it is made of** — so anyone (or Claude) can
understand the system and answer "what's in this project / what did you implement?".

For full detail see [`projectplan.md`](./projectplan.md) — the full SDD plus the "Find Your
Hostel — How the Platform Works" flow guide. This file (`CLAUDE.md`) carries the engineering
blueprint (stack, libraries, structure, patterns) the project follows.

> **🚀 Starting the build? Go to [§10 — Step 1: Project scaffold](#10-step-1--project-scaffold-senior-dev-playbook).**
> Nothing in the repo yet — the very first task is scaffolding the monorepo. The roadmap (§9)
> calls this **M0**; §10 is the concrete, do-this-first playbook.

> **📌 Note for Claude — read this first.**
> **Find Your Hostel** is a **student-hostel marketplace**. Students (hostellites) search for
> hostel seats near their institution; hostel owners (hostellers) list and manage hostels;
> admins verify and moderate. It is **web-first now, mobile later**, built as a **Turborepo
> monorepo** where **all business logic lives in `packages/shared`** (platform-agnostic) and
> the apps are thin. Stack: **Next.js + Supabase + TanStack React Query + Zustand + Zod +
> Tailwind**. Booking is **per seat** (not whole property). There are **two booking paths**:
> a student books a listed seat **directly**, or posts a **request** and owners send
> **offers**. Payments are an **advance + balance/security deposit** model with **manual
> confirmation** (transfer + screenshot, or cash) — automated gateway is a future decision.
> Section 5 below summarizes **every product flow**; mirror those rules when implementing.

---

## 1. What the project is

**Find Your Hostel** is a platform that connects **students (hostellites)** looking for
accommodation near their institution with **hostel owners (hostellers)** who list and manage
their hostels. **Admins** verify owners/listings and moderate the platform.

- **Phase 1 (current): Web only** — public website + web admin panel.
- **Phase 2 (later): Mobile app** — reuses the same backend and shared business logic.

**Roles:** Student (Hostellite) · Hostel Owner (Hosteller) · Admin.

**Two booking paths:**
- **Direct booking** — owner lists a hostel with seats; student books a seat directly.
- **Request → offers** — student posts what they need; multiple owners send offers; student
  accepts one (which auto-rejects the rest).

## 2. Tech stack & libraries

> Library choices follow a proven cross-platform blueprint. Versions are indicative — bump to
> current latest when scaffolding, keep the same choices and layering.

### 2.0 Summary

| Layer | Technology |
| --- | --- |
| Frontend (web + admin) | Next.js (React, App Router) |
| Server state / data fetching | TanStack React Query |
| Client / UI state | Zustand |
| Validation | Zod |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) + Next.js API routes / Server Actions |
| Auth & access control | Supabase Auth + Row-Level Security (RLS) |
| Styling | Tailwind CSS (web) / NativeWind (mobile) |
| Maps | Leaflet + OpenStreetMap (no paid SDK) |
| Mobile (later) | React Native (Expo + expo-router) |
| Monorepo tooling | npm workspaces + Turborepo + TypeScript (strict) |

### 2.1 Monorepo tooling

| Concern | Choice | Notes |
| --- | --- | --- |
| Workspaces | **npm workspaces** (`apps/*`, `packages/*`) | one lockfile at root |
| Task runner / cache | **Turborepo** | `turbo run dev / build / lint / type-check` |
| Language | **TypeScript (strict)** | one TS version pinned at root |
| Shared package ref | `"@findyourhostel/shared": "*"` | consumed by every app via the workspace |

Root scripts of note: `dev:web` (Next dev for the site), `dev:admin` (Next dev for admin),
`dev:mobile` (Expo, later), `build` / `type-check` (`turbo run …`).

### 2.2 Shared core — `packages/shared`
Tiny dependency surface so it runs in **both** DOM and React Native runtimes:

| Library | Role |
| --- | --- |
| `@supabase/supabase-js` | typed DB/Auth/Storage/Realtime client (**type only — instance injected**) |
| `@tanstack/react-query` | server-state cache, the hook layer |
| `zustand` | client/UI state stores |
| `zod` | schemas + runtime validation |
| `date-fns` | date math/formatting |

### 2.3 Web — `apps/web` (current focus)

| Library | Role |
| --- | --- |
| `next` (App Router) | framework + routing + SSR/RSC |
| `react` / `react-dom` | UI |
| `@supabase/ssr` | cookie-based Supabase auth for server components / route handlers |
| `@tanstack/react-query` | server state (via shared hooks) |
| `zustand` | client state |
| `zod` | validation |
| `tailwindcss` (+ `@tailwindcss/postcss`) | styling |
| `lucide-react` | icons |
| `recharts` | charts/analytics |
| `react-hot-toast` | toasts |
| `react-country-state-city` | country/state/city pickers |
| `react-phone-input-2` | phone input |
| `date-fns` | dates |
| **Leaflet + OpenStreetMap** | maps / hostel location picker (no paid SDK) |

### 2.4 Admin — `apps/admin` (shadcn-style design system)

| Library | Role |
| --- | --- |
| `next`, `react` | framework |
| `@radix-ui/react-*` (dialog, dropdown, select, tabs, tooltip, avatar, label, separator, slot, alert-dialog) | headless accessible primitives |
| `class-variance-authority` + `clsx` + `tailwind-merge` | variant-driven styling (the shadcn/ui trio: `cva` + `cn()`) |
| `@tanstack/react-table` | data tables |
| `recharts`, `react-hot-toast`, `lucide-react` | charts / toasts / icons |

> Recommended baseline for the web app too: Radix primitives + `cva` + `cn()` (= shadcn/ui).

### 2.5 Mobile — `apps/mobile` (Phase 2)

| Library | Role |
| --- | --- |
| `expo` | RN toolchain |
| `expo-router` | file-based routing (mirrors Next App Router) |
| `react-native` | UI runtime |
| `nativewind` (+ `tailwindcss` v3 syntax) | Tailwind classes in RN |
| `react-native-reanimated` + `react-native-gesture-handler` | animations/gestures |
| `react-native-safe-area-context`, `react-native-screens` | layout/navigation primitives |
| `@react-navigation/*` | navigation (expo-router sits on top) |
| `react-hook-form` + `@hookform/resolvers` | forms (+ zod resolver) |
| `lucide-react-native` | icons (same set as web) |
| `react-native-webview` | **hosts the Leaflet map** on mobile |
| `expo-notifications` | push notifications |
| `expo-secure-store` / `@react-native-async-storage/async-storage` | secure session storage |
| `expo-image`, `expo-image-picker`, `expo-image-manipulator` | media |
| `@sentry/react-native` | crash reporting |
| `react-native-toast-message` | toasts |
| `country-state-city`, `libphonenumber-js` | location/phone parity with web |

## 3. Architecture in one line

A **Turborepo monorepo**: apps (`web`, `admin`, later `mobile`) are **thin presentation
layers**; **all business logic lives in `packages/shared`** (platform-agnostic — no DOM, no
React Native) so web and mobile consume the exact same logic.

**Golden rule:** *If a piece of logic is not about rendering, it belongs in
`packages/shared`.* Screens only call shared hooks and render.

### Repository layout (detailed)

```text
find-your-hostel/
├─ package.json              # npm workspaces + turbo scripts
├─ turbo.json
├─ apps/
│  ├─ web/                   # Next.js App Router — public site (focus)
│  │  └─ src/
│  │     ├─ app/             # routes: (auth) (dashboard) student/ owner/ api/ auth/
│  │     ├─ components/      # ui/ + feature folders (auth, student, owner, hostel, reviews, layout)
│  │     ├─ hooks/           # web-only hooks (e.g. useLocationSearch)
│  │     ├─ lib/             # web supabase clients (@supabase/ssr), helpers
│  │     └─ providers/       # React Query provider, auth provider
│  ├─ admin/                 # Next.js web admin panel (Radix + data tables)
│  │  └─ src/                # dashboard, owners, listings, users, reports, promotions
│  └─ mobile/                # Expo (Phase 2)
│     ├─ app/                # expo-router file tree: (auth) (student) (owner) _layout.tsx
│     └─ src/
│        ├─ common/          # components/ hooks/ lib/ providers/ services/ theme/ types/ utils/
│        └─ features/        # student/ owner/ auth/  (presentation only)
├─ packages/
│  └─ shared/                # @findyourhostel/shared — ALL business logic
│     └─ src/
│        ├─ api/             # cross-feature APIs (notifications, messaging, reviews, reports…)
│        ├─ config/          # constants, timing, api config
│        ├─ features/        # auth/ student/ owner/  ← feature-sliced (see §5/§6)
│        ├─ hooks/           # cross-feature hooks
│        ├─ lib/             # supabase injection (initSupabase/getSupabase), queryKeys, toast
│        ├─ queries/         # shared query-key helpers
│        ├─ services/        # platform-agnostic services
│        ├─ theme/           # colors / design tokens (shared web + mobile)
│        ├─ types/           # database.types.ts (generated) + domain types
│        └─ utils/           # format, apiError, parseZodErrors, domain helpers
└─ supabase/
   └─ migrations/            # ordered SQL (00001_…) — schema, enums, triggers, functions
```

### Feature slicing (most important convention)
Each feature in `packages/shared/src/features/<feature>/` is self-contained:

```text
features/student/
├─ api/        # thin functions that call Supabase and return typed data
├─ hooks/      # TanStack Query hooks wrapping the api/ functions
├─ queries/    # query-key factory (keys.ts)
├─ store/      # zustand stores for multi-step / UI state
├─ schemas/    # zod schemas
├─ types/      # feature TypeScript types
└─ utils/      # pure domain helpers
```

The package's `exports` map exposes each slice explicitly
(e.g. `@findyourhostel/shared/features/student/hooks`) for clean imports + tree-shaking.

### Key cross-platform patterns
- **Supabase dependency injection:** the shared package **never creates** a client. It
  exposes `initSupabase(client)` / `getSupabase()`. Each app builds its own client (web:
  `@supabase/ssr` cookies; mobile: `@supabase/supabase-js` + `expo-secure-store`) and calls
  `initSupabase()` once at startup. Every API function uses `getSupabase()`.
- **Generated types:** `packages/shared/src/types/database.types.ts` via
  `supabase gen types typescript`; schema lives in `supabase/migrations/*.sql` (enums,
  tables, **triggers**, **functions** — business rules like "auto-reject other offers on
  accept" live in Postgres triggers).
- **Maps:** one Leaflet+OSM implementation; mobile renders the same map inside
  `react-native-webview` via a shared `buildLeafletMapHtml()`.
- **Role-grouped routing:** route groups `(student)` / `(owner)` (+ admin app) keep the two
  product surfaces separate while sharing the data layer.

---

## 4. Modules

> These are the modules that make up the project. Use this section to answer
> "what modules are there / what did you implement?".

### 4.1 User Management Module
Handles registration, login, sessions, and roles.
- Register / login / logout via **Supabase Auth**.
- Role-based access for **Student**, **Hostel Owner**, and **Admin**.
- Profile view and update.
- Access enforced by Supabase **RLS** policies.

### 4.2 Hostel Management Module
Lets hostel owners list and manage their hostels.
- Add a hostel (name, address, nearest institution, price range, facilities, images).
- Update / delete a hostel.
- Upload hostel images/documents to **Supabase Storage**.
- New listings are submitted for admin verification before going live.

### 4.3 Search & Filter Module
Lets students find hostels.
- Search by **proximity/location**, **price**, and **amenities/facilities**.
- Filtering and sorting of results by relevance.
- Map-based location picking/search (Leaflet + OpenStreetMap).

### 4.4 Recommendation Module
Suggests hostels to students.
- Generates recommendations based on user preferences and history.

### 4.5 Booking & Seat Availability Module
Manages **per-seat** bookings and capacity.
- Direct booking of a seat in a chosen **seat type** (Single / Double / Triple / Quad / Dorm).
- Live seat counts; **"Fully Booked"** per seat type and per listing, enforced at the DB
  level so the last seat can't be double-booked.
- Booking lifecycle/statuses (see §5.8) with auto-expiry of unconfirmed bookings.
- **Edit-lock:** a hostel with active bookings locks its material fields.

### 4.6 Requests & Offers Module
The second booking path — student-driven.
- Student posts a **hostel request** (area/institution, budget, seat type, move-in date).
- Verified owners submit **offers** (one per owner); student reviews and **accepts** one.
- On accept: request → `booked`, advance due, and **all other offers auto-rejected**
  (enforced by a Postgres trigger).
- "Start a New Request" clones a cancelled request's details.

### 4.7 Payments Module
Advance + balance/security-deposit model with **manual confirmation**.
- **Advance** (default 20% of first month's rent) to reserve; **balance + security deposit**
  (default 1 month, refundable) due at move-in.
- Methods: **Bank Transfer / JazzCash / Easypaisa** (upload screenshot proof) or
  **Cash on the Spot**.
- The **owner** confirms or rejects each payment; screenshots stored in Supabase Storage.
- Automated payment-gateway integration is a **future decision**, not in the current model.

### 4.8 Reviews & Moderation Module
User-generated content and its moderation.
- Students leave reviews/ratings on hostels (overall, cleanliness, facilities, location,
  value); owners can respond. De-duplicated per booking; feeds the hostel's average rating.
- Reports/flags on hostels, reviews, messages, profiles, and requests
  (`pending → reviewing → resolved / dismissed`).
- Blocking users/content; moderated from the admin panel.

### 4.9 Messaging / Chat Module
Real-time chat between students and owners.
- Conversations tied to a context (hostel, offer, or booking); pinnable.
- Every message fires a `new_message` notification + push; blocking stops new messages.
- Powered by Supabase Realtime; admins can oversee conversations.

### 4.10 Community Module
Lightweight community surface.
- **Saved hostels / shortlist** (private) for comparison.
- **Student Q&A** posts (area, budget, facilities, food, safety…), optionally anonymous,
  with replies and likes.

### 4.11 Promotions Module
Paid **featured listings** for owners.
- Plans: `featured_1d`, `featured_3d`, `featured_7d`, `featured_30d`.
- Owner submits with a payment screenshot (`pending`); **admin approves** (starts timer →
  `active`) or rejects. Impressions/clicks tracked; featured listings rank higher in search.

### 4.12 Web Admin Panel Module
A **separate web app** (`apps/admin`) for administrators (Phase 1).
- **Hostel verification** — approve/reject new listings.
- **User management** — view, search, suspend, delete accounts.
- **Content moderation** — reviews, reports, flagged content.
- **Dashboard & analytics** — registrations, active listings, bookings.
- **Activity/audit logs** — track actions for data integrity.
- Restricted to the **Admin** role (Supabase Auth + RLS + route guards).

### 4.13 Notifications Module
Delivers both **in-app** and **push** notifications to all users across web and mobile.

**The pattern in one line:** DB triggers write notification rows → Supabase Realtime drives
in-app (the bell + React Query cache) → a DB webhook sends out-of-app push, delivered via
`expo-notifications` (mobile) and the browser Notification API (web), with both platforms
registering tokens through one shared API.

**Backend (source of truth) — Supabase / Postgres**
- A `notifications` table is the canonical store: `type`, `title`, `body`, `data` (JSON),
  `is_read`, `user_id`, timestamps.
- **Postgres triggers auto-create notification rows** when domain events happen (e.g. hostel
  approved/rejected, booking created/cancelled, new message, review received). Notifications
  are generated **in the database, not in app code**.
- **Push delivery:** a `push_tokens` table + a **DB webhook** that fires a push when a new
  notification row is inserted.

**Shared core — `packages/shared`**
- `api/notificationsApi.ts` — the `NotificationType` union (e.g. `hostel_approved`,
  `hostel_rejected`, `booking_created`, `booking_cancelled`, `new_message`,
  `review_received`) and functions: `fetchNotifications`, mark read / mark-all-read, and
  `registerPushToken` / `deactivatePushToken` (shared by web + mobile).
- `hooks/useNotifications.ts` — TanStack Query hooks + a `notificationKeys` factory (list +
  unread-count), with `staleTime: 0` since notifications are realtime.
- `hooks/useGlobalNotificationsRealtime.ts` — a Supabase Realtime subscription that pushes
  new rows into the Query cache for live in-app updates.
- `hooks/notificationCache.ts` — optimistic cache helpers (mark read, upsert, remove).

**Mobile — `apps/mobile`**
- `expo-notifications` + Expo push tokens, registered via the shared `registerPushToken`.
- A push service: permission/registration, foreground + tap listeners, and a **role-aware
  deep-link router** (e.g. tapping `hostel_approved` for an owner → the hostel detail
  screen), including cold-start "pending navigation" handling.
- A `NotificationBell` UI component.

**Web — `apps/web` / `apps/admin`**
- A web-push helper using the browser **Notification API**, minting a `web:<userId>:<id>`
  token and registering it through the same shared `registerPushToken`.
- Notification routing/handling logic, `NotificationBell` / navbar bell components, and a
  notifications page.

### 4.14 Shared Core Module (`packages/shared`)
The platform-agnostic backbone consumed by every app.
- **api/** — Supabase queries and mutations.
- **hooks/** — TanStack Query hooks (queries + mutations) + query keys.
- **store/** — Zustand stores (auth snapshot, multi-step form drafts).
- **schemas/** — Zod validation schemas.
- **types/** — generated DB types + domain types.
- **utils/ & config/** — formatting, error mapping, timing/constants, design tokens.

---

## 5. Product flows (how the platform works)

> Condensed from the full guide in [`projectplan.md`](./projectplan.md) ("Find Your Hostel —
> How the Platform Works"). These are the authoritative business rules — follow them when
> implementing. Numbers are configurable defaults.

### 5.1 Roles
- **Student (Hostellite)** — search/filter hostels, book a seat, post requests, review owner
  offers, pay, chat, review hostels, save favourites, ask community questions.
- **Hostel Owner (Hosteller)** — list/manage hostels & seats, respond to requests with
  offers, confirm payments, chat, run featured promotions.
- **Admin** — approve/reject/suspend owners, verify listings, manage users, approve
  promotions, handle reports, oversee bookings/content/messaging.

### 5.2 Categories & seat types
- **Categories:** Boys · Girls · Co-living/Family (`hostel_type`).
- **Seat types:** Single · Double · Triple · Quad · Dormitory (Sharing) — each with its own
  monthly rent, total seats, AC/Non-AC, attached-bath flag.
- Booking is **per seat**, not per whole property. Headline price = cheapest available seat
  type's rent.

### 5.3 Owner journey
- **Verification gate:** sign up → onboarding (CNIC/ID, ownership proof, photos) →
  `pending → approved` (or `rejected` / `suspended`). Can't publish until **approved** AND
  each listing is **verified**.
- **5-step create wizard:** Basics → Rooms & Seats → Facilities & Rules → Pricing → Media.
- **Capacity:** "Fully Booked" per seat type / per listing, enforced at the DB level.
- **Discounts:** 0–50% per seat type.
- **Edit-lock:** active bookings lock material fields (prices, seat config, deposit, rules);
  a hostel with any active booking can't be deleted.

### 5.4 Student journey A — direct booking
1. Search/filter by proximity, price, seat type, gender category, amenities (map + list).
2. Open a hostel → pick seat type (cheapest first), AC/Non-AC.
3. Confirm Booking: move-in date, duration, special requests, payment method, live price
   breakdown, agree to terms.
4. Status starts **Payment Pending Approval** (online) or **Pending Owner Confirmation**
   (cash).
5. Track in My Bookings; upload screenshot, cancel, and review after stay.

### 5.5 Student journey B — request → offers
1. Student posts a **request** (area/institution, budget, seat type, move-in) → `open`.
2. Verified owners send **offers** (one each); student sees a live offers count.
3. **Accept** one → offer `accepted`, request `booked`, advance due, **all other offers
   auto-rejected**.
4. Pay advance → move in → owner marks **moved-in** → balance + deposit due → owner confirms
   → **active** (unlocks review).
5. Cancel before payment confirmed → "Start a New Request" clones the details.

**Booking phase funnel:**
```
open → has_offers → offer_accepted → awaiting_advance →
advance_submitted → advance_rejected → reserved → moved_in → active
                         (or → cancelled / expired after acceptance)
```

### 5.6 Payments
- **Advance:** 20% of first month's rent (reserves the seat) on booking/acceptance.
- **Balance:** remaining 80% + **security deposit** (1 month, refundable) at move-in.
- **Methods:** Bank Transfer / JazzCash / Easypaisa (screenshot proof) or Cash on the Spot.
- **Owner confirms/rejects** each payment; screenshots in Supabase Storage.
- Automated gateway = **future decision**; current model is manual confirmation.

### 5.7 Notifications
DB triggers write to a `notifications` table → **Realtime** drives in-app (bell + cache) →
DB webhook sends **push** (web push now, Expo push on mobile). Taps deep-link by role.

### 5.8 Statuses (cheat sheet)
- **Direct booking:** `pending · payment_pending_approval · awaiting_advance ·
  advance_submitted · advance_rejected · pending_owner_confirmation · reserved · moved_in ·
  active · completed · cancelled · rejected · expired`.
- **Request:** `open · booked · completed · cancelled · expired · closed`.
- **Offer:** `pending · accepted · rejected · withdrawn · expired`.

### 5.9 Messaging, Community, Promotions, Trust & Safety
- **Messaging:** context-bound conversations (hostel/offer/booking); each message notifies +
  pushes; blocking stops messages.
- **Community:** private saved-hostel shortlist; student Q&A posts (optionally anonymous) with
  replies/likes.
- **Promotions:** owner pays for featured listing (1/3/7/30 days) → admin approves → active;
  impressions/clicks tracked.
- **Trust & safety:** report content (`pending → reviewing → resolved/dismissed`); block
  users/content.

### 5.10 Admin journey
Runs everything from `apps/admin`: Dashboard (KPIs), Owners (approve/reject/suspend),
Listings (verify/unpublish), Users, Promotions (approve/reject), Bookings (monitor), Reports
(resolve/dismiss), Content (moderate reviews & posts), Messaging (oversight).

### Quick reference — numbers that matter
- Advance **20%** · Balance **80% + deposit** · Security deposit **1 month** (refundable)
- Max discount **50%** · Seat types **Single/Double/Triple/Quad/Dorm**
- Categories **Boys/Girls/Co-living** · Promotion plans **1/3/7/30 days**
- Owner lifecycle **pending → approved (or rejected/suspended)**

---

## 6. How a feature is built (the pattern)

Every feature follows the same vertical slice, so it works on web and mobile alike:

```text
features/<feature>/
├── api/       # thin functions that call Supabase and return typed data
├── hooks/     # TanStack Query hooks wrapping the api/ functions
├── queries/   # query-key factory (keys.ts)
├── store/     # zustand stores for UI / multi-step state
├── schemas/   # zod schemas
├── types/     # feature TypeScript types
└── utils/     # pure domain helpers
```

Data flow: **query-key factories → query hooks → mutation hooks** (mutate → toast →
invalidate). **Screens never call the database directly.**

---

## 7. Conventions / rules

- ✅ All non-rendering logic goes in `packages/shared`; screens are thin.
- ✅ TanStack Query for anything from the server; Zustand only for auth + form drafts.
- ✅ Centralize query keys, timing constants, and theme tokens.
- ✅ Enforce rules in Postgres (RLS / constraints / triggers), not only in the client.
- ✅ Supabase client is **injected** per app; shared code uses a `getSupabase()` accessor.
- ❌ Don't import `react-native` or DOM APIs into `packages/shared`.
- ❌ Don't fetch data inside components/pages.

### 7.1 No git commits or pushes

- ❌ **Never create git commits** — not on any local branch.
- ❌ **Never push** — not to `origin` and not to any other remote.
- ✅ Version control is **managed by the user, by hand**. The Claude agent only edits files in
  the working tree; staging, committing, branching, and pushing are entirely the user's call.
  This applies even after large changes — leave the work uncommitted and let the user review.

### 7.2 Document-as-you-build rule

- ✅ **Any work added to the project must be recorded in this `CLAUDE.md`** — in a **readable,
  concise** form. Whenever a developer (or Claude) builds, changes, or removes something
  meaningful (a module, flow, table, API, convention, or decision), update the relevant
  section here so `CLAUDE.md` stays the single, accurate source of truth for "what's in this
  project / what did you implement?".
- ✅ Keep entries short and skimmable: a line or small bullet list, not a changelog dump.
  Tick the matching box in [§8 — Status](#8-status) when a module lands.
- ✅ **This rule applies equally to the Claude agent.** When Claude implements anything, it
  must update `CLAUDE.md` in the same readable, concise way as part of the same task — never
  leave the doc out of sync with the code.

---

## 8. Status

- [x] Monorepo + Supabase + shared package scaffolding **(M0 done)**
- [x] User Management Module **(M1 done)**
- [x] Hostel Management Module **(M2 done)**
- [x] Search & Filter Module **(M3 done)**
- [x] Booking & Seat Availability Module **(M4 done)**
- [x] Requests & Offers Module **(M5 done)**
- [x] Payments Module **(M6 done)**
- [x] Reviews & Moderation Module **(M9 done)**
- [x] Messaging / Chat Module **(M8 done)**
- [x] Community Module **(M10 done)**
- [x] Promotions Module **(M11 done)**
- [ ] Web Admin Panel Module
- [x] Notifications Module **(M7 done)**
- [ ] Recommendation Module
- [ ] Mobile app (Phase 2)

> Update the checkboxes above as modules are implemented.

### 8.1 Build log

**Progress at a glance** (every gate = `turbo run type-check lint build` clean):

| Module | Status | Migrations | Shared slices | Apps |
| --- | --- | --- | --- | --- |
| M0 Foundation | ✅ | `0001_init` | lib/config/theme/store/utils/types | web + admin scaffold |
| M1 User Mgmt & Auth | ✅ | `0002_user_management` | `features/auth` | web auth/profile/owner-onboarding |
| M2 Hostel Mgmt | ✅ | `0003_hostels` | `features/owner`, `api/adminHostelsApi` | web owner wizard, admin `/listings` |
| M3 Search & Filter | ✅ | `0004_search` | `features/student` (search) | web search + hostel detail |
| M4 Booking & Seats | ✅ | `0005_bookings` | `features/student`/`owner` (bookings) | web booking + my-bookings + owner bookings |
| M5 Requests & Offers | ✅ | `0006_requests` | `features/student`/`owner` (requests/offers) | web requests + owner offers feed |
| M6 Payments | ✅ | `0007_payments` | `api/paymentsApi` + `hooks/usePayments` | web booking payment panel + owner confirm |
| M7 Notifications | ✅ | `0008_notifications` | `api/notificationsApi` + realtime hooks | web bell + notifications page |
| M8 Messaging / Chat | ✅ | `0009_messaging` | `api/messagingApi` + realtime hooks | web conversations + chat |
| M9 Reviews & Moderation | ✅ | `0010_reviews` | `api/reviewsApi`/`reportsApi` | web reviews + report; admin `/reports` |
| M10 Community | ✅ | `0011_community` | `api/communityApi` | web saved hostels + Q&A |
| M11 Promotions | ✅ | `0012_promotions` | `api/promotionsApi` | owner promote flow + admin approve |
| M12 Recommendations | ⏳ next | `0013_recommendations` (planned) | `api/recommendationsApi` | "Recommended for you" |

> No git commits are made (see §7.1) — work lands in the working tree only.

- **M0 — Foundation & Scaffolding ✅** (per §10 playbook). Delivered:
  - Turborepo + npm workspaces monorepo (`dev`/`build`/`lint`/`type-check`); strict TS via
    `packages/config-ts`; shared ESLint flat config + Prettier in `packages/config-eslint`.
  - `packages/shared` (`@findyourhostel/shared`): Supabase **injection** (`initSupabase`/
    `getSupabase`), `toast` adapter, `queryKeys` roots, `theme/colors`, `config` (payment/
    promotion/seat constants + timing), `store/authStore` (Zustand), `utils` (format,
    apiError/`unwrap`, parseZodErrors, pricing breakdown), `types` (DB stub + helpers),
    feature-sliced `features/auth` with `getProfile`/`useProfile`. Subpath `exports` map.
  - `supabase/migrations/0001_init.sql`: extensions, `user_role` enum, `profiles` + signup
    trigger, `is_admin()`/`current_role()` RLS helpers, RLS on profiles, `hostel-images` &
    `payment-proofs` buckets + storage policies. `config.toml`, `seed.sql`, `db:types` script.
  - `apps/web` (Next.js App Router): `@supabase/ssr` browser/server clients + session
    middleware, Query + Auth providers (Auth syncs session → shared `authStore`), Tailwind v4,
    route groups `(auth)/(student)/(owner)`, `/api/health`, and a `profiles` smoke-test page.
  - `apps/admin` (Next.js): Radix + `cva`/`cn()` design-system trio + `react-table` dep,
    `Button` primitive, `AdminGuard`, dashboard shell + login.
  - `.env.example`, GitHub Actions CI. **Verified:** `turbo run lint type-check build` passes
    clean for all packages; web + admin both build.
  - Note: `@supabase/supabase-js` pinned to `2.45.4` (root `overrides`) — 2.108's new client
    generics broke typing against `@supabase/ssr` 0.5.2. Revisit when bumping `ssr`.

- **M1 — User Management & Auth ✅**. Delivered:
  - DB `0002_user_management.sql`: `owner_verification_status` enum, `owner_profiles` table
    (business + CNIC/ownership docs + status), `guard_owner_verification` trigger (owners can
    never set their own status; admin status-change stamps `reviewed_at`/`reviewed_by`), RLS,
    and a private `owner-documents` storage bucket + policies. `database.types.ts` stub extended.
  - Shared `features/auth`: zod schemas (register/login/forgot/reset/profile/ownerVerification);
    `authApi` (register, login, logout, sendPasswordReset, updatePassword); `ownerProfileApi`
    (getOwnerProfile, submitOwnerVerification — upsert, status forced `pending`); hooks
    (`useRegister/useLogin/useLogout/useForgotPassword/useResetPassword`, `useOwnerProfile/
    useSubmitOwnerVerification`) + extended query keys.
  - Web design-system primitives added (`cn`, Button, Input, Label, Field/Select, Card) using
    Radix + `cva` — the recommended baseline now applies to web too.
  - Web screens: `(auth)` group — signup (role picker), login, forgot-password, reset-password;
    `/auth/callback` route handler (code→session). `/profile` (view/edit + sign out). `(owner)`
    group — `/owner/onboarding` 2-step verification wizard with private-doc upload + status
    states (pending/approved/rejected/suspended), and `/owner` dashboard placeholder. Auth-aware
    home nav; `useRequireAuth` client gate; `lib/upload.ts` storage helper.
  - **Verified:** `turbo run type-check lint` clean; web builds all routes.
  - Owner doc URLs are stored as **private storage paths** (not public URLs); render later via
    signed URLs (deferred to where they're displayed, e.g. admin review in M13).

- **M2 — Hostel Management (Listings) ✅**. Delivered:
  - DB `0003_hostels.sql`: `hostel_type`(boys/girls/co_living), `seat_type`, `hostel_status`
    (draft/pending/verified/published/unpublished/rejected) enums; tables `hostels`,
    `seat_types`, `hostel_images`, `facilities` (+ seeded catalog) and `hostel_facilities`.
    `guard_hostel_status` trigger: only admins set verified/rejected (stamps `reviewed_*`);
    publishing gated on owner approved + hostel previously verified; submit stamps
    `submitted_at`. RLS (public sees `published`, owner sees own, admin all) with
    `can_read_hostel`/`can_write_hostel` helpers reused by child tables. Edit-lock on active
    bookings is **deferred to M4** (bookings don't exist yet). `database.types.ts` extended.
  - Shared `features/owner`: wizard zod schemas (basics/rooms/facilities&rules/pricing/media);
    `hostelsApi` (list/get-with-relations/create/update/delete + submit/publish/unpublish),
    `seatTypesApi` (replace = delete+insert), `imagesApi` (add/remove/set-cover, mirrors
    `cover_image_url`), `facilitiesApi`; hooks + `hostelKeys`. Cross-feature `api/
    adminHostelsApi` + `hooks/useHostelModeration` (pending/verify/reject/unpublish).
  - Web owner: `/owner` My-Hostels list (status badges + submit/publish/unpublish/delete),
    `/owner/hostels/new` and `/owner/hostels/[id]/edit` 5-step `HostelWizard` (creates a draft
    on leaving Pricing so Media has an id), `SeatTypeEditor`, public-image upload + cover
    picker. New web UI primitive `Textarea`; `uploadPublicImage` helper.
  - Admin: `/listings` verification queue (approve → verified / reject with reason); dashboard
    nav added.
  - **Verified:** `turbo run type-check lint build` clean; web 14 routes, admin incl.
    `/listings` build. (Fixed TS2742 portability by annotating Supabase client return types.)

- **M3 — Search & Filter ✅**. Delivered:
  - DB `0004_search.sql`: `search_hostels(...)` RPC over published listings — text/city/category/
    seat-type/price filters, **amenities AND-match**, cheapest-rent (discount-aware), haversine
    `distance_km`, and `price|distance|rating|relevance` sort; geo/status/seat indexes; granted
    to `anon`+`authenticated`. Function typing added to `database.types.ts`.
  - Shared `features/student`: `searchFilters` schema, types (`SearchHostelCard`, `PublicHostel`),
    `searchApi` (`searchHostels` via rpc, `getHostelPublic` — flattens facility join), hooks
    (`useSearchHostels` with `keepPreviousData`, `useHostelPublic`), `searchKeys`.
  - Web (public): `/search` — filters sidebar (text, near-a-location geocode, category, seat
    type, price, amenities, sort) + results list + **Leaflet/OSM map** (dynamic `ssr:false`,
    list/map toggle); `/hostels/[id]` detail — gallery, seat types with price breakdown, amenities,
    rules, single-marker location map, reviews placeholder, book-a-seat CTA (→ M4). New
    `useLocationSearch` (Nominatim) hook; home "Search hostels" CTA.
  - **Verified:** `turbo run type-check lint build` clean; web 15 routes incl. `/search` +
    `/hostels/[id]`. Map components are client-only (Leaflet needs `window`); images use
    `unoptimized` to avoid remote-domain config.
  - Search runs as a `security definer` RPC returning only `published` rows, so anonymous
    visitors can search without auth.

- **M4 — Booking & Seat Availability ✅**. Delivered:
  - DB `0005_bookings.sql`: `payment_method` + `booking_status` enums (full lifecycle, §5.8);
    `bookings` table with **server-side price snapshot** (occupancy/rent/discount/advance/
    balance/deposit are stamped by the `guard_booking` trigger from the seat type + hostel —
    client never sends prices). `guard_booking` also enforces students-book-for-themselves,
    published-only, derives the initial status from the payment method (cash →
    `pending_owner_confirmation`, online → `awaiting_advance`), blocks transitions students
    aren't allowed (cancel-only), and **guards overbooking** via `booking_consumes_seat(...)`.
    Live counts come from the `seat_availability(hostel_id)` RPC (granted to anon/auth).
    Added the **edit-lock deferred from M2**: `guard_seat_type_edit_lock` (locks rent/seats/
    occupancy/discount + blocks delete while seats are held) and `guard_hostel_delete_lock`.
    `expire_stale_bookings(hours)` auto-expires unconfirmed bookings. RLS: student sees/creates
    own, owner sees their hostels' bookings, admin all. `database.types.ts` extended.
  - Shared: `utils/bookings.ts` (status/method/seat labels, `bookingConsumesSeat`,
    `isCancellable`, `bookingStatusTone`); student slice — `createBookingSchema`, `bookingsApi`
    (`createBooking`/`cancelBooking`/`listStudentBookings`/`getBooking`/`getSeatAvailability`),
    hooks (`useCreateBooking`/`useCancelBooking`/`useStudentBookings`/`useBooking`/
    `useSeatAvailability`), `bookingKeys`; owner slice — `ownerBookingsApi`
    (`listOwnerBookings` + status transitions) and hooks (`useOwnerBookings`/`useConfirmBooking`/
    `useMarkMovedIn`/`useActivateBooking`/`useCompleteBooking`/`useRejectBooking`).
  - Web: `/hostels/[id]/book` confirm-booking screen (seat snapshot, live availability,
    price breakdown, payment method, terms) wired from the detail-page CTA; `/bookings`
    (My Bookings) + `/bookings/[id]` (detail + cancel); owner `/owner/bookings` management
    (confirm/reject/move-in/activate/complete). New `BookingStatusBadge`; nav links added.
  - **Verified:** `turbo run type-check lint build` clean; web 19 routes incl. the 4 new ones.
  - Pricing is enforced **server-side** (trigger snapshot) — the shared `computePriceBreakdown`
    is display-only. Online-payment proof submission (`advance_submitted`/`payment_pending_*`
    transitions) is intentionally left to the **Payments module (M6)**.

- **M5 — Requests & Offers ✅**. Delivered:
  - DB `0006_requests.sql`: `request_status` + `offer_status` enums (§5.8); `requests` table
    (student prefs: category/seat/city/institution/budget/move-in/notes + `accepted_offer_id`)
    and `offers` table (one per owner per request via `unique(request_id, owner_id)`, offered
    rent + optional hostel/seat). `guard_request` (students create own, status forced `open`);
    `guard_offer` (INSERT: approved owner, own hostel, open request, status `pending`; UPDATE:
    owner may only withdraw, the request's student may accept/reject). **`on_offer_accepted`**
    AFTER trigger: accepting marks the request `booked`, stamps `accepted_offer_id`, and
    **auto-rejects every other pending offer**. `expire_stale_requests(days)` for cleanup. RLS:
    student owns their requests/offers-on-them; any owner reads `open` requests; offer reads
    scoped so an owner only sees their own offer per request. `database.types.ts` extended.
  - Shared: request/offer labels + tones in `utils/bookings.ts`; student slice —
    `createRequestSchema`, `requestsApi` (`createRequest`/`listStudentRequests`/`getRequest`/
    `listRequestOffers`/`cancelRequest`/`cloneRequest`/`acceptOffer`/`rejectOffer`), hooks
    (`useStudentRequests`/`useRequest`/`useRequestOffers`/`useCreateRequest`/`useCancelRequest`/
    `useCloneRequest`/`useRespondToOffer`), `requestKeys`+`offerKeys`; owner slice —
    `submitOfferSchema`, `offersApi` (`listOpenRequests`/`listOwnerOffers`/`submitOffer`/
    `withdrawOffer`) and hooks (`useOpenRequests`/`useOwnerOffers`/`useSubmitOffer`/
    `useWithdrawOffer`).
  - Web: student `/requests` (list + live offer count), `/requests/new` (post), `/requests/[id]`
    (review offers, accept/decline, cancel, "Start a new request" clone); owner `/owner/requests`
    (open-requests feed with inline `SubmitOfferForm` + withdraw). New `RequestStatusBadge`/
    `OfferStatusBadge`; nav links added (student Requests, owner Requests).
  - **Verified:** `turbo run type-check lint build` clean; web 23 routes incl. the 4 new ones.
  - Cross-role profile reads are blocked by RLS, so requests are effectively **anonymous to
    owners** (area/budget/seat only) and offer lists join the hostel (not the student/owner
    profile). Accepting an offer books the request but does **not** yet create a `bookings`
    row — converting an accepted offer into a booking + advance is wired in **M6 (Payments)**.

- **M6 — Payments ✅**. Delivered:
  - DB `0007_payments.sql`: `payment_stage` (advance/balance) + `payment_status`
    (submitted/confirmed/rejected) enums; `payments` table (booking_id, payer, stage, amount,
    method, proof_url, status, confirmer) with a partial unique index `(booking_id, stage)
    where status <> 'rejected'` (one live payment per stage; rejected ones can be re-submitted).
    `guard_payment`: **amount snapshotted server-side** from the booking (advance = 20%;
    balance = 80% + deposit), only the booking's student submits, only the hostel owner/admin
    confirms/rejects. **`on_payment_change`** drives the booking lifecycle — advance
    submitted→`advance_submitted`, confirmed→`reserved`, rejected→`advance_rejected`; balance
    confirmed→`active`. `guard_booking` was **replaced** to also permit the student's
    advance-submission transition. RLS scopes payments to the student + hostel owner.
    Storage: `payment-proofs` re-scoped to `payment-proofs/<booking_id>/<file>` so the owner
    (not just the uploader) can read the screenshot. `database.types.ts` extended.
  - Shared (cross-feature): `api/paymentsApi` (`submitPayment`/`listBookingPayments`/
    `confirmPayment`/`rejectPayment`) + `hooks/usePayments` (`useBookingPayments`/
    `useSubmitPayment`/`useConfirmPayment`/`useRejectPayment`, `paymentKeys`); payment labels +
    `duePaymentStage`/`paymentStatusTone` in `utils/bookings.ts`.
  - Web: student booking detail `/bookings/[id]` now has a live **payment panel** (timeline +
    `PaymentForm` for the due stage with method picker + screenshot upload); owner
    `/owner/bookings` gained an `OwnerPaymentReview` (confirm/reject + signed-URL proof view).
    New `PaymentStatusBadge`; `getSignedUrl` storage helper.
  - **Verified:** `turbo run type-check lint build` clean; web builds (booking detail + owner
    bookings carry the payment UI).
  - Manual-confirmation model only (no gateway). Payments drive the booking status via the DB
    trigger, so the M4 owner "Confirm" button and payment confirmation can both reach
    `reserved`; the payment path is canonical for online bookings, the button for cash.

- **M7 — Notifications ✅**. Delivered:
  - DB `0008_notifications.sql`: `notification_type` enum (full union incl. `new_message`/
    `review_received` for M8/M9); `notifications` (user, type, title, body, `data` jsonb,
    is_read) and `push_tokens` tables. **`create_notification(...)`** is the single insertion
    point used by domain-event triggers: `notify_hostel_status` (verified→approved /
    rejected), `notify_booking` (created→owner, status→student, cancel→owner), `notify_offer`
    (created→student, accepted→owner), `notify_payment` (submitted→owner, confirmed/rejected→
    payer). RLS: users see/clear only their own; manage their own push tokens. Table added to
    the `supabase_realtime` publication for live inserts. `database.types.ts` extended.
  - Shared (cross-feature): `api/notificationsApi` (`fetchNotifications`/`fetchUnreadCount`/
    `markRead`/`markAllRead`/`registerPushToken`/`deactivatePushToken`); `hooks/useNotifications`
    (`useNotifications`/`useUnreadCount`/`useMarkNotificationRead`/`useMarkAllNotificationsRead`,
    `staleTime: 0`); `hooks/notificationCache` (`notificationKeys` + optimistic upsert/markRead);
    `hooks/useGlobalNotificationsRealtime` (Realtime → Query cache); `utils/notificationHref`
    (role-aware deep links).
  - Web: `NotificationBell` (unread badge + dropdown, in `HomeNav`), `/notifications` page
    (list + mark-all-read + **Enable push**), `NotificationsRealtime` mounted in `Providers`,
    and `lib/webPush.ts` (browser Notification API → mints `web:<userId>:<id>` token via the
    shared `registerPushToken`).
  - **Verified:** `turbo run type-check lint build` clean; web 21 routes incl. `/notifications`.
  - Notifications are generated **in Postgres** (triggers), never in app code. Out-of-app push
    **delivery** (DB webhook → web push / Expo) is infra and not wired here — tokens + the
    in-app realtime bell are. The bell lives in the landing `HomeNav`; per-surface headers can
    adopt it later.

- **M8 — Messaging / Chat ✅**. Delivered:
  - DB `0009_messaging.sql`: `conversations` (student/owner/optional hostel, per-participant
    pin flags, block flag + `blocked_by`, `last_message_at`; unique per student+owner+hostel)
    and `messages` tables. `guard_message` (sender must be a participant; **blocked
    conversations reject new messages**); `after_message_insert` bumps `last_message_at` and
    fires a **`new_message` notification** (M7) to the other party. RPCs (security definer,
    granted to authenticated): `get_or_create_conversation` (role-aware sides),
    `list_conversations` (other party's name + last message + unread count), `toggle_conversation_pin`,
    `set_conversation_block`, `mark_conversation_read`. RLS scopes rows to participants; a
    **`profiles` partner-select policy** lets conversation partners read each other's name
    (otherwise blocked cross-role). `messages` added to the `supabase_realtime` publication.
    `database.types.ts` extended (tables + 5 RPCs + `ConversationSummary`).
  - Shared (cross-feature): `api/messagingApi` (get-or-create/list/listMessages/send/markRead/
    pin/block) + `hooks/useMessaging` (`useConversations`/`useMessages`/`useSendMessage`/
    `useMarkConversationRead`/`useTogglePin`/`useSetBlock`/`useStartConversation`/
    **`useConversationRealtime`** → Query cache, `conversationKeys`).
  - Web: `/messages` (conversation list with pin + unread badges) and `/messages/[id]` (realtime
    thread, composer, block/unblock, auto mark-read); `MessageOwnerButton` on the hostel detail
    page starts/reuses a conversation; `Messages` nav link in `HomeNav`.
  - **Verified:** `turbo run type-check lint build` clean; web 23 routes incl. `/messages` + `/messages/[id]`.
  - Names are exposed **only** between conversation partners (via the scoped profiles policy);
    requests/offers remain anonymous. `list_conversations` is a `security definer` RPC so the
    cross-role name + unread aggregation works without widening table RLS.

- **M9 — Reviews & Moderation ✅**. Delivered:
  - DB `0010_reviews.sql`: `reviews` (one per booking via `unique(booking_id)`; overall +
    cleanliness/facilities/location/value 1–5, comment, owner_response; **`reviewer_name`
    snapshotted** so reviews are public without exposing student profiles); `reports`
    (`report_target_type` × `report_status` lifecycle) and `blocks` tables. `guard_review`
    enforces eligibility (the booking's student, status active/completed) on insert and splits
    edit rights on update (author edits content, hostel owner only responds).
    `recompute_hostel_rating` keeps `hostels.avg_rating`/`review_count` in sync **and fires a
    `review_received` notification** to the owner. `guard_report` stamps reporter + reviewer.
    RLS: reviews readable wherever the hostel is; reports seen by reporter/admin, updated by
    admin; blocks are per-user. `database.types.ts` extended.
  - Shared (cross-feature): `api/reviewsApi` (`createReviewSchema`, create/respond/listHostel/
    getForBooking) + `api/reportsApi` (`createReportSchema`, create/list/resolve, block/unblock);
    hooks `useReviews` (`useHostelReviews`/`useReviewForBooking`/`useCreateReview`/
    `useRespondToReview`, `reviewKeys`) and `useReports` (`useCreateReport`/`useReports`/
    `useResolveReport`, `reportKeys`).
  - Web: hostel detail shows the real **reviews list** (stars, owner responses, per-review
    report) + "Report this listing"; student booking detail `/bookings/[id]` shows a
    **ReviewForm** for active/completed stays (or the posted review). New `Stars`/`StarInput`,
    `ReviewForm`, `HostelReviews`, `ReportButton` components.
  - Admin: `/reports` moderation queue (status filter + resolve/dismiss); nav entry added.
  - **Verified:** `turbo run type-check lint build` clean; web 23 routes, admin incl. `/reports`.
  - Reviewer names are **denormalized onto the review** (not joined) so public review lists
    never need student-profile read access. Reviews drive the hostel rating via trigger, so
    `avg_rating`/`review_count` (surfaced by M3 search) are now live.

- **M10 — Community ✅**. Delivered:
  - DB `0011_community.sql`: `saved_hostels` (private shortlist, pk student+hostel),
    `community_posts` (+ `community_topic` enum, `is_anonymous`, denormalized
    `like_count`/`reply_count`), `community_replies`, `post_likes` (pk post+user).
    `stamp_community_author` snapshots `author_name` (null when anonymous) so the feed needs
    no profile reads; `bump_reply_count`/`bump_like_count` keep the denormalized counters in
    sync. RLS: saved hostels + likes strictly private; posts/replies readable by any signed-in
    user, written/edited by the author (admin can moderate). `database.types.ts` extended.
  - Shared (cross-feature): `api/communityApi` (saved: list/ids/setHostelSaved; Q&A:
    `createPostSchema`, list/get/create posts, list/reply, togglePostLike) + `hooks/useCommunity`
    (`useSavedHostels`/`useSavedHostelIds`/`useToggleSaved`, `useCommunityPosts`/`useCommunityPost`/
    `usePostReplies`/`useCreatePost`/`useReplyToPost`/`useTogglePostLike`, `savedKeys`+`communityKeys`).
  - Web: `SaveButton` on the hostel detail (shortlist toggle); `/saved` shortlist page; `/community`
    feed (topic filter, like, inline "Ask a question" composer); `/community/[id]` post detail with
    replies + composer (anonymous option). Nav links added (Saved, Community).
  - **Verified:** `turbo run type-check lint build` clean; web 26 routes incl. `/saved`,
    `/community`, `/community/[id]`.
  - "Liked by me" is read by embedding `post_likes(user_id)` — RLS scopes it to the caller, so a
    post carries only the viewer's like row; `like_count`/`reply_count` stay denormalized on the
    post (kept correct by triggers). Author names are snapshotted like reviews to avoid
    cross-role profile reads.

- **M11 — Promotions ✅**. Delivered:
  - DB `0012_promotions.sql`: `promotion_plan` (1/3/7/30d) + `promotion_status`
    (pending/active/rejected/expired) enums; `promotions` table (plan, payment proof, window,
    impressions/clicks). `guard_promotion` — owner submits on own hostel (status `pending`);
    **admin approve starts the timer** (`starts_at`/`expires_at = now()+plan days`) → `active`,
    reject stamps reviewer. `expire_promotions()` job + `track_promotion_event(hostel,event)`
    RPC (anon-callable). **`search_hostels` replaced** to add an `is_featured` flag (active
    promotion within window) and **order featured first**. RLS: owner sees own, admin all.
    Storage: added owner-folder read/write policies on `payment-proofs` (OR-combined with the
    M6 booking-scoped ones) so owners can upload promo proofs under `payment-proofs/<owner>/…`.
    `database.types.ts` extended (table + 2 enums + RPC + search `is_featured`).
  - Shared (cross-feature): `api/promotionsApi` (`createPromotionSchema`, create/listOwner/
    listPending/approve/reject/`trackPromotionEvent`) + `hooks/usePromotions`
    (`useOwnerPromotions`/`useCreatePromotion`/`usePendingPromotions`/`useApprovePromotion`/
    `useRejectPromotion`, `promotionKeys`); plan/status labels + tone in `utils/bookings.ts`.
  - Web: owner `/owner/promotions` (plan picker + payment proof upload + promotion list with
    views/clicks); search result cards show a **Featured** badge and track a click on open.
    Admin `/promotions` approval queue (approve/reject + signed-URL proof view); nav entries added.
  - **Verified:** `turbo run type-check lint build` clean; web 25 routes, admin incl. `/promotions`.
  - Featured ranking is computed live inside the `security definer` `search_hostels` RPC (active
    + within window), so expiry needs no cron to affect ranking. `PromotionPlan` stays sourced
    from shared `config` (not re-exported from `types`) to avoid a duplicate root export.

---

## 9. Project roadmap (implementation plan)

Complete, build-ready plan for **Find Your Hostel** (roles: **Student · Hostel Owner ·
Admin**). Organized as: global breakdown → per-module detail → database tables → APIs →
frontend screens → development order.

### 9.0 Module map (build order at a glance)

| # | Module | Depends on |
| --- | --- | --- |
| M0 | Foundation & Scaffolding | — |
| M1 | User Management & Auth | M0 |
| M2 | Hostel Management (Listings) | M1 |
| M3 | Search & Filter | M2 |
| M4 | Booking & Seat Availability | M2, M3 |
| M5 | Requests & Offers | M2, M4 |
| M6 | Payments | M4, M5 |
| M7 | Notifications | M1 (then woven into M4–M12) |
| M8 | Messaging / Chat | M1, M7 |
| M9 | Reviews & Moderation | M4, M6 |
| M10 | Community (Saved + Q&A) | M1, M7 |
| M11 | Promotions | M2, M6, M13 |
| M12 | Recommendations | M2, M3, M4 |
| M13 | Web Admin Panel | M1–M11 (incremental) |
| M14 | Mobile App (Phase 2) | all shared logic |

---

### M0 — Foundation & Scaffolding
**Scope:** Monorepo, Supabase project, shared package, providers, design system, CI baseline.
**User stories:**
- As a developer, I can run `turbo run dev` and start web + admin locally.
- As a developer, shared hooks/types are importable from `@findyourhostel/shared`.

**Backend tasks:**
- Create Supabase project; set up `supabase/migrations/0001_init.sql` (extensions, enums).
- `initSupabase`/`getSupabase` injection; generate `database.types.ts`.
- Base RLS scaffolding + helper functions; Storage buckets (`hostel-images`, `payment-proofs`).

**Frontend tasks:**
- npm workspaces + Turborepo + strict TS; scaffold `apps/web`, `apps/admin`, `packages/shared`.
- `QueryClientProvider` + auth provider pushing Supabase auth into shared `authStore`.
- Design system: Tailwind + Radix + `cva`/`cn()`, shared `theme/colors`.

**Dependencies:** none.

---

### M1 — User Management & Auth
**Scope:** Registration, login, sessions, roles, profiles, owner verification gate.
**User stories:**
- As a visitor, I can register as a Student or Hostel Owner and log in.
- As an owner, I can submit verification documents and see my approval status.
- As any user, I can view/edit my profile.

**Backend tasks:**
- `profiles` table (role, name, phone, gender, institution, avatar) on top of Supabase Auth.
- `owner_profiles` (business name, CNIC, docs, status) + verification status enum.
- RLS: users edit own profile; admins manage all. Trigger: create `profiles` row on signup.
- API: `register`, `login`, `getProfile`, `updateProfile`, `submitOwnerVerification`.

**Frontend tasks:**
- Auth screens (sign up with role, login, forgot password), profile page, owner onboarding
  wizard, "verification pending" state.

**Dependencies:** M0.

---

### M2 — Hostel Management (Listings)
**Scope:** Owners create/manage hostels, seat types, facilities, images; admin verification.
**User stories:**
- As an owner, I can create a hostel via a 5-step wizard and submit it for verification.
- As an owner, I can edit/unpublish my hostel (respecting the edit-lock).
- As an owner, I can manage seat types and their prices/capacity.

**Backend tasks:**
- Tables: `hostels`, `seat_types`, `hostel_images`, `facilities` + `hostel_facilities`.
- Enums: `hostel_type` (boys/girls/mixed), `hostel_status` (draft/pending/verified/published/unpublished).
- RLS: owners CRUD own hostels; public reads only `published`. Edit-lock enforced via trigger
  when active bookings exist.
- API: `createHostel`, `updateHostel`, `deleteHostel`, `listOwnerHostels`, `getHostel`,
  CRUD for seat types/images.

**Frontend tasks:**
- Owner dashboard (my hostels), 5-step create/edit wizard, seat-type manager, image uploader,
  "Fully Booked"/status badges.

**Dependencies:** M1.

---

### M3 — Search & Filter
**Scope:** Public discovery by proximity, price, seat type, gender, amenities; map + list.
**User stories:**
- As a student, I can search hostels near my institution and filter results.
- As a student, I can view results on a map and open a hostel detail page.

**Backend tasks:**
- Search query (Postgres function / RPC) with filters + sorting (relevance, price, distance).
- Geo distance using lat/lng; index on location + status.
- API: `searchHostels(filters)`, `getHostelPublic(id)`.

**Frontend tasks:**
- Search page (filters sidebar, list + Leaflet map view), hostel detail page (seat types,
  facilities, reviews, location), `useLocationSearch` hook.

**Dependencies:** M2.

---

### M4 — Booking & Seat Availability
**Scope:** Per-seat bookings, live capacity, lifecycle/statuses, expiry.
**User stories:**
- As a student, I can book a seat in a chosen seat type with a move-in date.
- As a student, I can track and cancel my bookings.
- As an owner, I can confirm/reject and see bookings for my hostels.

**Backend tasks:**
- Tables: `bookings` (+ status enum from §5.8). Seat-count view; **DB-level overbooking guard**.
- Triggers: decrement availability, auto-expire unconfirmed past move-in, notify on changes.
- API: `createBooking`, `cancelBooking`, `confirmBooking`, `listStudentBookings`,
  `listOwnerBookings`, `getBooking`.

**Frontend tasks:**
- Confirm-booking screen (seat type, dates, price breakdown, payment method), My Bookings
  (tabs), booking detail, owner bookings management.

**Dependencies:** M2, M3.

---

### M5 — Requests & Offers
**Scope:** Student posts a request; owners send offers; accept auto-rejects the rest.
**User stories:**
- As a student, I can post a hostel request and review incoming offers.
- As an owner, I can browse open requests and submit one offer.
- As a student, accepting an offer books it and rejects the others.

**Backend tasks:**
- Tables: `requests`, `offers` (+ status enums). Trigger: on accept → request `booked`,
  advance due, **auto-reject other offers**. "Clone request" helper.
- API: `createRequest`, `listOpenRequests`, `submitOffer`, `acceptOffer`, `withdrawOffer`,
  `cloneRequest`.

**Frontend tasks:**
- Create-request wizard, my-requests + offers list, owner "open requests" feed + submit-offer
  form, accept/reject UI.

**Dependencies:** M2, M4.

---

### M6 — Payments
**Scope:** Advance + balance/deposit, manual confirmation (transfer+screenshot / cash).
**User stories:**
- As a student, I can pay the advance and upload proof, then the balance at move-in.
- As an owner, I can review and confirm/reject payments.

**Backend tasks:**
- Table: `payments` (stage advance/balance, amount, method, screenshot_url, status, reason).
- Compute advance (20%) / balance (80% + deposit); triggers to advance booking status.
- Storage policy for `payment-proofs`. API: `submitPayment`, `confirmPayment`,
  `rejectPayment`, `listBookingPayments`.

**Frontend tasks:**
- Payment screen (owner details, upload screenshot), payment status timeline, owner
  confirm/reject UI. (Gateway integration = future toggle.)

**Dependencies:** M4, M5.

---

### M7 — Notifications
**Scope:** In-app (realtime) + push, generated by DB triggers. (See §4.13.)
**User stories:**
- As any user, I get a bell badge + push for relevant events and can deep-link to them.

**Backend tasks:**
- Tables: `notifications`, `push_tokens`. Triggers on domain events; DB webhook for push.
- API: `fetchNotifications`, `markRead`, `markAllRead`, `registerPushToken`, `deactivateToken`.

**Frontend tasks:**
- `NotificationBell` + dropdown, notifications page, realtime subscription hook, web-push
  registration + role-aware routing.

**Dependencies:** M1 (then events added as M4–M12 land).

---

### M8 — Messaging / Chat
**Scope:** Context-bound student↔owner conversations, realtime, blocking.
**User stories:**
- As a student/owner, I can chat about a hostel, offer, or booking.

**Backend tasks:**
- Tables: `conversations`, `messages`. Trigger: `new_message` notification. RLS to participants.
- API: `getOrCreateConversation`, `sendMessage`, `listConversations`, `listMessages`,
  `pinConversation`, `blockConversation`.

**Frontend tasks:**
- Conversations list, chat thread (realtime), pin/block controls, message composer.

**Dependencies:** M1, M7.

---

### M9 — Reviews & Moderation
**Scope:** Hostel reviews + ratings, owner responses, reports, blocking.
**User stories:**
- As a student, after a stay I can review a hostel; the owner can respond.
- As any user, I can report content; as an admin, I can resolve reports.

**Backend tasks:**
- Tables: `reviews` (multi-criteria ratings), `reports`, `blocks`. De-dupe per booking;
  recompute hostel average rating via trigger.
- API: `createReview`, `respondToReview`, `listHostelReviews`, `createReport`,
  `resolveReport`, `blockTarget`.

**Frontend tasks:**
- Review form + display on hostel page, owner response UI, report dialog, (admin reports in M13).

**Dependencies:** M4, M6.

---

### M10 — Community (Saved hostels + Q&A)
**Scope:** Private shortlist; student Q&A posts with replies/likes.
**User stories:**
- As a student, I can save hostels and ask/answer community questions.

**Backend tasks:**
- Tables: `saved_hostels`, `community_posts`, `community_replies`, `post_likes`.
- API: `toggleSaved`, `listSaved`, `createPost`, `listPosts`, `replyToPost`, `togglePostLike`.

**Frontend tasks:**
- Saved-hostels page, community feed, post detail + nested replies, create-post form.

**Dependencies:** M1, M7.

---

### M11 — Promotions
**Scope:** Owners pay to feature listings; admin approves; ranked higher in search.
**User stories:**
- As an owner, I can buy a featured plan; as an admin, I approve/reject it.

**Backend tasks:**
- Table: `promotions` (plan, screenshot, status, starts/expires, impressions, clicks).
- Trigger: on approve, set timer/expiry → `active`. Search ranking boost for active.
- API: `createPromotion`, `approvePromotion`, `rejectPromotion`, `trackImpression/Click`.

**Frontend tasks:**
- Owner "promote" flow (plan picker + payment proof), active-promotion status; admin approval
  queue (M13).

**Dependencies:** M2, M6, M13.

---

### M12 — Recommendations
**Scope:** Suggest hostels from preferences + history.
**User stories:**
- As a student, I see recommended hostels relevant to me.

**Backend tasks:**
- `recommendations` logic (rule-based first: institution, budget, seat type, saved/viewed).
- API: `getRecommendations(userId)`.

**Frontend tasks:**
- "Recommended for you" section on home/search.

**Dependencies:** M2, M3, M4.

---

### M13 — Web Admin Panel (`apps/admin`)
**Scope:** Internal app to run the platform (see §5.10). Built incrementally alongside M1–M11.
**User stories:**
- As an admin, I can verify owners/listings, manage users, moderate content, approve
  promotions, resolve reports, and monitor bookings via dashboards.

**Backend tasks:**
- Admin-only RLS/policies + route guards; `activity_logs`; admin RPCs for approve/reject/
  suspend/verify/resolve.

**Frontend tasks:**
- Admin shell + auth; pages: Dashboard (KPIs), Owners, Listings, Users, Bookings, Promotions,
  Reports, Content (reviews/posts), Messaging oversight. Radix + `@tanstack/react-table` +
  `recharts`.

**Dependencies:** M1–M11 (each admin page lands as its module does).

---

### M14 — Mobile App (Phase 2)
**Scope:** Expo app reusing all shared logic; only screens are new.
**Backend tasks:** none new — reuse shared hooks/types/schemas; mobile Supabase client +
`expo-secure-store`; Expo push tokens.
**Frontend tasks:** expo-router shells `(auth)/(student)/(owner)`, port screens, Leaflet map
in `react-native-webview`, push deep-link router.
**Dependencies:** all shared logic from M1–M12.

---

### 9.1 Database tables (full list)

| Table | Purpose |
| --- | --- |
| `profiles` | user record + role (extends Supabase Auth) |
| `owner_profiles` | owner business details + verification status |
| `hostels` | hostel listings |
| `seat_types` | per-occupancy rent + capacity (Single/Double/Triple/Quad/Dorm) |
| `hostel_images` | gallery + cover |
| `facilities` / `hostel_facilities` | amenities catalog + join |
| `bookings` | per-seat bookings + lifecycle status |
| `payments` | advance/balance payments + proof + status |
| `requests` | student hostel requests |
| `offers` | owner offers on requests |
| `reviews` | hostel ratings + owner response |
| `saved_hostels` | student shortlist |
| `community_posts` / `community_replies` / `post_likes` | Q&A community |
| `conversations` / `messages` | chat |
| `notifications` / `push_tokens` | notifications + push delivery |
| `promotions` | featured-listing purchases |
| `reports` / `blocks` | trust & safety |
| `activity_logs` | admin/audit trail |

### 9.2 API surface (shared `api/` functions, grouped)

- **Auth/Profile:** register, login, getProfile, updateProfile, submitOwnerVerification
- **Hostels:** create/update/delete/getHostel, listOwnerHostels, searchHostels, getHostelPublic, seat-type & image CRUD
- **Bookings:** createBooking, cancel/confirmBooking, list (student/owner), getBooking
- **Requests/Offers:** createRequest, listOpenRequests, submitOffer, acceptOffer, withdrawOffer, cloneRequest
- **Payments:** submitPayment, confirm/rejectPayment, listBookingPayments
- **Reviews/Reports:** createReview, respondToReview, listHostelReviews, createReport, resolveReport, blockTarget
- **Messaging:** getOrCreateConversation, sendMessage, list conversations/messages, pin/block
- **Community:** toggleSaved, listSaved, createPost, listPosts, replyToPost, togglePostLike
- **Notifications:** fetchNotifications, markRead, markAllRead, registerPushToken, deactivateToken
- **Promotions:** createPromotion, approve/rejectPromotion, trackImpression/Click
- **Admin:** approve/reject/suspendOwner, verifyListing, manageUser, dashboardStats
- **Recommendations:** getRecommendations

> Most reads/writes go directly through the Supabase client (secured by RLS) inside these
> shared functions; Next.js route handlers / Server Actions are used where server-only logic
> or secrets are needed (e.g. push webhook, presigned uploads).

### 9.3 Frontend screens

**Public website (`apps/web`)**
- Auth: Sign up (role), Login, Forgot password
- Student: Home/recommended, Search (list + map), Hostel detail, Confirm booking, My bookings,
  Booking detail, Payment, Create request, My requests + offers, Saved hostels, Community feed
  + post detail, Profile, Notifications, Chat
- Owner: Owner dashboard, Create/edit hostel wizard, Seat-type manager, My hostels, Bookings
  management, Open requests + submit offer, Payments review, Promotions, Profile, Chat

**Admin panel (`apps/admin`)**
- Login, Dashboard (KPIs), Owners, Listings (verify), Users, Bookings, Promotions (approve),
  Reports, Content moderation (reviews/posts), Messaging oversight

**Mobile (`apps/mobile`, Phase 2)** — mirrors the student & owner screens above.

### 9.4 Development order (sprints)

1. **Sprint 0 — Foundation:** M0 (monorepo, Supabase, shared, providers, design system).
2. **Sprint 1 — Auth & profiles:** M1 + admin shell start (M13 login/dashboard).
3. **Sprint 2 — Listings:** M2 + admin Owners/Listings verification.
4. **Sprint 3 — Discovery:** M3 (search/filter, hostel detail, maps).
5. **Sprint 4 — Booking:** M4 (per-seat booking + capacity + statuses).
6. **Sprint 5 — Payments:** M6 (advance/balance, manual confirm).
7. **Sprint 6 — Requests & Offers:** M5.
8. **Sprint 7 — Notifications & Chat:** M7 + M8 (weave notifications into prior modules).
9. **Sprint 8 — Reviews & Community:** M9 + M10 + admin moderation.
10. **Sprint 9 — Promotions & Recommendations:** M11 + M12 + admin promotions queue.
11. **Sprint 10 — Hardening:** RLS audit, edge cases, analytics, polish, launch web.
12. **Phase 2 — Mobile:** M14 (Expo app reusing shared logic).

---

## 10. Step 1 — Project scaffold (senior-dev playbook)

> **This is the first thing to build (M0).** As a senior developer, the goal of the scaffold
> is *not* features — it's a **correct, reusable foundation**: a monorepo where the shared
> core is platform-agnostic, types flow from the database, and every app boots through the
> same providers. Get this right and every later module is "just" a vertical slice.

### 10.1 Principles for the scaffold
- **Thin apps, fat shared core.** Apps render; `packages/shared` owns logic. Enforce from day one.
- **Types flow from the DB.** Generate `database.types.ts` from Supabase; never hand-write row types.
- **One way to do things.** One QueryClient setup, one auth provider, one Supabase-injection
  pattern, one design-system primitive set — established now, copied forever.
- **Web-first, mobile-ready.** Don't add `apps/mobile` yet, but keep the shared core free of
  DOM/RN so mobile drops in later with zero logic changes.
- **Make the foundation verifiable.** The scaffold is "done" only when `dev`, `build`,
  `lint`, and `type-check` all pass and one trivial end-to-end read works.

### 10.2 Prerequisites
- Node LTS (pin via `.nvmrc`), npm (workspaces), Git.
- Accounts: **Supabase** (project), **Vercel** (web + admin hosting later).
- Supabase CLI installed; `supabase login`.

### 10.3 Step-by-step

**1) Initialize the monorepo**
- `git init`; add `.gitignore`, `.nvmrc`, `.editorconfig`.
- Root `package.json` with `"private": true` and workspaces `["apps/*", "packages/*"]`.
- Add **Turborepo** (`turbo.json`) with `dev` (persistent, non-cached), `build`, `lint`,
  `type-check` (chained via `dependsOn: ["^build"]`).

**2) Shared tooling/config packages**
- `packages/config-ts` → base `tsconfig.base.json` (strict) extended by every app/package.
- `packages/config-eslint` + Prettier config, shared across the repo.

**3) Scaffold `packages/shared` (the core) — empty but structured**
- `npm init` the package as `@findyourhostel/shared`.
- Create the feature-sliced folders (see §3): `api/ config/ features/ hooks/ lib/ queries/
  services/ theme/ types/ utils/`.
- Add the `exports` map exposing each slice (e.g. `@findyourhostel/shared/features/student/hooks`).
- Implement the **Supabase injection** (`lib/supabase.ts`: `initSupabase`/`getSupabase`),
  a shared `lib/toast.ts` abstraction, and `theme/colors.ts` design tokens.

**4) Supabase backend baseline**
- `supabase init`; create `supabase/migrations/0001_init.sql` (extensions, enums, `profiles`
  + the signup trigger, base RLS helpers).
- Create Storage buckets: `hostel-images`, `payment-proofs` (with policies).
- Add script `db:types` → `supabase gen types typescript` → `packages/shared/src/types/database.types.ts`.

**5) Scaffold `apps/web` (Next.js App Router)**
- `create-next-app` (TS, App Router, Tailwind) into `apps/web`.
- `src/lib/` Supabase clients via `@supabase/ssr` (browser + server).
- `src/providers/`: `QueryClientProvider` + an **auth provider** that calls `initSupabase()`
  and pushes Supabase auth changes into the shared `authStore`.
- Route groups: `app/(auth)`, `app/(student)`, `app/(owner)`, `app/api`.

**6) Scaffold `apps/admin` (Next.js + design system)**
- Second Next.js app; add Radix primitives + `cva` + `cn()` (clsx + tailwind-merge) and
  `@tanstack/react-table`. Reuse the same providers + shared core.
- Admin-only auth guard + an empty Dashboard route.

**7) Environment & secrets**
- `.env.example` (committed) + `.env.local` per app: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.

**8) Design system base**
- `cn()` util, base UI primitives (Button, Input, Dialog, Card, Toast) using the shared theme.

**9) CI baseline**
- GitHub Actions: install → `turbo run lint type-check build` on PRs.

**10) Smoke-test the vertical wiring**
- Add a trivial `profiles` read through a shared `api/` fn + a React Query hook rendered on
  one web page — proves Supabase injection, types, query client, and RLS all work end-to-end.

### 10.4 Resulting structure (after scaffold)
```text
find-your-hostel/
├─ package.json  turbo.json  .nvmrc  .editorconfig  .gitignore
├─ apps/
│  ├─ web/    (Next.js App Router + providers + supabase ssr clients)
│  └─ admin/  (Next.js + Radix + react-table)
├─ packages/
│  ├─ shared/        (@findyourhostel/shared — injection, theme, empty feature slices)
│  ├─ config-ts/     (tsconfig.base.json)
│  └─ config-eslint/ (eslint + prettier)
└─ supabase/
   └─ migrations/0001_init.sql
```

### 10.5 Definition of done (scaffold)
- [ ] `npm install` at root wires all workspaces; `@findyourhostel/shared` imports resolve.
- [ ] `turbo run dev` boots **web** and **admin** locally.
- [ ] `turbo run lint type-check build` passes clean.
- [ ] Supabase project linked; `0001_init.sql` applied; `database.types.ts` generated.
- [ ] `initSupabase()` called once per app; shared `getSupabase()` works in both.
- [ ] Auth provider syncs Supabase session → shared `authStore`.
- [ ] Smoke-test page reads `profiles` via a shared hook (RLS enforced).
- [ ] `.env.example` documented; secrets out of git.

> Once every box is checked, the foundation (M0) is complete — proceed to **M1 (Auth &
> Users)** in §9 and build each subsequent module as a vertical slice.
