-- 0007_payments.sql — Find Your Hostel · M6 (Payments)
-- Advance + balance/deposit with MANUAL confirmation (CLAUDE.md §4.7 / §5.6):
-- student submits a payment (transfer + screenshot, or cash) → owner confirms/rejects →
-- the booking lifecycle advances. Amounts are snapshotted server-side from the booking.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.payment_stage as enum ('advance', 'balance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('submitted', 'confirmed', 'rejected');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- payments — one live row per (booking, stage); rejected rows let the student retry.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id               uuid primary key default gen_random_uuid(),
  booking_id       uuid not null references public.bookings (id) on delete cascade,
  payer_id         uuid not null references public.profiles (id) on delete cascade,
  stage            public.payment_stage not null,
  amount           numeric not null,
  method           public.payment_method not null,
  proof_url        text,                       -- storage: payment-proofs/<booking_id>/<file>
  status           public.payment_status not null default 'submitted',
  rejection_reason text,
  confirmed_by     uuid references public.profiles (id),
  confirmed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists payments_booking_idx on public.payments (booking_id);
create index if not exists payments_payer_idx on public.payments (payer_id);
-- at most one non-rejected payment per stage (a rejected one can be re-submitted)
create unique index if not exists payments_one_live_per_stage
  on public.payments (booking_id, stage) where status <> 'rejected';

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Replace guard_booking (from 0005) so a student may also submit their ADVANCE
-- (awaiting_advance / advance_rejected → advance_submitted), driven by the payment
-- trigger below. All other snapshot/overbooking logic is unchanged.
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

    new.status := case
      when new.payment_method = 'cash' then 'pending_owner_confirmation'::public.booking_status
      else 'awaiting_advance'::public.booking_status
    end;
  end if;

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

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if not public.is_admin() and new.student_id = auth.uid() and new.owner_id <> auth.uid() then
      -- a student may cancel, or submit their advance
      if new.status not in ('cancelled', 'advance_submitted') then
        raise exception 'You can only cancel your booking';
      end if;
      if new.status = 'cancelled'
         and old.status in ('active', 'completed', 'cancelled', 'rejected', 'expired') then
        raise exception 'This booking can no longer be cancelled';
      end if;
      if new.status = 'advance_submitted'
         and old.status not in ('awaiting_advance', 'advance_rejected') then
        raise exception 'Advance can only be submitted on a pending booking';
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- guard_payment — snapshot the amount, enforce who may submit/confirm.
--   • INSERT: the booking's student (payer); amount derived from stage + booking.
--   • UPDATE → confirmed/rejected: the booking's owner (or admin) only; stamps confirmer.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare b public.bookings%rowtype;
begin
  select * into b from public.bookings where id = new.booking_id;
  if not found then raise exception 'Booking not found'; end if;

  if tg_op = 'INSERT' then
    if not public.is_admin() and b.student_id <> auth.uid() then
      raise exception 'Only the booking''s student can submit a payment';
    end if;
    new.payer_id := b.student_id;
    new.status := 'submitted';
    new.confirmed_by := null;
    new.confirmed_at := null;
    new.rejection_reason := null;

    if new.stage = 'advance' then
      new.amount := b.advance_amount;
      if b.status not in ('awaiting_advance', 'advance_rejected', 'pending_owner_confirmation') then
        raise exception 'Advance is not due for this booking';
      end if;
    else -- balance
      new.amount := b.balance_amount + b.security_deposit;
      if b.status not in ('reserved', 'moved_in') then
        raise exception 'Balance is not due yet';
      end if;
    end if;
    return new;
  end if;

  -- UPDATE
  if new.status is distinct from old.status then
    if old.status <> 'submitted' then
      raise exception 'This payment has already been reviewed';
    end if;
    if not public.is_admin() and b.owner_id <> auth.uid() then
      raise exception 'Only the hostel owner can confirm or reject a payment';
    end if;
    if new.status = 'confirmed' then
      new.confirmed_by := auth.uid();
      new.confirmed_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_payment on public.payments;
create trigger trg_guard_payment
  before insert or update on public.payments
  for each row execute function public.guard_payment();

-- ─────────────────────────────────────────────────────────────────────────────
-- on_payment_change — advance the booking lifecycle as payments move.
--   advance submitted → advance_submitted ; confirmed → reserved ; rejected → advance_rejected
--   balance  confirmed → active
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.on_payment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stage = 'advance' then
    if tg_op = 'INSERT' then
      update public.bookings set status = 'advance_submitted' where id = new.booking_id;
    elsif new.status = 'confirmed' and old.status is distinct from 'confirmed' then
      update public.bookings set status = 'reserved' where id = new.booking_id;
    elsif new.status = 'rejected' and old.status is distinct from 'rejected' then
      update public.bookings set status = 'advance_rejected' where id = new.booking_id;
    end if;
  else -- balance
    if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
      update public.bookings set status = 'active' where id = new.booking_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_on_payment_change on public.payments;
create trigger trg_on_payment_change
  after insert or update on public.payments
  for each row execute function public.on_payment_change();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — payer and the booking's owner (and admin) can see a payment; only the payer
-- inserts; only owner/admin update (confirm/reject), enforced further by the trigger.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.payments enable row level security;

drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.student_id = auth.uid() or b.owner_id = auth.uid())
    )
  );

drop policy if exists "payments_insert_student" on public.payments;
create policy "payments_insert_student" on public.payments for insert
  with check (
    exists (select 1 from public.bookings b where b.id = booking_id and b.student_id = auth.uid())
  );

drop policy if exists "payments_update_owner_or_admin" on public.payments;
create policy "payments_update_owner_or_admin" on public.payments for update
  using (
    public.is_admin()
    or exists (select 1 from public.bookings b where b.id = booking_id and b.owner_id = auth.uid())
  )
  with check (
    public.is_admin()
    or exists (select 1 from public.bookings b where b.id = booking_id and b.owner_id = auth.uid())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage — re-scope payment-proofs to the BOOKING so the hostel owner can view the
-- student's screenshot. New path convention: payment-proofs/<booking_id>/<file>.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "payment_proofs_owner_rw" on storage.objects;

drop policy if exists "payment_proofs_read" on storage.objects;
create policy "payment_proofs_read" on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and (
      public.is_admin()
      or exists (
        select 1 from public.bookings b
        where b.id::text = (storage.foldername(name))[1]
          and (b.student_id = auth.uid() or b.owner_id = auth.uid())
      )
    )
  );

drop policy if exists "payment_proofs_write" on storage.objects;
create policy "payment_proofs_write" on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and exists (
      select 1 from public.bookings b
      where b.id::text = (storage.foldername(name))[1] and b.student_id = auth.uid()
    )
  );
