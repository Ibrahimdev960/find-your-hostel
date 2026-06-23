-- 0003_hostels.sql — Find Your Hostel · M2 (Hostel Management / Listings)
-- hostels + seat_types + hostel_images + facilities/hostel_facilities.
-- Verification gate: draft → pending → verified → published (admin verifies; owner publishes).
-- Edit-lock on active bookings is enforced in M4 (bookings don't exist yet).

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.hostel_type as enum ('boys', 'girls', 'co_living');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.seat_type as enum ('single', 'double', 'triple', 'quad', 'dormitory');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.hostel_status as enum
    ('draft', 'pending', 'verified', 'published', 'unpublished', 'rejected');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- hostels
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.hostels (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references public.profiles (id) on delete cascade,
  name                text not null,
  hostel_type         public.hostel_type not null,
  description         text,
  address             text,
  city                text,
  nearest_institution text,
  latitude            double precision,
  longitude           double precision,
  house_rules         text,
  meal_plan           text,
  curfew              text,
  security_deposit_months numeric not null default 1,
  cover_image_url     text,
  status              public.hostel_status not null default 'draft',
  avg_rating          numeric not null default 0,
  review_count        integer not null default 0,
  submitted_at        timestamptz,
  reviewed_at         timestamptz,
  reviewed_by         uuid references public.profiles (id),
  rejection_reason    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists hostels_owner_idx on public.hostels (owner_id);
create index if not exists hostels_status_idx on public.hostels (status);
create index if not exists hostels_city_idx on public.hostels (city);

drop trigger if exists trg_hostels_updated_at on public.hostels;
create trigger trg_hostels_updated_at
  before update on public.hostels
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- seat_types (per-occupancy rent + capacity)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.seat_types (
  id            uuid primary key default gen_random_uuid(),
  hostel_id     uuid not null references public.hostels (id) on delete cascade,
  occupancy     public.seat_type not null,
  monthly_rent  numeric not null check (monthly_rent >= 0),
  total_seats   integer not null check (total_seats > 0),
  is_ac         boolean not null default false,
  attached_bath boolean not null default false,
  discount_percent numeric not null default 0 check (discount_percent >= 0 and discount_percent <= 50),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists seat_types_hostel_idx on public.seat_types (hostel_id);

drop trigger if exists trg_seat_types_updated_at on public.seat_types;
create trigger trg_seat_types_updated_at
  before update on public.seat_types
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- hostel_images (gallery + cover)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.hostel_images (
  id          uuid primary key default gen_random_uuid(),
  hostel_id   uuid not null references public.hostels (id) on delete cascade,
  url         text not null,
  is_cover    boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists hostel_images_hostel_idx on public.hostel_images (hostel_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- facilities catalog + join
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.facilities (
  id       uuid primary key default gen_random_uuid(),
  key      text unique not null,
  label    text not null,
  category text
);

create table if not exists public.hostel_facilities (
  hostel_id   uuid not null references public.hostels (id) on delete cascade,
  facility_id uuid not null references public.facilities (id) on delete cascade,
  primary key (hostel_id, facility_id)
);

-- Seed the amenity catalog (idempotent).
insert into public.facilities (key, label, category) values
  ('wifi', 'Wi-Fi', 'amenity'),
  ('meals', 'Meals', 'amenity'),
  ('laundry', 'Laundry', 'amenity'),
  ('ac', 'Air Conditioning', 'amenity'),
  ('study_room', 'Study Room', 'amenity'),
  ('backup_power', 'Backup Power', 'amenity'),
  ('security', 'Security / CCTV', 'amenity'),
  ('parking', 'Parking', 'amenity'),
  ('cleaning', 'Cleaning Service', 'amenity'),
  ('common_room', 'Common Room', 'amenity')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- Status guard + publish gate
--   • only admins may set 'verified' / 'rejected' (stamps reviewed_*)
--   • publishing requires an approved owner and a hostel that has been verified
--   • owner submitting (→ 'pending') stamps submitted_at
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_hostel_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_ok boolean;
begin
  if tg_op = 'INSERT' then
    if not public.is_admin() and new.status in ('verified', 'rejected') then
      new.status := 'draft';
    end if;
    if new.status = 'pending' then
      new.submitted_at := now();
    end if;
    return new;
  end if;

  -- UPDATE
  if new.status is distinct from old.status then
    -- admin-only transitions
    if new.status in ('verified', 'rejected') then
      if not public.is_admin() then
        raise exception 'Only an admin can set status %', new.status;
      end if;
      new.reviewed_at := now();
      new.reviewed_by := auth.uid();
    end if;

    -- owner submits for review
    if new.status = 'pending' then
      new.submitted_at := now();
    end if;

    -- publish gate (admins bypass)
    if new.status = 'published' and not public.is_admin() then
      select status = 'approved' into owner_ok from public.owner_profiles where id = new.owner_id;
      if not coalesce(owner_ok, false) then
        raise exception 'Owner must be approved before publishing a hostel';
      end if;
      if old.status not in ('verified', 'unpublished', 'published') then
        raise exception 'Hostel must be verified before it can be published';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_hostel_status on public.hostels;
create trigger trg_guard_hostel_status
  before insert or update on public.hostels
  for each row execute function public.guard_hostel_status();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.hostels enable row level security;
alter table public.seat_types enable row level security;
alter table public.hostel_images enable row level security;
alter table public.facilities enable row level security;
alter table public.hostel_facilities enable row level security;

-- hostels: public sees published; owner sees own; admin sees all
drop policy if exists "hostels_select" on public.hostels;
create policy "hostels_select" on public.hostels for select
  using (status = 'published' or owner_id = auth.uid() or public.is_admin());

drop policy if exists "hostels_insert_owner" on public.hostels;
create policy "hostels_insert_owner" on public.hostels for insert
  with check (owner_id = auth.uid() and public.current_role() = 'owner');

drop policy if exists "hostels_update_owner_or_admin" on public.hostels;
create policy "hostels_update_owner_or_admin" on public.hostels for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists "hostels_delete_owner_or_admin" on public.hostels;
create policy "hostels_delete_owner_or_admin" on public.hostels for delete
  using (owner_id = auth.uid() or public.is_admin());

-- helper predicate reused by child tables
-- (a hostel is "visible" if published, owned by the user, or the user is admin)
create or replace function public.can_read_hostel(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.hostels x
    where x.id = h and (x.status = 'published' or x.owner_id = auth.uid() or public.is_admin())
  );
$$;

create or replace function public.can_write_hostel(h uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.hostels x
    where x.id = h and (x.owner_id = auth.uid() or public.is_admin())
  );
$$;

-- seat_types
drop policy if exists "seat_types_select" on public.seat_types;
create policy "seat_types_select" on public.seat_types for select
  using (public.can_read_hostel(hostel_id));

drop policy if exists "seat_types_write" on public.seat_types;
create policy "seat_types_write" on public.seat_types for all
  using (public.can_write_hostel(hostel_id))
  with check (public.can_write_hostel(hostel_id));

-- hostel_images
drop policy if exists "hostel_images_select" on public.hostel_images;
create policy "hostel_images_select" on public.hostel_images for select
  using (public.can_read_hostel(hostel_id));

drop policy if exists "hostel_images_write" on public.hostel_images;
create policy "hostel_images_write" on public.hostel_images for all
  using (public.can_write_hostel(hostel_id))
  with check (public.can_write_hostel(hostel_id));

-- hostel_facilities
drop policy if exists "hostel_facilities_select" on public.hostel_facilities;
create policy "hostel_facilities_select" on public.hostel_facilities for select
  using (public.can_read_hostel(hostel_id));

drop policy if exists "hostel_facilities_write" on public.hostel_facilities;
create policy "hostel_facilities_write" on public.hostel_facilities for all
  using (public.can_write_hostel(hostel_id))
  with check (public.can_write_hostel(hostel_id));

-- facilities: readable by everyone; only admins manage the catalog
drop policy if exists "facilities_select_all" on public.facilities;
create policy "facilities_select_all" on public.facilities for select using (true);

drop policy if exists "facilities_admin_write" on public.facilities;
create policy "facilities_admin_write" on public.facilities for all
  using (public.is_admin()) with check (public.is_admin());
