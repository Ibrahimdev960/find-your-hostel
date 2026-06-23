-- 0006_requests.sql — Find Your Hostel · M5 (Requests & Offers)
-- The student-driven booking path: a student posts a request; verified owners send one
-- offer each; the student accepts one — which marks the request 'booked' and auto-rejects
-- every other pending offer (CLAUDE.md §4.6 / §5.5).

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.request_status as enum
    ('open', 'booked', 'completed', 'cancelled', 'expired', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.offer_status as enum
    ('pending', 'accepted', 'rejected', 'withdrawn', 'expired');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- requests — what a student is looking for
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.requests (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.profiles (id) on delete cascade,
  hostel_type         public.hostel_type,            -- optional gender-category preference
  seat_type           public.seat_type,              -- optional preferred occupancy
  city                text,
  nearest_institution text,
  budget_min          numeric check (budget_min >= 0),
  budget_max          numeric check (budget_max >= 0),
  move_in_date        date,
  duration_months     integer not null default 1 check (duration_months > 0),
  notes               text,
  status              public.request_status not null default 'open',
  -- the offer the student accepted (no FK — avoids a circular dependency with offers)
  accepted_offer_id   uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists requests_student_idx on public.requests (student_id);
create index if not exists requests_status_idx  on public.requests (status);

drop trigger if exists trg_requests_updated_at on public.requests;
create trigger trg_requests_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- offers — an owner's response to a request (one per owner per request)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.offers (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.requests (id) on delete cascade,
  owner_id      uuid not null references public.profiles (id) on delete cascade,
  hostel_id     uuid not null references public.hostels (id) on delete cascade,
  seat_type_id  uuid references public.seat_types (id) on delete set null,
  monthly_rent  numeric not null check (monthly_rent >= 0),
  message       text,
  status        public.offer_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (request_id, owner_id)
);

create index if not exists offers_request_idx on public.offers (request_id);
create index if not exists offers_owner_idx   on public.offers (owner_id);
create index if not exists offers_status_idx  on public.offers (status);

drop trigger if exists trg_offers_updated_at on public.offers;
create trigger trg_offers_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- guard_request — students create their own requests; status starts 'open'.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_admin() then
      if public.current_role() <> 'student' or new.student_id <> auth.uid() then
        raise exception 'Only a student can create their own request';
      end if;
      new.status := 'open';
      new.accepted_offer_id := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_request on public.requests;
create trigger trg_guard_request
  before insert or update on public.requests
  for each row execute function public.guard_request();

-- ─────────────────────────────────────────────────────────────────────────────
-- guard_offer — who may create/transition an offer.
--   • INSERT: an APPROVED owner, for their OWN hostel, on an OPEN request; status='pending'.
--   • UPDATE: the owner may only withdraw; the request's student may accept/reject.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_offer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.requests%rowtype;
  h public.hostels%rowtype;
  owner_status public.owner_verification_status;
begin
  select * into r from public.requests where id = new.request_id;
  if not found then raise exception 'Request not found'; end if;

  if tg_op = 'INSERT' then
    if r.status <> 'open' then
      raise exception 'This request is no longer open';
    end if;

    select * into h from public.hostels where id = new.hostel_id;
    if not found or h.owner_id <> new.owner_id then
      raise exception 'You can only offer one of your own hostels';
    end if;

    if not public.is_admin() then
      if public.current_role() <> 'owner' or new.owner_id <> auth.uid() then
        raise exception 'Only an owner can submit their own offer';
      end if;
      select status into owner_status from public.owner_profiles where id = auth.uid();
      if coalesce(owner_status, 'pending') <> 'approved' then
        raise exception 'Owner must be approved before sending offers';
      end if;
    end if;

    new.status := 'pending';
    return new;
  end if;

  -- UPDATE with a status change
  if new.status is distinct from old.status and not public.is_admin() then
    if auth.uid() = old.owner_id then
      if new.status <> 'withdrawn' then
        raise exception 'You can only withdraw your offer';
      end if;
    elsif r.student_id = auth.uid() then
      if new.status not in ('accepted', 'rejected') then
        raise exception 'You can only accept or reject an offer';
      end if;
      if old.status <> 'pending' then
        raise exception 'This offer can no longer be accepted';
      end if;
    else
      raise exception 'Not allowed to change this offer';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_offer on public.offers;
create trigger trg_guard_offer
  before insert or update on public.offers
  for each row execute function public.guard_offer();

-- ─────────────────────────────────────────────────────────────────────────────
-- on_offer_accepted — accepting an offer books the request and auto-rejects the rest.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.on_offer_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    update public.requests
       set status = 'booked', accepted_offer_id = new.id
     where id = new.request_id;

    update public.offers
       set status = 'rejected'
     where request_id = new.request_id
       and id <> new.id
       and status = 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_on_offer_accepted on public.offers;
create trigger trg_on_offer_accepted
  after update of status on public.offers
  for each row execute function public.on_offer_accepted();

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-expire stale open requests (called by a scheduled job; safe to re-run).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.expire_stale_requests(p_days integer default 30)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  update public.requests
     set status = 'expired'
   where status = 'open'
     and created_at < now() - make_interval(days => p_days);
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.requests enable row level security;
alter table public.offers enable row level security;

-- requests: the student owner, an admin, or (for open requests) any owner browsing the feed
drop policy if exists "requests_select" on public.requests;
create policy "requests_select" on public.requests for select
  using (
    student_id = auth.uid()
    or public.is_admin()
    or (status = 'open' and public.current_role() = 'owner')
  );

drop policy if exists "requests_insert_student" on public.requests;
create policy "requests_insert_student" on public.requests for insert
  with check (student_id = auth.uid() and public.current_role() = 'student');

drop policy if exists "requests_update_owner_or_admin" on public.requests;
create policy "requests_update_owner_or_admin" on public.requests for update
  using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());

drop policy if exists "requests_delete_student" on public.requests;
create policy "requests_delete_student" on public.requests for delete
  using (student_id = auth.uid() or public.is_admin());

-- offers: the owner who made it, an admin, or the student who owns the request
drop policy if exists "offers_select" on public.offers;
create policy "offers_select" on public.offers for select
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_id and r.student_id = auth.uid())
  );

drop policy if exists "offers_insert_owner" on public.offers;
create policy "offers_insert_owner" on public.offers for insert
  with check (owner_id = auth.uid() and public.current_role() = 'owner');

drop policy if exists "offers_update" on public.offers;
create policy "offers_update" on public.offers for update
  using (
    owner_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_id and r.student_id = auth.uid())
  )
  with check (
    owner_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.requests r where r.id = request_id and r.student_id = auth.uid())
  );
