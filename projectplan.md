# Find Your Hostel — Software Design Document

> A mobile platform that bridges the gap between students searching for accommodation and hostel owners managing their listings.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Design Methodology and Software Process Model](#2-design-methodology-and-software-process-model)
3. [System Overview](#3-system-overview)
4. [Architectural Design](#4-architectural-design)
5. [Process Flow](#5-process-flow)
6. [Design Models](#6-design-models)
7. [Data Design](#7-data-design)
8. [Algorithms & Implementation](#8-algorithms--implementation)
9. [Appendices](#9-appendices)

---

## 1. Introduction

The **"Find Your Hostel"** project is designed to assist students (*hostellites*) in searching for suitable accommodations near their educational institutions, while enabling hostel owners (*hostellers*) to list and manage their hostel facilities effectively. The system ensures a seamless user experience through a modern web application, leveraging technologies like **Next.js** and **React** for front-end development, **TanStack React Query** for server-state management, and robust backend services powered by **Supabase** (PostgreSQL, Auth, and Storage).

The goal of this system is to provide a centralized platform that bridges the gap between students and hostel providers, making the search and management process efficient and user-friendly. Additionally, the system integrates administrative functionalities for managing users and hostels while maintaining a secure and scalable structure.

### 1.1 Objectives

- Enable students to search and filter hostels based on location, amenities, and price.
- Allow hostel owners to easily list, update, and manage their hostel information.
- Provide a seamless and user-friendly mobile application for students and hostel owners.
- Provide a user-friendly interface for comparison and filtering.
- Implement secure login and user management for both hostellites and hostellers.
- Integrate real-time availability and booking management for efficient hostel reservations.

### 1.2 Scope

The "Find Your Hostel" system is a **web-based platform** aiming to centralize hostel listings and provide students with personalized recommendations. The software caters to students, hostel owners, and administrators by offering features such as search functionality and an admin dashboard. Key capabilities include:

- Search hostels by proximity, price, and amenities.
- Hostel owner registration and management tools.
- Admin moderation for user accounts and reviews.

> **Phased Delivery:** For the current phase, the project is being delivered as a **website only**. A **mobile application** will be developed in a later phase, reusing the same backend (Supabase) and shared business logic.

> **Monorepo Structure:** To support this phased approach, the project will be organized as a **monorepo**. This allows the web app, the future mobile app, and shared code (types, validation, API/Supabase client, and business logic) to live in a single repository — maximizing code reuse and keeping the web and mobile clients in sync.

> **Shared Business Logic:** All business logic is written in a **platform-agnostic shared core** (`packages/shared`) so that both the web and the future mobile app can consume the exact same logic, hooks, and validation without changes. UI screens are kept thin and only handle rendering. See §4.7 for details.

---

## 2. Design Methodology and Software Process Model

The development of "Find Your Hostel" adopts the **Agile Software Development Methodology**. This iterative and incremental process model ensures continuous improvement and adaptability to changing requirements. Agile emphasizes collaboration, customer feedback, and small, rapid releases.

- **Iterative Approach** — The system is developed in multiple sprints, where each sprint delivers a functional module.
- **Incremental Delivery** — Features such as hostel search, user registration, and admin management are incrementally added.
- **Feedback Loop** — Regular feedback from stakeholders ensures the application meets user expectations.

---

## 3. System Overview

The "Find Your Hostel" system is a web application designed to help students find suitable hostels near their institutions. Hostel owners can register and add hostel details, while students can search and filter hostels based on preferences. The current phase delivers the **website**; a **mobile application** is planned for a later phase and will share the same backend and core logic through the project's monorepo.

### 3.1 Core Features

| Feature | Description |
| --- | --- |
| **Hostel Registration** | Hostel owners can register and provide details such as location, type of accommodation, and facilities. |
| **Search and Filtering** | Students can search hostels based on proximity, price, and facilities. |
| **User Roles** | Role-based access for students, hostel owners, and administrators. |
| **Web Admin Panel** | A dedicated internal web app (`apps/admin`) that allows administrators to manage user activities, verify hostel listings, moderate content, view analytics, and ensure data integrity. |

### 3.2 Technology Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | Next.js (React) — public website (`apps/web`) and web admin panel (`apps/admin`) |
| **Server State / Data Fetching** | TanStack React Query |
| **Backend** | Next.js API routes / Server Actions with Supabase |
| **Database** | Supabase (PostgreSQL) for scalable, relational data storage |
| **Authentication** | Supabase Auth (email/password, OAuth, row-level security) |
| **File Storage** | Supabase Storage (hostel images and documents) |

---

## 4. Architectural Design

The "Find Your Hostel" system follows a **modular client-server architecture** with a **three-tier design pattern**, ensuring scalability, maintainability, and robustness. The architecture is decomposed into three major layers:

### 4.1 Presentation Layer (Frontend)

- The user interface developed using Next.js (React).
- Uses TanStack React Query for caching, synchronizing, and managing server state.
- Facilitates user interactions such as searching for hostels, registration, and profile updates.
- Communicates with the backend via Next.js API routes / Server Actions and the Supabase client.

### 4.2 Business Logic Layer (Backend)

- Implements core functionalities using Next.js API routes and Server Actions.
- Handles user authentication, data processing, and business logic via the Supabase SDK.
- Ensures secure data transactions and enforces role-based access control through Supabase Row-Level Security (RLS) policies.

### 4.3 Data Layer (Database)

- Powered by Supabase (PostgreSQL) for efficient, relational data storage and retrieval.
- Manages user profiles, hostel details, and admin-related data.
- Hostel images and documents are stored in Supabase Storage.

### 4.4 Subsystems

- **User Management Module** — Handles user registration, login, and role assignments.
- **Hostel Management Module** — Allows hostel owners to add, update, and manage hostel details.
- **Search & Filter Module** — Provides search functionality for students and recommendations for hostels based on their preferences.
- **Admin Panel Module** — A dedicated web admin panel (`apps/admin`) for administrators to moderate the platform, verify hostel listings, manage user accounts, and view analytics (see §4.6).

> **Subsystem Relationships:** The subsystems interact via Next.js API routes / Server Actions and the Supabase client, ensuring modularity. The frontend communicates with the backend using HTTP requests (managed through React Query), and the backend retrieves or updates data in the Supabase database. The architectural decomposition ensures that changes in one module do not impact others, enabling scalability and easier maintenance.

> 📌 *Figure 1: System Architecture Diagram — (placeholder)*

### 4.5 Repository Structure (Monorepo)

The project is organized as a **monorepo** to support phased delivery (website first, mobile app later) and to maximize code sharing between clients. A typical layout:

```text
find-your-hostel/
├── apps/
│   ├── web/          # Next.js public website — students & hostel owners (current phase)
│   ├── admin/        # Next.js web admin panel — internal moderation & management (current phase)
│   └── mobile/       # React Native (Expo) app (future phase)
├── packages/
│   ├── shared/       # Shared types, validation, business logic, query hooks
│   ├── supabase/     # Supabase client, queries, RLS helpers
│   └── ui/           # Reusable UI components (where applicable)
├── package.json      # Workspace root
└── turbo.json        # (optional) build orchestration
```

> **Note:** The **web admin panel** (`apps/admin`) is delivered in the **current (web) phase** alongside the public site. Both web apps reuse the same `packages/shared` business logic and Supabase backend.

**Benefits of the monorepo approach:**

- The web app and future mobile app share the same backend (Supabase), types, and business logic — no duplication.
- A single source of truth keeps both clients in sync as features evolve.
- Easier dependency management and consistent tooling across apps.

### 4.6 Web Admin Panel

Alongside the public website, the project includes a **separate web admin panel** (`apps/admin`) built with Next.js. It is an internal-facing application used exclusively by administrators and is **delivered in the current (web) phase**. It shares the same Supabase backend and `packages/shared` business logic as the public site, but exposes a distinct, access-controlled interface.

**Responsibilities of the admin side:**

- **Hostel verification** — Review, approve, or reject newly submitted hostel listings before they go live.
- **User management** — View, search, suspend, or delete student and hostel-owner accounts.
- **Content moderation** — Moderate reviews, reports, and flagged content.
- **Dashboard & analytics** — View platform metrics (registrations, active listings, bookings) via charts and data tables.
- **Activity logs** — Audit user and system activity for data integrity and security.

**Access & security:**

- Restricted to users with the `Admin` role; enforced through Supabase Auth and **Row-Level Security (RLS)** policies plus route-level guards.
- All administrative actions are securely logged.

> 📌 *Figure 1b: Admin Panel Architecture — (placeholder)*

### 4.7 Shared Business Logic (Platform-Agnostic Core)

A core design principle of the system is that **business logic must be written in a platform-agnostic way so that both the web and the future mobile app can consume it without modification.** All non-rendering logic lives in the shared package (`packages/shared`) and is consumed identically by every app.

> **Golden Rule:** *If a piece of logic is not about rendering, it belongs in `packages/shared`.* Screens and pages are thin presentation layers — they only call shared hooks and render the result.

**What lives in the shared core (consumed by web, admin, and mobile):**

- **Data access (API functions)** — all Supabase queries and mutations.
- **Server-state hooks** — TanStack React Query hooks (queries + mutations) and centralized, hierarchical query keys.
- **Client/UI state** — shared stores (e.g. auth snapshot, multi-step form drafts).
- **Validation schemas** — Zod schemas shared by all platforms.
- **Types** — generated database types and domain types.
- **Utilities & config** — formatting, error mapping, timing/constants, and design tokens.

**Rules that keep the core portable:**

- The shared package contains **no platform code** — no DOM APIs and no React Native imports.
- The Supabase client is **injected** by each app (web uses `@supabase/ssr` cookies; mobile uses secure storage), while the shared code only calls a `getSupabase()` accessor — so the same logic runs in both runtimes.
- Screens **never** call the database directly; they go through shared hooks.

This is what allows the mobile app, when added in the later phase, to **reuse every shared hook, store, type, and schema as-is** — only the screens are new.

> 📌 *Figure 1c: Shared Core / Code-Reuse Architecture — (placeholder)*

---

## 5. Process Flow

The process flow of the "Find Your Hostel" system focuses on the major functionalities, including searching for hostels, managing hostel details, and admin operations.

### 5.1 Searching for Hostels

1. A student enters search preferences (e.g., location, facilities).
2. The backend processes the request and fetches relevant hostel data from the database.
3. The results are sent back to the user, sorted by relevance.

### 5.2 Adding / Managing Hostels

1. Hostel owners log in and submit hostel details (e.g., name, address, facilities).
2. The backend validates the input and stores the information in the database.
3. The updated hostel list is reflected for student users.

### 5.3 Admin Operations

1. Admins log in to view user or hostel data.
2. Admins can approve/reject hostel registrations and manage user accounts.
3. The backend ensures all changes are securely logged.

---

## 6. Design Models

The following design models illustrate the system's behavior and structure:

- **Activity Diagram** — *Figure 2 (placeholder)*
- **Sequence Diagram — Hosteller** — *Figure 3 (placeholder)*
- **Sequence Diagram — Hostellite** — *Figure 4 (placeholder)*
- **Sequence Diagram — Admin** — *Figure 5 (placeholder)*
- **Level 0 DFD** — *(placeholder)*
- **Level 1 DFD** — *(placeholder)*
- **Level 2 DFD** — *(placeholder)*
- **Deployment Diagram** — *Figure 6 (placeholder)*

---

## 7. Data Design

### 7.1 Data Dictionary

#### System Entities

| Entity | Type | Description |
| --- | --- | --- |
| Admin | Object | Represents the admin users responsible for verification and management. |
| Hostel | Object | Represents hostels and their details. |
| Student | Object | Represents students searching for hostels. |
| User | Object | Represents a generic user (either student, owner, or admin). |

*Table 1: System Entities*

#### User Entity

| Attribute | Type | Description |
| --- | --- | --- |
| userId | String | Unique identifier for the user. |
| name | String | Name of the user. |
| email | String | Email address for communication. |
| password | String | Encrypted password for authentication. |
| role | Enum | Role of the user (Student, Hostel Owner, Admin). |

*Table 2: User Entity*

#### Hostel Entity

| Attribute | Type | Description |
| --- | --- | --- |
| hostelId | String | Unique identifier for the hostel. |
| name | String | Name of the hostel. |
| address | String | Complete address of the hostel. |
| nearestInstitution | String | Closest university or college to the hostel. |
| priceRange | Float | Approximate cost of living in the hostel. |
| facilities | List\<String\> | List of amenities offered by the hostel. |

*Table 3: Hostel Entity*

### 7.2 Methods and Function Parameters

| Method | Description | Parameters |
| --- | --- | --- |
| `register()` | Registers a new user in the system. | name, email, password, role |
| `login()` | Authenticates a user. | email, password |
| `addHostel()` | Adds a new hostel to the system. | name, address, nearestInstitution, priceRange, facilities |
| `updateHostel()` | Updates details of an existing hostel. | hostelId, updatedDetails |
| `generateRecommendations()` | Generates hostel recommendations based on user preferences and history. | preferences, userHistory |

*Table 4: Methods and Parameters*

### 7.3 Storage Mechanism

- **Database Management System:** Supabase (PostgreSQL — relational)
- **Tables:**
  1. `users` — Stores user data and roles (integrated with Supabase Auth).
  2. `hostels` — Stores hostel details and attributes.
  3. `recommendations` — Stores generated recommendations.
  4. `logs` — Stores user activity logs.
- **Access Control:** Row-Level Security (RLS) policies enforce role-based data access.
- **Object Storage:** Supabase Storage buckets for hostel images and documents.

### 7.4 APIs

Next.js API routes / Server Actions for hostel listing management and search functionality, with the Supabase client handling authentication and direct data access (secured by RLS). React Query manages fetching, caching, and mutations on the client.

---

## 8. Algorithms & Implementation

### 8.1 User — `register()`

```text
Object: User
Function: register()

1. Input user details (name, email, password, and role).
2. Validate the inputs.
3. Call Supabase Auth signUp() with the email and password.
4. On success, insert the profile (name, role) into the `users` table.
5. Return success message.
```

### 8.2 Hostel — `addHostel()`

```text
Object: Hostel
Function: addHostel()

1. Input hostel details (name, address, nearest institution, facilities, etc.).
2. Validate the inputs.
3. Save the hostel details in the database.
4. Notify the admin for verification.
5. Return success message.
```

---

## 9. Appendices

### 9.1 References

- **How to design using UML (OOP):** <http://agilemodeling.com/artifacts/>
- **How and when to design ER diagrams:** <http://people.inf.elte.hu/nikovits/DB2/Ullman_The_Complete_Book.pdf>
- **Data Flow Diagrams:** <http://www.agilemodeling.com/artifacts/dataFlowDiagram.htm> — *Software Engineering: A Practitioner's Approach* by Roger Pressman
- **Architecture diagrams:** Ian Sommerville — *Software Engineering, 9th Edition*, Chapter 6

---
---

# Find Your Hostel — How the Platform Works (User & Stakeholder Guide)

This part explains the **complete working flow** of the Find Your Hostel platform in plain
language, for everyone involved: **Students (Hostellites)**, **Hostel Owners (Hostellers)**,
and **Admins**. The current phase is the **website**; the future mobile app mirrors the same
logic and shares the same backend. The numbers below (the **20% booking advance**, the
**1-month security deposit**, room/seat types, etc.) are the platform's defined behaviour and
are configurable defaults.

---

## Table of contents
1. [The big picture — who does what](#1-the-big-picture)
2. [Hostel categories & room/seat types](#2-hostel-categories--seat-types)
3. [Hostel owner journey — listing & managing hostels](#3-owner-journey)
4. [Seat-type pricing (Single / Double / Triple / Quad / Dorm)](#4-seat-type-pricing)
5. [Student journey A — booking a listed seat directly](#5-student-journey-a--direct-booking)
6. [Student journey B — hostel request & owner offers](#6-student-journey-b--hostel-requests)
7. [Payments explained (advance, balance, security deposit)](#7-payments-explained)
8. [Statuses & lifecycles (cheat sheet)](#8-statuses--lifecycles)
9. [Notifications system](#9-notifications-system-flow)
10. [Messaging / chat](#10-messaging--chat)
11. [Community features — saved hostels, reviews, Q&A](#11-community-features)
12. [Promotions (featured hostel listings)](#12-promotions)
13. [Trust & safety — reporting and blocking](#13-trust--safety)
14. [Admin journey](#14-admin-journey)

---

## 1. The big picture

Find Your Hostel connects **students** with verified **hostel owners**. There are two ways a
booking can happen:

- **Direct booking** — the owner lists a hostel with available seats; the student books a
  seat directly.
- **Hostel request** — the student describes what they need (budget, area, institution,
  seat type); *multiple* owners send competing **offers**; the student picks one.

An **Admin** oversees the platform: verifying owners and hostel listings, moderating content
and reviews, approving featured listings, and monitoring bookings/reports.

| Role | What they do |
| --- | --- |
| **Student (Hostellite)** | Search & filter hostels, book a seat, post hostel requests, review owner offers, pay, chat, review hostels, save favourites, ask community questions |
| **Hostel Owner (Hosteller)** | List & manage hostels and seats, respond to student requests with offers, confirm payments, chat, run featured promotions |
| **Admin** | Approve/reject/suspend owners, verify listings, manage users, approve promotions, handle reports, oversee bookings/content/messaging |

---

## 2. Hostel categories & seat types

When an owner creates a listing, it chooses a **category** (who the hostel is for):

| Category | Meaning | Under the hood |
| --- | --- | --- |
| **Boys Hostel** | For male students | `hostel_type: boys` |
| **Girls Hostel** | For female students | `hostel_type: girls` |
| **Co-living / Family** | Mixed or family accommodation | `hostel_type: mixed` |

Each listing also records its **nearest institution(s)**, full **address + map location**
(for proximity search), and **facilities/amenities** (Wi-Fi, meals, laundry, AC, study room,
backup power, security, parking, etc.).

> **Seat-based, not whole-unit:** A hostel is booked **per seat** within a **room/seat type**
> (see §4). This mirrors how student hostels actually rent — by the bed/seat in a shared
> room — rather than renting an entire property.

---

## 3. Owner journey

### 3.1 Becoming an active owner (verification gate)
An owner signs up and completes **onboarding** (owner details + verification documents:
CNIC/ID, ownership/authority proof, hostel photos). The account has a status:

`pending → approved` (or `rejected`, `suspended`)

**An owner cannot publish hostels or appear in featured listings until they are both
`approved` by an Admin and have completed onboarding.** Newly added hostels are additionally
**verified per-listing** before they go live. Until then, publishing is blocked with:
*"Owner approval and listing verification are required before a hostel can go live."*

### 3.2 Creating a hostel — the 5-step wizard
1. **Basics** — category (Boys/Girls/Mixed), hostel name, nearest institution(s), full
   address, and **map location** (Leaflet + OpenStreetMap).
2. **Rooms & Seats** — define each **seat type** (Single / Double / Triple / Quad / Dorm),
   its **total seats**, and per-type monthly price (see §4).
3. **Facilities & Rules** — amenities (Wi-Fi, meals, laundry, AC, study room, backup power,
   security, parking), house rules, timings/curfew, and meal plan details.
4. **Pricing** — base monthly rent per seat type, **security deposit**, optional discount %,
   and currency (PKR).
5. **Media** — cover image and gallery, then **submit for verification → publish**.

### 3.3 Capacity & "Fully Booked"
Each seat type has a **total seats** count. The system counts seats already taken (across
non-cancelled bookings). When a seat type's seats are all taken it shows **"Fully Booked"**
and its Book button is disabled. When **every** seat type is full, the whole listing shows
**"Fully Booked"**. This is enforced at the **database level**, so two students can't book
the last seat at the same time.

### 3.4 Discounts
An owner can set a percentage discount on a seat type (**0–50%**). The discounted price is
what students see, with the original price shown struck through.

### 3.5 Editing a published hostel (the edit-lock)
Once a hostel has **active bookings**, its "material" details (seat prices, seat-type config,
security deposit, rules) are **locked** while those bookings are active — only cosmetic
fields (description, photos) stay editable. This protects students who already booked. The
lock lifts when active bookings end. A hostel with **any** active booking cannot be deleted.

---

## 4. Seat-type pricing

Instead of one price, a hostel offers **multiple seat types**, each with its own monthly
price and capacity. The standard seat types are:

> **Single · Double · Triple · Quad · Dormitory (Sharing)**

| Seat-type attribute | Options |
| --- | --- |
| **Occupancy** | Single · Double · Triple · Quad · Dorm/Sharing |
| **Monthly rent** | Per-seat price for that occupancy |
| **AC / Non-AC** | Each seat type can be marked AC or Non-AC (optional add-on price) |
| **Total seats** | How many seats of this type exist |
| **Attached bath** | Yes / No |

**How seat pricing works for the student:**
- The hostel's headline **"from" price** is the **cheapest available seat type's** monthly rent.
- The student's actual monthly cost = **seat-type rent (+ any AC add-on)**.
- A seat type is only offered once it has a **name/occupancy and a price greater than 0**, and
  it disappears from booking when **Fully Booked**.

---

## 5. Student journey A — direct booking

1. **Search & filter** by **proximity to institution**, **price**, **seat type**, **gender
   category**, and **amenities** (map + list view).
2. **Open a hostel** to see seat types, prices, facilities, rules, location, and rating. If a
   seat type is **Fully Booked**, its booking is disabled. If the student already has an
   active booking there, the button opens that booking instead.
3. **Confirm Booking** screen:
   - **Pick a seat type** (cheapest first) and AC/Non-AC if offered.
   - **Move-in date** and intended **duration** (e.g. months).
   - **Special requests** (optional).
   - **Payment method**: **Bank Transfer / JazzCash / Easypaisa** or **Cash on the Spot**.
   - **Price breakdown** updates live (monthly rent, AC add-on, security deposit, discount,
     booking advance due now).
   - **Agree to terms**, then **Confirm Booking**.
4. The booking is created with a starting status based on payment method:
   - Online transfer → **Payment Pending Approval**
   - Cash → **Pending Owner Confirmation**
5. The student tracks it in **My Bookings** (tabs: Active / Upcoming / Past / Cancelled) and
   on the **Booking detail** screen, where they upload a payment screenshot (online),
   see the owner's bank/JazzCash/Easypaisa details, cancel, and — after move-in/stay —
   **leave a review**.

> **Note:** A direct booking pays a **booking advance** to reserve the seat, with the
> **balance + security deposit** due at move-in — see §7.

---

## 6. Student journey B — hostel requests

For when no listed hostel fits:

1. **Create a request** (multi-step): area/institution, **budget range**, preferred **seat
   type**, gender category, move-in date, required amenities, and notes. Saved as **Open**.
2. The open request is visible to **verified owners**, who submit **offers** (each owner can
   submit one offer). The student sees a live **offers count** and a list of offers.
3. **Review offers** and **Accept** the best one. On acceptance:
   - The chosen offer becomes **Accepted**, the request becomes **Booked**, and the
     **booking advance** becomes due.
   - **All other competing offers are automatically rejected.**
4. **Pay the booking advance** (online + screenshot, or cash arranged in chat).
5. **Move in.** When the student moves in, the owner marks it **moved-in**, which makes the
   **remaining balance + security deposit** due. The student pays, the owner confirms, and
   the booking is **active** — unlocking the ability to **review** the hostel.
6. **Cancelling:** the student can **Cancel** any time before payment is fully confirmed. The
   accepted owner is notified. Because a cancelled request is closed for good (and the other
   offers were already rejected), the student gets a **"Start a New Request"** option that
   **clones the details into a brand-new request** to send out again.

**The booking "phase"** (one clear status the whole flow funnels into):

```
open → has_offers → offer_accepted → awaiting_advance →
advance_submitted → advance_rejected → reserved → moved_in → active
                         (or → cancelled / expired at any point after acceptance)
```

---

## 7. Payments explained

### 7.1 Two payment stages
| | **Direct booking** | **Request-based offer** |
| --- | --- | --- |
| Structure | **Advance to reserve + balance at move-in** | **Advance to reserve + balance at move-in** |
| Advance | **20%** of first month's rent, due **on booking/acceptance** | **20%**, due **on acceptance** |
| Balance | **Remaining 80% + security deposit**, due **at move-in** | same |
| Security deposit | **1 month's rent** (refundable) | per the offer |

So: **Advance = 20% of first month's rent** (reserves the seat), and **Balance = 80% +
security deposit**, due when the student moves in.

### 7.2 Payment methods (both stages)
- **Bank Transfer / JazzCash / Easypaisa** — the student pays to the owner's details (shown
  in-app), then **uploads a payment screenshot** as proof. The owner reviews and **confirms**
  or **rejects** (with a reason → student re-uploads).
- **Cash on the Spot** — arranged with the owner via chat; **no screenshot**. The owner
  **confirms receipt** directly once paid.

> **Note on gateways:** The current model is **manual confirmation** (transfer + screenshot,
> or cash). Integrating an automated payment gateway (e.g. JazzCash/Easypaisa API or a card
> processor) is a future enhancement — see the open decision in the project notes.

### 7.3 Who confirms
The **owner** confirms or rejects payments. Confirming the advance **reserves** the seat;
confirming the balance makes the booking **active** and unlocks reviews. Payment screenshots
are uploaded securely to Supabase Storage.

### 7.4 Refunds & deposit
The **security deposit** is refundable at the end of stay (subject to the owner's rules /
damages). Refund handling is a manual, owner-confirmed step.

---

## 8. Statuses & lifecycles

### 8.1 Direct booking statuses
`pending` · `payment_pending_approval` · `awaiting_advance` · `advance_submitted` ·
`advance_rejected` · `pending_owner_confirmation` · `reserved` · `moved_in` · `active` ·
`completed` · `cancelled` · `rejected` · `expired`
(plus a display-only **"Booking Closed"** when the move-in date passed but it was never
confirmed).

**Automatic rules:**
- Unconfirmed bookings **expire** once the **move-in date** passes.
- A reserved booking **cannot be cancelled** once the move-in date has arrived.
- A booking **cannot be confirmed** after the move-in window has passed.

### 8.2 Hostel request statuses
Request: `open · booked · completed · cancelled · expired · closed`
Offer: `pending · accepted · rejected · withdrawn · expired`
Advance payment: `none · awaiting · submitted · confirmed · rejected · cancelled`
Balance payment: `none · awaiting · submitted · confirmed · rejected`

---

## 9. Notifications system (flow)

**One source of truth → two delivery channels.** Every important event writes a row to a
central **notifications** table (via database triggers, so nothing is missed), then:

- **In-app (realtime):** the app subscribes to the user's notifications live, so the bell
  badge and lists update instantly without refresh.
- **Push (out-of-app):** a database webhook sends a push for each new notification — **web
  push** on the website and **Expo push** on the future mobile app. Each device registers a
  token; tapping a push **deep-links** straight to the relevant screen (the chat thread, the
  offer, the booking, the hostel), routed by the recipient's role.

**Events that notify users include:** new hostel request (to owners), offer received /
accepted / rejected, advance requested / submitted, **balance due** on move-in, booking
received / confirmed / cancelled / expired / payment requested, new chat message, review
received, and promotion approved / rejected.

---

## 10. Messaging / chat

Students and owners chat in **conversations** tied to the relevant context — a hostel, an
offer, or a booking. Conversations can be pinned. Every (non-system) message triggers a
`new_message` notification + push to the other party. Blocking a conversation (see §13)
prevents further messages. Admins can oversee messaging.

---

## 11. Community features

### Saved hostels (favourites / wishlist)
Students save hostels they're interested in (**Shortlist**) for quick comparison later.
Shortlists are **private** to the student.

### Reviews
After a stay (booking **active/completed**), the student can **review the hostel** (overall,
cleanliness, facilities, location, value ratings + comment); the owner can respond. Reviews
are de-duplicated per booking and feed into the hostel's average rating.

### Student Q&A (community posts)
A lightweight community board where students can ask questions about areas, institutions, or
hostel life (categories: budget, area/locality, facilities, food, safety, general). Posts can
be made **anonymously**, can attach a location, and others can **reply** and like. Replies and
mentions generate notifications.

---

## 12. Promotions

Owners can **pay to feature/boost** a hostel listing's visibility.
- **Plans:** `featured_1d`, `featured_3d`, `featured_7d`, `featured_30d`.
- The owner submits a promotion with a **payment screenshot**; status starts **pending**.
- An **Admin approves** (which starts the timer and sets the expiry, making it **active**) or
  **rejects** (with a reason). The owner is notified either way.
- Active featured listings are surfaced higher in search/explore (only from approved owners),
  and **impressions and clicks** are tracked for the owner.

---

## 13. Trust & safety

- **Reporting:** users can report hostels, reviews, messages, profiles, requests, and
  conversations. Reasons include spam, harassment, inappropriate content, misleading info,
  scam/fraud, hate speech, privacy violations, and other. Reports move through
  `pending → reviewing → resolved / dismissed` for admins.
- **Blocking:** users can block other users/content; reported content is **auto-hidden** for
  the reporter. Blocking a conversation **stops new messages** in it.

---

## 14. Admin journey

The Admin uses the dedicated **web admin panel** (`apps/admin`) to run the platform:

| Area | What the admin does |
| --- | --- |
| **Dashboard** | KPIs: students, owners, hostels, bookings, occupancy, reports, promotions |
| **Owners** | **Approve / Reject (with reason) / Suspend / Unsuspend** owners; owners can't operate until approved |
| **Listings** | **Verify / unpublish** hostels; oversee published listings |
| **Students / Users** | View and manage accounts |
| **Promotions** | **Approve / Reject** featured listings (view payment screenshot, CTR) |
| **Bookings** | Monitor bookings and their statuses |
| **Reports** | Review and **resolve / dismiss** user reports |
| **Content** | Moderate **reviews** and **community posts** |
| **Messaging** | Oversight of conversations |

Approving an owner notifies them and unlocks listing & bookings. The admin is also exempt
from some student/owner guardrails (e.g. can act on bookings after move-in dates) for support
purposes.

---

### Quick reference — the numbers that matter
- **Booking advance:** **20%** of first month's rent, on booking/acceptance
- **Balance:** **80% + security deposit**, due at move-in
- **Security deposit:** **1 month's rent** (refundable)
- **Max discount:** **50%**
- **Seat types:** **Single · Double · Triple · Quad · Dormitory (Sharing)**
- **Hostel categories:** **Boys · Girls · Co-living/Family**
- **Promotion plans:** 1 day · 3 days · 7 days · 30 days
- **Owner lifecycle:** pending → approved (or rejected / suspended)

> **Note:** These numbers are the platform's configurable defaults for Find Your Hostel
> (adapted to the hostel domain). Payment-gateway integration and final percentages are open
> decisions to confirm before implementation.
