# Landing Page Plan — Find Your Hostel (`landing-plan.md`)

> **Role:** Senior product designer + creative front-end engineer.
> **Goal:** Replace the current thin home page with a **best-practice marketing landing page** —
> the front door of the product. It must make a strong *first impression* (clear value in 5
> seconds), earn trust, and drive one obvious next step: **Get started**. It doubles as the app's
> **main page** (`/`) — signed-out visitors land here; signed-in users get a personalized variant.
>
> **Scope:** the public landing surface only (`apps/web/src/app/page.tsx` + a new `(marketing)`
> shell + new marketing section components). **Reuses the existing Wonderlist design system**
> (`designer.md`) and the shared data layer — **no new business logic, no schema changes.**
> Plan only — nothing is implemented in this doc. No git commits (§7.1). Document as we build (§7.2).

---

## 1. Why the current page isn't enough

The current `/` (`apps/web/src/app/page.tsx`) is functional but minimal: a slim nav, one hero card,
a 3-step "how it works" grid, and the `RecommendedRow`. It's a fine *app home* but a weak *landing
page*:

- **No audience split.** Two very different users arrive here — **students** (find a seat) and
  **owners** (list a hostel). The page speaks mostly to students; owners have to guess.
- **Weak proof / trust.** For a marketplace where people send money to strangers, there's no trust
  layer (verification, how payments work, safety) above the fold — the flow-audit flagged trust as
  critical for this audience.
- **One flat section rhythm.** No narrative: problem → solution → how → proof → reassurance → CTA.
- **CTA is not reinforced.** A single hero CTA, never repeated; best practice is a **primary CTA
  above the fold and again at the end**, with one consistent label.
- **Public pages render inside the student app shell** (noted as a redesign follow-up) — the
  landing should sit in its own **marketing shell**, not the sidebar app frame.

First impression is the last impression — this plan fixes all five.

---

## 2. Principles (industry best practice, applied here)

1. **5-second clarity.** Above the fold answers *what is this, who's it for, what do I do next* —
   headline + subhead + primary CTA, no scrolling required.
2. **One primary action per view.** **Get started** is the single visually-dominant CTA
   (solid terracotta pill). Everything else (Search hostels, Sign in, List your hostel) is
   secondary (outline/ghost). Never two solid buttons competing.
3. **Benefits before features.** Say "Book a verified seat with a small deposit" not "per-seat
   booking engine". Mirror the flow-audit plain-language word list (deposit, approved, room type).
4. **Show, don't just tell.** A product visual (search/map mock or real screenshot) beats a wall of
   text. Real UI > stock photography.
5. **Trust is a section, not a footnote.** Verification, refundable deposit, direct owner payment,
   report/block — surfaced explicitly.
6. **Dual-audience, one page.** A clear **"For students / For owners"** split so each self-selects
   without a second page.
7. **Progressive disclosure & rhythm.** Short, scannable sections with generous whitespace
   (`designer.md §4` spacing rhythm), each with its own single focus.
8. **Accessible by default.** Semantic landmarks, one `<h1>`, visible focus, 4.5:1 contrast,
   44px touch targets (already standardized via `coarse:` in the responsive pass), reduced-motion
   respected.
9. **Fast & SSR-friendly.** Mostly a **server component** (static, cacheable); only the auth-aware
   nav + personalized row are client. No heavy hero libraries; system font stack already loaded.
10. **On-brand.** Warm cream & terracotta tokens only — no raw hex, no new colors. Light + dark.

---

## 3. Audience & the primary action

| Visitor | Their job-to-be-done | Primary CTA | Secondary |
|---|---|---|---|
| **Student (signed-out)** | Find a hostel near their college | **Get started** (→ `/signup`) | **Search hostels** (→ `/search`, browse without account) · Sign in |
| **Owner (signed-out)** | List a hostel, get bookings | **List your hostel** (→ `/signup?role=owner`) | See how it works |
| **Returning (signed-in)** | Resume | Personalized: **Search hostels** / **Owner dashboard** | Recommended row |

**CTA rule:** the hero and the closing band both show **Get started** as the single solid pill.
"Search hostels" is offered as a low-commitment path (browse first — reduces sign-up friction, a
proven marketplace pattern). "Sign in" lives quietly in the nav.

