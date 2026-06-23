-- 0005_bookings.sql — Find Your Hostel · M4 (Booking & Seat Availability)
-- Per-seat bookings with a DB-enforced overbooking guard, server-side price snapshot,
-- a status lifecycle (CLAUDE.md §5.8) and live seat-availability RPC.
-- Also adds the edit-lock deferred from M2: a hostel/seat_type with active bookings
-- locks its material fields and cannot be deleted.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.payment_method as enum ('bank_transfer', 'jazzcash', 'easypaisa', 'cash');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum (
    'pending',
    'payment_pending_approval',
    'awaiting_advance',
    'advance_submitted',
    'advance_rejected',
    'pending_owner_confirmation',
    'reserved',
    'moved_in',
    'active',
    'completed',
    'cancelled',
    'rejected',
    'expired'
  );
exception when duplicate_object then null; end $$;

-- A booking "consumes" a seat unless it has been released (cancelled/rejected/expired)
-- or the stay is over (completed). Used by the overbooking guard + availability counts.
create or replace function public.booking_consumes_seat(s public.booking_status)
returns boolean
language sql
immutable
as $$
  select s not in ('cancelled', 'rejected', 'expired', 'completed');
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- bookings
--   Price columns are SNAPSHOT server-side on insert (never trusted from client).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  hostel_id        uuid not null references public.hostels (id) on delete restrict,
  seat_type_id     uuid not null references public.seat_types (id) on delete restrict,
  student_id       uuid not null references public.profiles (id) on delete cascade,
  owner_id         uuid not null references public.profiles (id) on delete cascade,
  -- snapshot of the seat at booking time
  occupancy        public.seat_type not null,
  monthly_rent     numeric not null,
  discount_percent numeric not null default 0,
  effective_rent   numeric not null,
  advance_amount   numeric not null,
  balance_amount   numeric not null,
  security_deposit numeric not null,
  -- booking details
  move_in_date     date not null,
  duration_months  integer not null default 1 check (duration_months > 0),
  special_requests text,
  payment_method   public.payment_method not null,
  status           public.booking_status not null default 'pending',
  cancel_reason    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists bookings_student_idx on public.bookings (student_id);
create index if not exists bookings_owner_idx   on public.bookings (owner_id);
create index if not exists bookings_hostel_idx  on public.bookings (hostel_id);
create index if not exists bookings_seat_idx    on public.bookings (seat_type_id);
create index if not exists bookings_status_idx  on public.bookings (status);

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Guard: snapshot pricing, enforce who may create/transition, block overbooking.
--   • INSERT: only a student, for themselves, against a PUBLISHED hostel. Price +
--     owner_id + occupancy are snapshotted from the seat type. Initial status is
--     derived from payment method (cash → owner confirmation, online → advance).
--   • Overbooking: a seat-consuming row can't exceed the seat type's total_seats.
--   • UPDATE: a student may only CANCEL their own (pre-active) booking; owner/admin
--     drive the owner-side transitions (handled by RLS + app).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  st public.seat_types%rowtype;
  h  public.hostels%rowtype;
  consumed integer;
begin
  select * into st from public.seat_types where id = new.seat_type_id;
  if not found then raise exception 'Seat type not found'; end if;
  select * into h from public.hostels where id = st.hostel_id;

  if tg_op = 'INSERT' then
    -- snapshot
    new.hostel_id        := h.id;
    new.owner_id         := h.owner_id;
    new.occupancy        := st.occupancy;
    new.monthly_rent     := st.monthly_rent;
    new.discount_percent := st.discount_percent;
    new.effective_rent   := round(st.monthly_rent * (1 - st.discount_percent / 100.0));
    new.advance_amount   := round(new.effective_rent * 0.20);
    new.balance_amount   := round(new.effective_rent * 0.80);
    new.security_deposit := round(new.effective_rent * h.security_deposit_months);

    if not public.is_admin() then
      if public.current_role() <> 'student' or new.student_id <> auth.uid() then
        raise exception 'Only a student can create their own booking';
      end if;
    end if;

    if h.status <> 'published' then
      raise exception 'This hostel is not available for booking';
    end if;

    -- initial status is always derived server-side from the chosen payment method
    new.status := case
      when new.payment_method = 'cash' then 'pending_owner_confirmation'::public.booking_status
      else 'awaiting_advance'::public.booking_status
    end;
  end if;

  -- overbooking guard (only when this row holds a seat)
  if public.booking_consumes_seat(new.status) then
    select count(*) into consumed
    from public.bookings b
    where b.seat_type_id = new.seat_type_id
      and b.id <> new.id
      and public.booking_consumes_seat(b.status);
    if consumed >= st.total_seats then
      raise exception 'Fully booked: no seats available for this seat type';
    end if;
  end if;

  -- transition rules on UPDATE
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if not public.is_admin() and new.student_id = auth.uid() and new.owner_id <> auth.uid() then
      if new.status <> 'cancelled' then
        raise exception 'You can only cancel your booking';
      end if;
      if old.status in ('active', 'completed', 'cancelled', 'rejected', 'expired') then
        raise exception 'This booking can no longer be cancelled';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_booking on public.bookings;
