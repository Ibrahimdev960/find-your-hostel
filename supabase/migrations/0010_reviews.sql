-- 0010_reviews.sql — Find Your Hostel · M9 (Reviews & Moderation)
-- Multi-criteria hostel reviews (one per booking) with owner responses + auto-recomputed
-- hostel rating; reports/flags with a moderation lifecycle; user blocks. (CLAUDE.md §4.8.)

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.report_status as enum ('pending', 'reviewing', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_target_type as enum ('hostel', 'review', 'message', 'profile', 'request');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- reviews — one per booking; ratings 1–5. reviewer_name is snapshotted so reviews are
-- publicly readable without exposing the student's profile.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  hostel_id          uuid not null references public.hostels (id) on delete cascade,
  booking_id         uuid not null references public.bookings (id) on delete cascade,
  student_id         uuid not null references public.profiles (id) on delete cascade,
  reviewer_name      text,
  rating_overall     integer not null check (rating_overall between 1 and 5),
  rating_cleanliness integer check (rating_cleanliness between 1 and 5),
  rating_facilities  integer check (rating_facilities between 1 and 5),
  rating_location    integer check (rating_location between 1 and 5),
  rating_value       integer check (rating_value between 1 and 5),
  comment            text,
  owner_response     text,
  owner_responded_at timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (booking_id)
);

create index if not exists reviews_hostel_idx on public.reviews (hostel_id, created_at desc);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- guard_review — eligibility on insert; separate author vs. owner edit rights on update.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_review()
returns trigger language plpgsql security definer set search_path = public as $$
declare b public.bookings%rowtype; hostel_owner uuid;
begin
  if tg_op = 'INSERT' then
    select * into b from public.bookings where id = new.booking_id;
    if not found then raise exception 'Booking not found'; end if;
    if not public.is_admin() then
      if public.current_role() <> 'student' or b.student_id <> auth.uid() then
        raise exception 'Only the booking''s student can review';
      end if;
      if b.status not in ('active', 'completed') then
        raise exception 'You can review only after your stay is active';
      end if;
    end if;
    new.hostel_id  := b.hostel_id;
    new.student_id := b.student_id;
    new.reviewer_name := (select full_name from public.profiles where id = b.student_id);
    new.owner_response := null;
    new.owner_responded_at := null;
    return new;
  end if;

  -- UPDATE: the hostel owner may only respond; the author may only edit their review.
  select owner_id into hostel_owner from public.hostels where id = old.hostel_id;
  if not public.is_admin() then
    if auth.uid() = hostel_owner and auth.uid() <> old.student_id then
      -- owner responding: preserve the review content
      new.hostel_id := old.hostel_id;
      new.student_id := old.student_id;
      new.reviewer_name := old.reviewer_name;
      new.rating_overall := old.rating_overall;
      new.rating_cleanliness := old.rating_cleanliness;
      new.rating_facilities := old.rating_facilities;
      new.rating_location := old.rating_location;
      new.rating_value := old.rating_value;
      new.comment := old.comment;
    elsif auth.uid() = old.student_id then
      -- author editing: preserve the owner response
      new.owner_response := old.owner_response;
      new.owner_responded_at := old.owner_responded_at;
    end if;
  end if;
  if new.owner_response is distinct from old.owner_response and new.owner_response is not null then
    new.owner_responded_at := now();
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_review on public.reviews;
create trigger trg_guard_review
  before insert or update on public.reviews
  for each row execute function public.guard_review();

-- Recompute the hostel's average rating + count, and notify the owner on a new review.
create or replace function public.recompute_hostel_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare h uuid; owner uuid;
begin
  h := coalesce(new.hostel_id, old.hostel_id);
  update public.hostels x
     set avg_rating = coalesce((select round(avg(rating_overall), 2) from public.reviews where hostel_id = h), 0),
         review_count = (select count(*) from public.reviews where hostel_id = h)
   where x.id = h
  returning x.owner_id into owner;

  if tg_op = 'INSERT' and owner is not null then
    perform public.create_notification(owner, 'review_received',
      'New review', 'Your hostel received a ' || new.rating_overall || '★ review.',
      jsonb_build_object('hostel_id', h, 'review_id', new.id));
  end if;
  return null;
end; $$;

drop trigger if exists trg_recompute_hostel_rating on public.reviews;
create trigger trg_recompute_hostel_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_hostel_rating();

-- ─────────────────────────────────────────────────────────────────────────────
-- reports — flags on any content, with a moderation lifecycle.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  reporter_id     uuid not null references public.profiles (id) on delete cascade,
  target_type     public.report_target_type not null,
  target_id       uuid not null,
  reason          text not null,
  status          public.report_status not null default 'pending',
  resolution_note text,
  reviewed_by     uuid references public.profiles (id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists reports_status_idx on public.reports (status, created_at desc);

drop trigger if exists trg_reports_updated_at on public.reports;
create trigger trg_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

create or replace function public.guard_report()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.reporter_id := auth.uid();
    new.status := 'pending';
    new.reviewed_by := null;
    new.reviewed_at := null;
    return new;
  end if;
  if new.status is distinct from old.status and new.status in ('resolved', 'dismissed') then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_report on public.reports;
create trigger trg_guard_report
  before insert or update on public.reports
  for each row execute function public.guard_report();

-- ─────────────────────────────────────────────────────────────────────────────
-- blocks — a user blocks another user.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.blocks (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- reviews: readable wherever the hostel is (published / owner / admin); author inserts; author
-- or hostel owner (or admin) update — field-level rights enforced by the guard above.
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews for select
  using (public.can_read_hostel(hostel_id));

drop policy if exists "reviews_insert_student" on public.reviews;
create policy "reviews_insert_student" on public.reviews for insert
  with check (student_id = auth.uid() and public.current_role() = 'student');

drop policy if exists "reviews_update" on public.reviews;
create policy "reviews_update" on public.reviews for update
  using (student_id = auth.uid() or public.can_write_hostel(hostel_id))
  with check (student_id = auth.uid() or public.can_write_hostel(hostel_id));

-- reports: reporter sees own; admin sees/updates all.
drop policy if exists "reports_select" on public.reports;
create policy "reports_select" on public.reports for select
  using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports for insert
  with check (reporter_id = auth.uid());

drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin" on public.reports for update
  using (public.is_admin()) with check (public.is_admin());

-- blocks: a user manages only their own blocks.
drop policy if exists "blocks_own" on public.blocks;
create policy "blocks_own" on public.blocks for all
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