> Decision to confirm during build: **primary hero CTA label** — "Get started" (recommended, role-
> agnostic) vs "Find a hostel" (student-first). Default to **Get started** with a role split just
> below the fold.

---

## 4. Page anatomy (section-by-section)

Narrative order = a mini sales funnel. Each section has **one** focus.

```
┌───────────────────────────────────────────────────────────┐
│ 0. Marketing top bar  [logo]         Sign in · Get started │  sticky, slim, blurred
├───────────────────────────────────────────────────────────┤
│ 1. HERO                                                    │
│    eyebrow: Student hostel marketplace                     │
│    H1: Find a verified hostel seat near your campus        │
│    sub: Search, book a seat with a small deposit, or ask   │
│         hostels to send you offers.                        │
│    [ Get started ]  [ Search hostels ]                     │  1 solid + 1 outline
│    trust strip: ✓ Verified owners · ✓ Refundable deposit  │
│                 · ✓ Free to browse                         │
│    illustration: product mock (search list + map)         │  right / below on mobile
├───────────────────────────────────────────────────────────┤
│ 2. AUDIENCE SPLIT   [ For students ]   [ For owners ]      │  two cards, each its own CTA
├───────────────────────────────────────────────────────────┤
│ 3. HOW IT WORKS  (3 steps, student)  1 → 2 → 3            │  reuse current STEPS, plainer copy
├───────────────────────────────────────────────────────────┤
│ 4. TRUST & SAFETY  (verify · deposit · direct pay · report)│  4 tiles, the money-fear killer
├───────────────────────────────────────────────────────────┤
│ 5. TWO WAYS TO BOOK  (Book directly  |  Ask hostels)      │  names the two paths (flow-audit C8)
├───────────────────────────────────────────────────────────┤
│ 6. FOR OWNERS  (list, get verified, manage, boost)        │  owner-focused benefit band + CTA
├───────────────────────────────────────────────────────────┤
│ 7. SOCIAL PROOF  (stats / testimonial placeholder)        │  optional, honest — see §7 note
├───────────────────────────────────────────────────────────┤
│ 8. FAQ  (5–6 Q&A, plain language)                          │  handles objections, SEO
├───────────────────────────────────────────────────────────┤
│ 9. CLOSING CTA BAND   H2 + [ Get started ]                │  repeat the one action
├───────────────────────────────────────────────────────────┤
│ 10. FOOTER  (links, roles, legal, theme toggle)           │
└───────────────────────────────────────────────────────────┘
```

**Signed-in variant:** collapse §1 into a compact "Welcome back" hero (primary = Search hostels or
Owner dashboard by role), keep `RecommendedRow` (students), and hide the marketing mid-sections (or
show a slim strip). One page, two states.

### Section detail

- **§0 Marketing bar** — reuse the existing slim header + `HomeNav` (already auth-aware; signed-out
  shows *Sign in* / *Get started*). Add the theme toggle. Sticky, `z-30`, backdrop blur.
- **§1 Hero** — the only `<h1>`. Eyebrow (uppercase tracked, `text-primary`), bold tracking-tight
  headline (`text-4xl sm:text-5xl`), one-line muted subhead, the CTA pair, and a **trust strip**
  (three check items). Right side / below on mobile: a **product illustration** — start with a
  clean CSS/`Panel` mock of the search list+map (no new asset needed); can swap to a real screenshot
  later. Soft large shadow (`designer.md §4`).
- **§2 Audience split** — two big `Panel` cards side by side (`sm:grid-cols-2`): *For students*
  (Search hostels) and *For owners* (List your hostel). Lets each visitor self-route in one click.
- **§3 How it works** — reuse current 3-step grid; rewrite copy to the plain word list
  ("book a seat with a small deposit", "ask hostels and offers come to you"). Numbered 1·2·3.
- **§4 Trust & safety** — 4 tiles: **Verified owners & listings**, **Refundable deposit**,
  **Pay the owner directly** (we never hold your money), **Report & block**. This is the highest-
  leverage *new* section for a low-trust, money-sensitive audience (flow-audit §7.4).
- **§5 Two ways to book** — two labelled columns: **Book a listed seat** vs **Ask hostels for
  offers** — names + cross-links the two paths (closes flow-audit C8 on the marketing surface too).
