# flow-audit.md — UX Flow, Hierarchy & Usability Audit (Find Your Hostel)

> **Author's lens:** Senior UX Architect & Product Designer.
> **Goal:** make every screen understandable and usable for **non-technical, low-digital-literacy,
> low-English** users — a 10th-grade student should look at any screen and instantly know *what
> this is, what to do next, and what will happen*.
> **Strict scope:** this document covers **flow, information hierarchy, wording, and usability
> only**. It deliberately makes **no** visual-design, color, or responsiveness recommendations —
> those live in [`designerplan.md`](./designerplan.md) and [`responsive-plan.md`](./responsive-plan.md).
> Nothing here changes business rules (see [CLAUDE.md](./CLAUDE.md)); it changes *how the same rules
> are presented and sequenced*.

---

## 1. Executive Summary

Find Your Hostel is functionally complete and, after the design work, visually coherent. The
**remaining risk is comprehension**, not capability. Three things stand between the current product
and a genuinely easy one for its audience (students and hostel owners in Pakistan, many on phones,
many not fluent in app conventions or English):

1. **The vocabulary is the product's biggest usability barrier.** Users are shown internal,
   process-oriented terms — *"Awaiting Advance", "Advance Submitted", "Pending Owner Confirmation",
   "Occupancy", "Co-living", "Institution", "Featured listing"*. These describe the **system's
   state**, not **the user's next action**. A status should tell the user *what to do*, not name a
   database enum.
2. **The two booking paths are never explained.** A student can (a) book a listed seat directly or
   (b) post a request and receive offers. Nothing on screen tells them these two paths exist, how
   they differ, or which one they're in. This is the single biggest *flow* confusion.
3. **The money model is unusual and under-explained.** "Advance 20% now, balance 80% + refundable
   deposit at move-in, pay by bank transfer + upload a screenshot, wait for the owner to confirm" is
   a lot of novel concepts stacked together with no plain-language walkthrough. Payment is where
   trust is won or lost.

Everything else is comparatively minor: a handful of inconsistent button labels, one
`window.prompt()` used for a rejection reason, a few forms that ask for everything at once, and some
screens where the single most important action doesn't clearly dominate. This audit lists each with
a concrete, plain-language fix.

**Severity legend used throughout:** 🔴 blocks/confuses many users · 🟠 causes hesitation or errors ·
🟡 polish / consistency.

---

## 2. Global UX Principles (apply everywhere)

