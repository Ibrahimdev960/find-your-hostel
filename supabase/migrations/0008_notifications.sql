-- 0008_notifications.sql — Find Your Hostel · M7 (Notifications)
-- Notifications are generated IN THE DATABASE by triggers on domain events (CLAUDE.md §4.13).
-- A `notifications` table is the source of truth; Realtime drives the in-app bell; a
-- `push_tokens` table + (future) DB webhook delivers out-of-app push.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enum — the full notification-type union (some are emitted by later modules M8/M9).
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.notification_type as enum (
    'hostel_approved',
    'hostel_rejected',
    'booking_created',
    'booking_status',
    'booking_cancelled',
    'offer_received',
    'offer_accepted',
    'payment_submitted',
    'payment_confirmed',
    'payment_rejected',
    'new_message',
    'review_received'
  );
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       public.notification_type not null,
  title      text not null,
  body       text,
  data       jsonb not null default '{}'::jsonb,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where is_read = false;

-- ─────────────────────────────────────────────────────────────────────────────
-- push_tokens — one row per device/browser token
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  token      text not null unique,
  platform   text not null default 'web',     -- web | ios | android | expo
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_user_idx on public.push_tokens (user_id);

drop trigger if exists trg_push_tokens_updated_at on public.push_tokens;
create trigger trg_push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- create_notification — single insertion point used by every domain-event trigger.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.create_notification(
  p_user_id uuid,
  p_type    public.notification_type,
  p_title   text,
  p_body    text default null,
  p_data    jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (user_id, type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, coalesce(p_data, '{}'::jsonb));
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Domain-event triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- Hostel verified / rejected → notify the owner.
create or replace function public.notify_hostel_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'verified' then
      perform public.create_notification(new.owner_id, 'hostel_approved',
        'Listing verified', new.name || ' has been verified — you can publish it now.',
        jsonb_build_object('hostel_id', new.id));
    elsif new.status = 'rejected' then
      perform public.create_notification(new.owner_id, 'hostel_rejected',
        'Listing rejected', coalesce(new.rejection_reason, 'Your listing was not approved.'),
        jsonb_build_object('hostel_id', new.id));
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_notify_hostel_status on public.hostels;
create trigger trg_notify_hostel_status
  after update on public.hostels
  for each row execute function public.notify_hostel_status();

-- Booking created → notify owner; status changes → notify student (+ owner on cancel).
create or replace function public.notify_booking()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform public.create_notification(new.owner_id, 'booking_created',
      'New booking request', 'A student requested a seat in your hostel.',
      jsonb_build_object('booking_id', new.id, 'hostel_id', new.hostel_id));
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'cancelled' then
      perform public.create_notification(new.owner_id, 'booking_cancelled',
        'Booking cancelled', 'A booking was cancelled.',
        jsonb_build_object('booking_id', new.id));
    else
      perform public.create_notification(new.student_id, 'booking_status',
        'Booking updated', 'Your booking status is now ' || replace(new.status::text, '_', ' ') || '.',
        jsonb_build_object('booking_id', new.id, 'status', new.status));
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_notify_booking on public.bookings;
create trigger trg_notify_booking
  after insert or update on public.bookings
  for each row execute function public.notify_booking();

-- Offer created → notify the request's student; accepted → notify the owner.
create or replace function public.notify_offer()
returns trigger language plpgsql security definer set search_path = public as $$
declare student uuid;
begin
  select student_id into student from public.requests where id = new.request_id;
  if tg_op = 'INSERT' then
    perform public.create_notification(student, 'offer_received',
      'New offer', 'An owner sent an offer on your request.',
      jsonb_build_object('request_id', new.request_id, 'offer_id', new.id));
  elsif new.status is distinct from old.status and new.status = 'accepted' then
    perform public.create_notification(new.owner_id, 'offer_accepted',
      'Offer accepted', 'A student accepted your offer.',
      jsonb_build_object('request_id', new.request_id, 'offer_id', new.id));
  end if;
  return new;
end; $$;

drop trigger if exists trg_notify_offer on public.offers;
create trigger trg_notify_offer
  after insert or update on public.offers
  for each row execute function public.notify_offer();

-- Payment submitted → notify owner; confirmed/rejected → notify the payer.
create or replace function public.notify_payment()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  select owner_id into owner from public.bookings where id = new.booking_id;
  if tg_op = 'INSERT' then
    perform public.create_notification(owner, 'payment_submitted',
      'Payment submitted', 'A student submitted a ' || new.stage::text || ' payment.',
      jsonb_build_object('booking_id', new.booking_id, 'payment_id', new.id));
  elsif new.status is distinct from old.status then
    if new.status = 'confirmed' then
      perform public.create_notification(new.payer_id, 'payment_confirmed',
        'Payment confirmed', 'Your ' || new.stage::text || ' payment was confirmed.',
        jsonb_build_object('booking_id', new.booking_id, 'payment_id', new.id));
    elsif new.status = 'rejected' then
      perform public.create_notification(new.payer_id, 'payment_rejected',
        'Payment rejected', coalesce(new.rejection_reason, 'Your payment was rejected.'),
        jsonb_build_object('booking_id', new.booking_id, 'payment_id', new.id));
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_notify_payment on public.payments;
create trigger trg_notify_payment
  after insert or update on public.payments
  for each row execute function public.notify_payment();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — users see/clear only their own notifications; manage their own push tokens.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications for delete
  using (user_id = auth.uid());

drop policy if exists "push_tokens_own" on public.push_tokens;
create policy "push_tokens_own" on public.push_tokens for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime — publish notification inserts so the in-app bell updates live.
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;