create trigger trg_guard_booking
  before insert or update on public.bookings
  for each row execute function public.guard_booking();

-- ─────────────────────────────────────────────────────────────────────────────
-- Edit-lock (deferred from M2): a hostel with any seat-consuming booking locks its
-- material fields, and such a hostel / seat type cannot be deleted.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.hostel_has_active_bookings(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings b
    where b.hostel_id = h and public.booking_consumes_seat(b.status)
  );
$$;

create or replace function public.guard_seat_type_edit_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from public.bookings b
               where b.seat_type_id = old.id and public.booking_consumes_seat(b.status)) then
      raise exception 'Seat type has active bookings and cannot be deleted';
    end if;
    return old;
  end if;

  -- UPDATE: lock price/capacity-defining fields while seats are held
  if exists (select 1 from public.bookings b
             where b.seat_type_id = old.id and public.booking_consumes_seat(b.status)) then
    if new.monthly_rent is distinct from old.monthly_rent
       or new.total_seats is distinct from old.total_seats
       or new.occupancy is distinct from old.occupancy
       or new.discount_percent is distinct from old.discount_percent then
      raise exception 'Seat type is locked while it has active bookings';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_seat_type_edit_lock on public.seat_types;
create trigger trg_seat_type_edit_lock
  before update or delete on public.seat_types
  for each row execute function public.guard_seat_type_edit_lock();

create or replace function public.guard_hostel_delete_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.hostel_has_active_bookings(old.id) then
    raise exception 'Hostel has active bookings and cannot be deleted';
  end if;
  return old;
end;
$$;

drop trigger if exists trg_hostel_delete_lock on public.hostels;
create trigger trg_hostel_delete_lock
  before delete on public.hostels
  for each row execute function public.guard_hostel_delete_lock();

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-expire unconfirmed bookings past the window (called by a scheduled job /
-- edge function; safe to run repeatedly).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.expire_stale_bookings(p_hours integer default 48)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  update public.bookings
     set status = 'expired'
   where status in (
           'pending', 'payment_pending_approval', 'awaiting_advance',
           'advance_submitted', 'advance_rejected', 'pending_owner_confirmation'
         )
     and created_at < now() - make_interval(hours => p_hours);
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- seat_availability — live seat counts per seat type for a hostel.
-- security definer: only counts; gated to published hostels (or owner/admin).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.seat_availability(p_hostel_id uuid)
returns table (
  seat_type_id    uuid,
  occupancy       public.seat_type,
  total_seats     integer,
  booked_seats    integer,
  available_seats integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    s.occupancy,
    s.total_seats,
    coalesce(c.booked, 0)::integer,
    (s.total_seats - coalesce(c.booked, 0))::integer
  from public.seat_types s
  join public.hostels h on h.id = s.hostel_id
  left join lateral (
    select count(*)::integer as booked
    from public.bookings b
    where b.seat_type_id = s.id and public.booking_consumes_seat(b.status)
  ) c on true
  where s.hostel_id = p_hostel_id
    and (h.status = 'published' or h.owner_id = auth.uid() or public.is_admin());
$$;

grant execute on function public.seat_availability(uuid) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.bookings enable row level security;

-- read: the student who booked, the owner of the hostel, or an admin
drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings for select
  using (student_id = auth.uid() or owner_id = auth.uid() or public.is_admin());

-- create: a student books for themselves (other columns snapshotted by the trigger)
drop policy if exists "bookings_insert_student" on public.bookings;
create policy "bookings_insert_student" on public.bookings for insert
  with check (student_id = auth.uid() and public.current_role() = 'student');

-- update: student (cancel only — enforced by trigger), owner of the hostel, or admin
drop policy if exists "bookings_update" on public.bookings;
create policy "bookings_update" on public.bookings for update
  using (student_id = auth.uid() or owner_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or owner_id = auth.uid() or public.is_admin());