- **§6 For owners** — benefit band (list in a 5-step wizard, get approved, manage bookings &
  payments, **Boost** to rank higher) + owner CTA. Balances the student-heavy top.
- **§7 Social proof** — **honest only.** No fake numbers/testimonials. If real stats exist (live
  listings/cities), show them via a small server fetch; otherwise ship a founder-credible line
  ("Built for students in Pakistan") and leave a slot. Flagged, not faked.
- **§8 FAQ** — 5–6 plain Q&A (Is it free? How does the deposit work? Are owners verified? What if I
  can't find a hostel? How do owners get paid?). Reuse the Radix accessible disclosure pattern; good
  for objections + SEO.
- **§9 Closing CTA band** — full-width tinted band, one H2, one **Get started** pill. Last chance,
  single action.
- **§10 Footer** — grouped links (Product, For owners, Company/Legal), role shortcuts, theme
  toggle, copyright.

---

## 5. Design system mapping (reuse, don't reinvent)

Everything maps to existing tokens/primitives — the landing introduces **layout**, not new visual
language.

| Need | Use (existing) |
|---|---|
| Colors / light-dark | semantic tokens (`bg-background`, `bg-card`, `text-foreground[-muted]`, `text-primary`, `border-border`) — `designer.md §2` |
| Type scale | `text-4xl/5xl` H1, `text-lg` subhead, `text-sm` body — `designer.md §3` |
| Radius / shadow / motion | `rounded-[24px]` hero, soft large shadows, 150–200ms transitions, `sidebar-tip-in`-style fades — `designer.md §4` |
| Buttons | `Button` variants: `default` (Get started), `outline`/`secondary` (Search), `ghost` (Sign in) — `ui/button` |
| Surfaces | `Panel` / `Card` for hero, audience cards, trust tiles — `ui/panel`, `ui/card` |
| Badges | `Badge`/`StatusPill` for the "Verified" / "Boosted" motifs — `ui/badge` |
| Icons | `lucide-react` (Search, ShieldCheck, MapPin, Wallet, MessagesSquare, BadgeCheck, Sparkles) |
| Personalized row | existing `RecommendedRow` (signed-in students) |
| Nav | existing `HomeNav` (auth-aware) |

**New components (presentation only)**, under `apps/web/src/components/marketing/`:
`Hero`, `AudienceSplit`, `HowItWorks` (extract current STEPS), `TrustGrid`, `TwoWaysToBook`,
`OwnerBand`, `Faq` (Radix accordion), `ClosingCta`, `MarketingFooter`. Each is a thin, token-driven
server component (client only where interactivity is required, e.g. FAQ accordion).

---

## 6. Structure & routing

- **New `(marketing)` route group** with its own `layout.tsx` (marketing bar + footer, **no app
  sidebar**) — resolves the redesign follow-up where public pages borrowed the student shell.
  `/` moves under it; `/search` and `/hostels/[id]` can later join so public browsing never shows
  the logged-in sidebar.
- **`page.tsx` stays a Server Component** for SSR/SEO/speed; it renders the marketing sections and
  branches signed-in vs signed-out. Auth-aware bits (`HomeNav`, `RecommendedRow`) remain client
  islands. A small server read may power honest live stats (§7).
- **Metadata:** per-route `metadata` export (title, description, Open Graph/Twitter card, canonical)
  + `viewport` (already set). JSON-LD `Organization`/`WebSite` for rich results.

---

## 7. Copy direction (plain, action-first — matches flow-audit)

- **H1:** "Find a verified hostel seat near your campus."
- **Subhead:** "Search hostels, book a seat with a small deposit, or ask hostels to send you offers
  — free to browse, no account needed to look."
- **Primary CTA:** **Get started** · **Secondary:** **Search hostels**
- **Trust strip:** "Verified owners" · "Refundable deposit" · "Pay the owner directly"
- **Owner band H2:** "Own a hostel? Fill your seats." → **List your hostel**
- **Closing H2:** "Ready to find your hostel?" → **Get started**
- Voice: warm, concrete, 8th–10th-grade reading level; reuse the F1 word list (deposit / approved /
  room type / mixed-family), never system jargon.

---

## 8. Accessibility, performance, SEO (definition-of-done gates)

- **A11y:** one `<h1>`; `<section>` landmarks with `aria-labelledby`; buttons vs links used
  correctly; visible focus rings (`ring-primary/20`); 4.5:1 contrast in both themes;
  `prefers-reduced-motion` disables entrance animations; keyboard-navigable FAQ; alt text on any
  imagery.
- **Performance:** server-rendered, minimal JS; no layout shift (reserve hero media box); system
  fonts (no web-font blocking); lazy-load below-the-fold imagery; target Lighthouse ≥ 95
  Performance / 100 A11y / 100 Best-Practices / ≥ 95 SEO on mobile.
- **SEO:** descriptive title/description, OG + Twitter cards, canonical, JSON-LD, semantic headings,
  real crawlable copy (not image text).
- **Responsive:** mobile-first; single column < `sm`, 2-up cards at `sm`, full rhythm at `lg`;
  content capped `max-w-[1200–1280px]`; hero media stacks under text on mobile; honors safe areas
  and the `coarse:` 44px touch target rules already in place.

---

## 9. Motion (restrained, tasteful)

- Section entrance: subtle fade+rise (~12px, 200ms) on scroll-in, **staggered** for card grids;
  disabled under reduced-motion.
- CTA hover: existing `hover:bg-primary-hover` + slight lift; focus ring always visible.
- Hero media: optional very slow float/parallax — **off** under reduced-motion, and never blocking.
- No autoplaying video, no carousels (both hurt comprehension + performance for this audience).

---

## 10. Success metrics (what "good" means)

- **Primary:** signed-out → **Get started** click-through, and **Search hostels** engagement.
- Scroll depth to the Trust and Owner sections; FAQ open rate.
- Bounce rate on `/`; sign-up completion from landing.
- Lighthouse mobile scores (gate above). Instrument later with lightweight analytics; the layout is
  built to make the primary CTA the path of least resistance.

---

## 11. Phased rollout (L0 → L5)

Small, verifiable slices — each ends green on `turbo run type-check lint build` (web 25/25) and is
left uncommitted (§7.1); update `CLAUDE.md` §8.5 as each lands (§7.2).

| Phase | Scope | Output |
|---|---|---|
| **L0 — Marketing shell** | New `(marketing)` route group + `layout.tsx` (bar + footer, no sidebar); move `/` in; wire metadata + JSON-LD. | Landing sits in its own frame. |
| **L1 — Hero** | `Hero` component: eyebrow, H1, subhead, CTA pair, trust strip, product mock. Signed-out + compact signed-in variants. | Strong above-the-fold first impression. |
| **L2 — Audience + How it works** | `AudienceSplit` (student/owner cards) + refactor current STEPS into `HowItWorks` with plain copy. | Dual-audience self-routing. |
| **L3 — Trust + Two ways to book** | `TrustGrid` (4 tiles) + `TwoWaysToBook` (names the paths). | The trust/comprehension core. |
| **L4 — Owner band + FAQ + Closing CTA + Footer** | `OwnerBand`, `Faq` (Radix accordion), `ClosingCta`, `MarketingFooter`. | Objections handled, action repeated. |
| **L5 — Polish** | Motion (reduced-motion safe), honest social-proof slot, dark-mode pass, Lighthouse + a11y audit, responsive sweep 320→1440. | Ship-ready. |

---

## 12. Definition of done

- [ ] Signed-out `/` renders the full marketing narrative; signed-in `/` shows the personalized
      compact variant — both from one Server Component.
- [ ] Exactly one visually-dominant primary CTA (**Get started**) above the fold **and** in the
      closing band; secondary actions clearly subordinate.
- [ ] Landing lives in a `(marketing)` shell (no app sidebar); public pages can adopt it later.
- [ ] Trust & safety and the two booking paths are explicit; copy uses the flow-audit word list.
- [ ] Only design-system tokens/components; light + dark both correct; no raw hex.
- [ ] A11y (one h1, landmarks, focus, contrast, reduced-motion) + SEO (metadata, OG, JSON-LD) pass.
- [ ] Responsive 320px → 1440px+; 44px touch targets; no layout shift.
- [ ] `turbo run type-check lint build` clean (web 25/25, admin 12/12); nothing committed (§7.1);
      `CLAUDE.md` §8.5 updated per phase.

> Once L0–L5 land and every box is checked, `/` is a true best-practice landing page — clear in
> five seconds, trustworthy, dual-audience, and funneling to one obvious **Get started**.