1. **One screen, one job.** Each screen has exactly **one** primary action that is obvious within 2
   seconds. Everything else is quieter. (Already structurally supported by the `PageHeader` action
   slot — this audit is about *which* action earns that slot and *what it's called*.)
2. **Labels are instructions, not nouns.** Prefer a verb the user can act on: **"Pay deposit to
   reserve"** beats "Awaiting Advance". A status line should answer *"What do I do now?"*.
3. **Say what happens next — every time.** Before a commit action and after it, state the outcome in
   one sentence: *"The owner will confirm your payment within 24 hours. We'll notify you."*
4. **Explain money in human terms.** Always pair a number with plain meaning and timing: *"₨X now to
   hold your seat"*, *"pay the rest when you move in"*, *"deposit is refundable"*.
5. **Protect dangerous actions.** Cancel/Delete/Reject are visually quiet, physically separated from
   the primary action, and always confirmed with a plain-language dialog that names the consequence.
6. **Same thing, same place, same word.** The primary action sits in the same location on every
   screen; identical actions use identical labels across student, owner, and admin surfaces.
7. **Never a dead end.** Every empty, error, and "not found" state offers the next step ("Search
   hostels", "Post a request", "Back to messages").
8. **Reduce, then reveal.** Ask for the fewest fields up front; reveal advanced options only when
   needed (progressive disclosure). Optional fields are clearly marked "(optional)".
9. **Plain-language first, term-in-parentheses second.** Where a domain word must appear (CNIC,
   security deposit), lead with the plain meaning: *"Refundable deposit (held as security)"*.

---

## 3. Global vocabulary map (the highest-impact single change)

Replace system vocabulary with action/plain vocabulary **everywhere it is shown to users**. This one
table drives most of §7 (Low-Literacy) and should be treated as the product's word list.

| Where users see (now) | Show instead (plain, action-first) | Why |
|---|---|---|
| **Awaiting Advance** | **Pay deposit to reserve** | Tells them the action, not the state |
| **Advance Submitted** | **Deposit sent — waiting for owner** | Confirms it worked + what's next |
| **Advance Rejected** | **Owner couldn't confirm your deposit — resend** | Names the recovery step |
| **Payment Pending Approval** | **Waiting for owner to confirm your payment** | Removes "approval" jargon |
| **Pending Owner Confirmation** | **Waiting for owner to confirm** | Same idea, plain |
| **Reserved** | **Seat held for you** | Reassuring, concrete |
| **Moved In** | **You've moved in** | — |
| **Active** (booking) | **Your stay is active** | — |
| **Advance (20%)** | **Booking deposit — 20% now to hold your seat** | Purpose + timing |
| **Balance (80%)** | **Remaining rent — pay at move-in** | Timing |
| **Security deposit** | **Refundable deposit (returned when you leave)** | Reassures it comes back |
| **Due at move-in** | **To pay when you move in** | Plain timing |
| **Occupancy / Seat type** | **Room type (how many share the room)** | "Occupancy" is unknown |
| **Co-living** | **Mixed / Family** | "Co-living" is jargon here |
| **Institution / Nearest institution** | **Your college or university** | Plain |
| **Facilities / Amenities** | **What's included** | Plain |
| **Featured listing / Promotions** | **Boost your listing (show it higher)** | Purpose-first |
| **Verified** (hostel/owner) | **Approved** | Consistent with admin actions |
| **Submit for review** | **Send for approval** | Consistent verb |
| **Request → Offers** | **"Ask hostels" → "Offers you received"** | Names the two-sided flow |
| **CNIC / ownership proof** | **Your ID card (CNIC) / Proof you own the hostel** | Plain, with term kept |

> These are **wording/label** changes (UX copy), not visual changes. Implement as a shared plain-
> language label map so student, owner, and admin all read identically.

---

## 4. User Journey Maps (with friction flagged)

### 4.1 Student — Direct booking (the happy path)
```
Land on Home ──▶ Search hostels ──▶ Open a hostel ──▶ Pick a room type ──▶ Confirm booking
   │                  │                    │                  │                    │
   │            🟠 filters can          🟡 many "Book a    🔴 "Advance /       🔴 status becomes
   │            feel heavy at once      seat" buttons      Balance / deposit"   "Awaiting Advance"
   ▼                                    (one per room)     unexplained          (jargon) — user
 (no explanation of the                                                          doesn't know to pay
  two ways to book)                                                              or how
        │
        ▼
   Pay deposit (bank transfer + upload screenshot) ──▶ Wait for owner ──▶ Move in ──▶ Pay rest ──▶ Review
        │                                                    │
   🔴 novel: manual proof upload,                       🟠 no time expectation
   no "what happens next"                                ("when will owner reply?")
```
**Fixes:** add a one-line "Two ways to book" explainer on Search; rename per-room CTA to *"Choose
this room"*; add a plain money explainer on the booking screen; replace the status jargon (§3);
after submitting payment, show *"Deposit sent. The owner will confirm within ~24 hours — we'll
notify you."*

### 4.2 Student — Request → Offers path
```
Home/Requests ──▶ "Post a request" ──▶ fill area/budget/room ──▶ Request is "Open"
      │                                       │                        │
 🔴 user may not know                   🟠 9 fields at once       🟡 "Open" unclear
 this path exists                       (see §6 form review)       (→ "Waiting for offers")
      ▼
 Owners send offers ──▶ Review offers ──▶ Accept one ──▶ (others auto-declined) ──▶ Pay deposit …
                              │                 │
                        🟡 offer card ok   🟢 accept now confirmed via dialog that says
                                           "this declines the other offers" (good — keep)
```
**Fixes:** surface the two paths together ("Can't find one? *Ask hostels to offer you a seat*");
rename status `open → "Waiting for offers"`, `booked → "Offer accepted"`; trim/stage the request
form (§6).

### 4.3 Owner — List a hostel & get approved
```
Sign up as owner ──▶ (must verify) ──▶ Onboarding: upload CNIC + ownership proof ──▶ Pending
      │                    │                          │                               │
 🟠 role picked at         🔴 user can create a       🟡 doc terms                🔴 "why can't I
 signup — is the           listing but NOT publish;   ("ownership proof")          publish?" — the
 difference clear?         the *reason* isn't          need examples               block reason must
                           obvious on the listing                                   be explicit + linked
      ▼
 Create listing (5-step wizard) ──▶ "Send for approval" ──▶ Admin approves ──▶ Publish ──▶ Live
```
**Fixes:** on every listing while unapproved, show a persistent, plain banner: *"Your hostel is
ready, but you must be approved before students can see it. Finish verification →"* (already partly
present on the dashboard — make it appear on the listing/edit screens too). Give document upload
plain labels + an example ("A photo of your CNIC, front side").

### 4.4 Owner — Handle a booking & payment
```
New booking arrives ──▶ Review ──▶ Confirm  (or Reject with reason) ──▶ Mark moved-in ──▶ Activate ──▶ Complete
                            │           │              │
                       🟠 payment    🔴 Reject uses a  🟡 verb chain "Confirm →
                       proof view    browser prompt()  Mark moved-in → Activate →
                       ok            for the reason    Complete" is owner jargon
```
**Fixes:** replace `prompt()` with a proper reason dialog; relabel the lifecycle verbs to
outcome-based owner language (see §5 owner table); group each booking's *one* current action as the
primary button, others hidden until relevant.

### 4.5 Cross-cutting: Messaging, Notifications, Community, Saved, Profile
- **Notifications** deep-link to the right screen — good. Ensure each notification's text is
  action-first (*"Pay your deposit to hold your seat at X"* not *"booking_created"*).
- **Messaging** is clear; the only risk is **Block** sitting near the top — keep it quiet and
  confirmed (it is now `destructiveGhost`; add a confirm).
- **Saved / Community / Profile** are low-risk; minor wording only.

---

## 5. Primary vs Secondary Action — per screen

> Rule applied: **one** bold primary action; secondary actions quiet; destructive actions separated
> and confirmed. "✅ ok / ⚠️ fix" = does the current screen honor the rule?

### Student & public
| Screen | Primary (should dominate) | Secondary (quiet) | Destructive (separated + confirm) | Verdict |
|---|---|---|---|---|
| Home | **Search hostels** | List your hostel; role links | — | ✅ |
| Search | **Open a hostel** (result) | Filters, list/map toggle, sort | — | ⚠️ add "two ways to book" hint |
| Hostel detail | **Choose a room / Book a seat** | Save, Message owner, Reviews | Report (quiet) | ⚠️ rename per-room CTA; Save/Message must stay quieter than Book |
| Confirm booking | **Confirm booking** | Change move-in/duration/method | — | ⚠️ add money explainer + "what's next" |
| My bookings (list) | **Open a booking** | Filter tabs | — | ✅ |
| Booking detail | **Pay deposit / Pay rest** (whichever is due) | View timeline | **Cancel booking** (quiet, confirmed) | ⚠️ make the due-payment the one loud action; status in plain words |
| My requests (list) | **Post a request** | Filter tabs | — | ✅ |
| Post a request | **Post request** | fields | — | ⚠️ reduce/stage fields |
| Request detail | **Accept an offer** (when offers exist) | Decline (quiet), Start new request | **Cancel request** (quiet, confirmed) | ✅ accept confirm already explains auto-decline |
| Saved | **Open a hostel** | — | Remove (quiet) | ✅ |
| Messages (list) | **Open a conversation** | Pin | — | ✅ |
| Chat | **Send message** | Pin | **Block** (quiet, add confirm) | ⚠️ confirm block |
| Community | **Ask a question** | Topic tabs, Like | — | ✅ |
| Post detail | **Reply** | Like | — | ✅ |
| Notifications | **Open the notification** | Enable push | Mark all read (quiet) | ⚠️ "Enable push" shouldn't compete; make it a one-time quiet nudge |
| Profile | **Save changes** | — | Sign out (quiet), Delete account* (quiet, confirm) | ✅ keep sign-out quiet |

### Owner
| Screen | Primary | Secondary | Destructive | Verdict |
|---|---|---|---|---|
| Owner dashboard | **List a new hostel** | Stat cards, per-hostel *current* action | **Delete listing** (quiet, confirmed) | ⚠️ per-row: show only the one relevant action prominently (Send for approval / Publish), demote the rest |
| Create/Edit wizard | **Continue / Send for approval** (final) | Back | — | ✅ (one action per step) |
| Owner bookings | **The current step** (Confirm / Mark moved-in / Activate) | filters | **Reject** (quiet, confirm — not `prompt()`) | ⚠️ fix reject dialog + relabel verbs |
| Owner requests (offers) | **Send an offer** | Withdraw (quiet) | — | ✅ |
| Owner promotions | **Send for approval** | plan pickers | — | ⚠️ rename "Promotions/Feature" to "Boost" |
| Owner onboarding | **Send for approval** | Back | — | ⚠️ plain doc labels + examples |

### Admin (internal — lower literacy risk, but keep consistent)
| Screen | Primary | Secondary | Destructive |
|---|---|---|---|
| Owners queue | **Approve** | View docs | **Reject / Suspend** (quiet, confirm) |
| Listings | **Approve** | — | **Reject** (quiet, confirm) |
| Reports/Content | **Resolve** | — | **Dismiss / Hide / Delete** (quiet, confirm) |
| Users | (read) | Search/filter | **Suspend** (quiet, confirm) |

---

## 6. Information Hierarchy — what users see first (per page)

For each: **First (above the fold)** → **Then** → **Move lower / collapse**.

- **Home:** First = *"Find a hostel seat near you" + Search*. Then = how-it-works (3 steps) +
  Recommended. Lower = footer/marketing.
- **Search:** First = *result count + the results themselves*. Then = filters (a tap away on mobile,
  a column on desktop). Lower/collapsed = advanced filters (amenities, exact price). **Add** a
  single sentence at top: *"Book a listed seat, or post a request and let owners come to you."*
- **Hostel detail:** First = *name, area, price-from, and the "Choose a room" action*. Then = rooms
  with prices, what's included. Lower/collapse = house rules, full description, map, reviews. (Photos
  set context but shouldn't push the price/action below the fold.)
- **Confirm booking:** First = *what you're booking (room + total to pay now) + Confirm*. Then =
  move-in date, duration, payment method. Lower = special requests (optional), full breakdown detail.
  **Lead with the deposit amount and its meaning**, not the rent math.
- **Booking detail:** First = *plain status + the one action due (pay deposit / pay rest / nothing —
  "You're all set")*. Then = booking facts. Lower = payment history/timeline, review (only when the
  stay is active/finished), Cancel (bottom, quiet).
- **My bookings / requests / saved / messages / notifications / community (lists):** First = *the
  list + one primary "create" action*. Counts live in tabs, not separate stat tiles (already true).
- **Post a request:** First = *"Where do you want to live and your budget"* (the two fields owners
  need most). Then = room type + move-in. Lower/collapse = category, exact institution, notes,
  duration. (See §8 form order.)
- **Owner dashboard:** First = *verification status banner (if not approved) + "List a new hostel"*.
  Then = your hostels with each one's **current** action. Lower = counts.
- **Owner bookings:** First = *bookings that need your action* (default the filter to "Needs
  action"). Then = active. Lower = closed/history.
- **Owner onboarding:** First = *"Two documents to get approved" + the first upload*. One thing at a
  time (it's a 2-step wizard — keep it that way).
- **Profile:** First = *your details + Save*. Lower = verification link (owners), Sign out.

---

## 7. Low-Literacy UX Improvements (wording, load, states)

### 7.1 Wording (beyond the §3 word list)
- **Buttons say the outcome:** "Confirm booking" ✅; but "Submit" → **"Send"**, "Submit report" →
  **"Send report"**, "Submit for review" → **"Send for approval"**.
- **Avoid abstract nouns:** "Verification" → **"Get approved"**; "Moderation/Report" (to a student) →
  **"Report a problem"**.
- **Numbers always carry meaning:** never show a bare "20%" — show *"₨X (20% now to hold your seat)"*.
- **Dates in words where possible:** "move-in" → **"the day you move in"**.

### 7.2 Reduce cognitive load
- **One decision at a time.** The request form (9 fields) and booking form should foreground the 2–3
  fields that matter and tuck the rest under "More options".
- **Default the smart choice.** Duration defaults to 1 month, payment method to the most common — keep
  these; add a short helper under each ("Most students pay by bank transfer").
- **Kill unexplained states.** Every status pill gets a one-line "what to do" beneath it on detail
  screens.

### 7.3 Success & error states (make them human)
| Situation | Say (plain) |
|---|---|
| Deposit submitted | ✅ *"Deposit sent! The owner will confirm within about a day. We'll message you."* |
| Payment rejected | ⚠️ *"The owner couldn't confirm this payment. Check the amount and send it again."* + a **"Try again"** button |
| Booking confirmed (owner side) | ✅ *"Booking confirmed. The student has been notified."* |
| Request posted | ✅ *"Your request is live. Owners can now send you offers — we'll notify you."* |
| Owner not yet approved (blocked publish) | ⚠️ *"You're almost there. Finish verification to let students see your hostel."* + **"Finish verification"** |
| Empty search | *"No hostels match. Try a bigger price range, or **post a request** and let owners offer you a seat."* (turns a dead end into the second path) |
| Form error | Point to the field in plain words: *"Please enter a move-in date"* (not "validation error"). |

### 7.4 Trust cues (this audience needs them)
- On the payment screen, one line: *"You only pay a small deposit now. You pay the rest when you move
  in, and your deposit is refundable."*
- On requests: *"Owners can't see your name or phone until you accept an offer."* (true per RLS —
  surface it; it reduces hesitation).

---

## 8. Form Experience (every form)

General rules: **fewest fields first**, logical order, group related inputs, mark optional clearly,
and always end with *"what happens when I press this."*

### Post a request (currently 9 fields, all at once) 🟠
- **Foreground (step/section 1 — the essentials):** *City/area* → *Budget (max)* → *Room type*.
- **Then (section 2):** *Move-in date* → *Duration*.
- **Collapse under "More options":** *Category (Boys/Girls/Mixed)*, *Exact college*, *Budget min*,
  *Notes*.
- End with: *"We'll post this and notify owners. You'll get offers here."*

### Confirm booking ✅ mostly — tighten
- Order: **What you're booking (read-only) → Move-in date → Duration → Payment method → (optional)
  Special requests → Agree → Confirm.**
- Put the **deposit amount + meaning** directly above the Confirm button.
- Terms: keep the toggle, but the sentence should be plain: *"I understand I pay a deposit now and
  the rest at move-in."*

### Owner create/edit wizard (5 steps) ✅ structure is right
- Keep one step per screen. Ensure each step's **"why"** is one line (Step "Rooms & Seats" →
  *"Add each room type and how many share it"*).
- Requirements hint: when "Continue" is disabled, say **why** in plain words.

### Owner onboarding (documents) 🟠
- Label each upload plainly with an example: *"Your CNIC (ID card) — a clear photo of the front"*,
  *"Proof you own or manage this hostel — utility bill, agreement, or ownership paper"*.
- One sentence on what approval means and how long: *"We check this within X days. You'll be
  notified."*

### Profile / Auth ✅
- Auth is short and fine. Ensure the **role choice at signup** is explained: *"I'm looking for a
  hostel"* vs *"I own / manage a hostel"* (outcome-based, not "Student / Owner").

### Payment proof upload 🔴 (highest-stakes form)
- Steps must be spelled out: *"1) Send ₨X to the account below. 2) Take a screenshot. 3) Upload it
  here."* Show the owner's account details **on the same screen** as the upload.
- After upload: the success copy from §7.3.

---

## 9. Navigation & Orientation

Users must always know **where they are, what they're doing, the next step, and how to go back
safely.**

- **Where am I:** every in-app screen has a `PageHeader` title + one-line subtitle (✅ present).
  Owner/student sidebars show the active item (✅). **Gap:** public pages (`/hostels/[id]`,
  `/hostels/[id]/book`) sit outside the app shell, so a logged-in student temporarily loses the
  sidebar. 🟡 Keep the back arrow's destination obvious ("Back to search") — already done — and make
  the header title carry the hostel name so orientation is never lost.
- **What's next:** detail screens should always show the single next step (pay / wait / review /
  nothing-to-do). Never leave a screen where the user can't tell if they must act.
- **Go back safely:** back uses history (restores scroll) with a fallback route (✅). Never trap the
  user in a modal — all dialogs/sheets close on backdrop + escape (✅).
- **Consistency of position:** the primary action is top-right in the header (or a bottom bar on long
  forms); back is top-left; destructive actions are at the **bottom** of the relevant section. Keep
  this identical across all surfaces.

---

## 10. Mental-Model Consistency Issues (found in the current app)

| # | Issue | Where | Fix | Sev |
|---|---|---|---|---|
| C1 | "List a **new** hostel" vs "List a hostel" vs "Find a hostel" vs "Find hostels" vs "Search hostels" | Home, owner dashboard, empty states | Pick one verb per intent: **"List your hostel"** (owner), **"Search hostels"** (student) — everywhere | 🟡 |
| C2 | "Submit" / "Submit for review" / "Submit report" | requests, promotions, reports | Standardize on **"Send…"** (Send request / Send for approval / Send report) | 🟡 |
| C3 | Status shown as technical enums in some places, plain elsewhere | booking/request/offer/payment badges | One shared **plain-language status map** (§3) used by student, owner, admin | 🔴 |
| C4 | Rejection reason via **`window.prompt()`** | owner bookings "Reject" | Replace with the standard reason **dialog** (consistent with all other confirms) | 🟠 |
| C5 | "Cancel" means two different things (cancel the booking vs "cancel/keep" in a dialog) | booking/request detail + dialogs | Dialog's non-destructive button says **"Keep booking" / "Keep request"** (already partly done — apply everywhere); the destructive one says the specific action | 🟡 |
| C6 | Owner lifecycle verbs ("Mark moved-in", "Activate", "Complete") are internal | owner bookings | Relabel to outcome language: *"Student moved in"*, *"Start the stay"*, *"Stay finished"* | 🟠 |
| C7 | "Featured" vs "Promotions" vs "Boost" for the same concept | owner promotions, search badge | One word: **"Boost"** (owner) / **"Boosted"** (badge) | 🟡 |
| C8 | Two booking paths never named or cross-linked | search, requests | Name them and cross-link (§4.1/§4.2) | 🔴 |
| C9 | Empty vs error vs not-found states worded differently | across detail pages | One pattern: *plain reason + one next-step button* | 🟡 |

---

## 11. Final Recommended Flows (the target experience)

### 11.1 Student books a listed seat (target)
1. **Search** → banner: *"Book a listed seat, or ask hostels to offer you one."*
2. **Hostel** → clear price-from + **"Choose a room"**.
3. **Confirm** → read-only summary + **deposit amount with meaning** + one plain terms line +
   **"Confirm booking"** → success: *"Booking started. Pay your deposit to hold the seat."*
4. **Booking detail** → status in plain words + **the one action due** (Pay deposit). Payment screen
   shows account details, 3 numbered steps, upload → success: *"Deposit sent. Owner will confirm ~1
   day."*
5. Owner confirms → *"Seat held for you."* → Move-in → Pay rest → *"Your stay is active."* → Review.

### 11.2 Student can't find one → asks hostels (target)
Search empty/curious → **"Ask hostels to offer you a seat"** → short form (area + budget + room) →
*"Your request is live — offers will come here."* → offers arrive → **Accept** (dialog: *"This
accepts this offer and politely declines the others."*) → pay deposit (same as above).

### 11.3 Owner gets live (target)
Sign up ("I own a hostel") → **"Get approved"** (2 plain document uploads with examples) → *"We'll
review within X days."* → build listing (5 steps, one thing each) → **"Send for approval"** → admin
approves → **"Publish"** → *"Your hostel is now visible to students."*

### 11.4 Owner handles a booking (target)
Notification: *"New booking at [hostel] — review it."* → open → see the student's request + payment
proof → **one primary action** matching the stage (Confirm payment / Student moved in / Start the
stay / Stay finished); **Reject** is quiet and asks for a reason in a proper dialog → each step fires
a plain-language notification to the student.

---

## 12. Implementation guide (priority order for devs/designers)

Do them in this order — each is copy/flow only, no visual/responsive change:

1. **🔴 Ship the plain-language status + money map (§3).** One shared label module consumed by every
   badge and detail screen. Biggest comprehension win for the least code.
2. **🔴 Name & cross-link the two booking paths (§4, C8).** One sentence on Search + a "post a
   request" nudge in the empty-search state.
3. **🔴 Rewrite the payment screen as 3 numbered steps with account details + trust line (§8).**
4. **🟠 Replace the `prompt()` reject with a reason dialog; relabel owner lifecycle verbs (C4, C6).**
5. **🟠 Add "what happens next" success/error copy (§7.3) to booking, request, payment, verification.**
6. **🟠 Stage the request form; foreground essentials (§8).**
7. **🟡 Standardize button labels and states (C1, C2, C5, C7, C9).**
8. **🟡 Add the confirm on Block; make "Enable push" a quiet one-time nudge.**

**Definition of done (UX):** a first-time, low-literacy user can, without help, (a) find and book a
seat *or* post a request, (b) understand what they paid, why, and what's left, (c) always see one
obvious next step and one obvious way back, and (d) never encounter a system term that names a state
instead of telling them what to do.

> **North star:** every screen answers three questions before the user asks them — *What is this?
> What do I do now? What happens after I do it?*
