-- 0012_promotions.sql — Find Your Hostel · M11 (Promotions / Featured listings)
-- Owners pay to feature a listing (1/3/7/30 days) → admin approves (starts the timer →
-- active) → the hostel ranks higher in search; impressions/clicks tracked. (CLAUDE.md §4.11.)

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.promotion_plan as enum ('featured_1d', 'featured_3d', 'featured_7d', 'featured_30d');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.promotion_status as enum ('pending', 'active', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- promotions
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.promotions (
  id               uuid primary key default gen_random_uuid(),
  hostel_id        uuid not null references public.hostels (id) on delete cascade,
  owner_id         uuid not null references public.profiles (id) on delete cascade,
  plan             public.promotion_plan not null,
  payment_method   public.payment_method not null,
  proof_url        text,
  status           public.promotion_status not null default 'pending',
  starts_at        timestamptz,
  expires_at       timestamptz,
  impressions      integer not null default 0,
  clicks           integer not null default 0,
  rejection_reason text,
  reviewed_by      uuid references public.profiles (id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists promotions_owner_idx on public.promotions (owner_id);
create index if not exists promotions_active_idx
  on public.promotions (hostel_id, expires_at) where status = 'active';

drop trigger if exists trg_promotions_updated_at on public.promotions;
create trigger trg_promotions_updated_at
  before update on public.promotions
  for each row execute function public.set_updated_at();

-- Days each plan runs once approved (mirrors PROMOTION_PLAN_DAYS in shared config).
create or replace function public.promotion_plan_days(p public.promotion_plan)
returns integer language sql immutable as $$
  select case p
    when 'featured_1d' then 1 when 'featured_3d' then 3
    when 'featured_7d' then 7 when 'featured_30d' then 30 end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- guard_promotion — owner submits on own hostel; admin approves (starts timer) / rejects.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_promotion()
returns trigger language plpgsql security definer set search_path = public as $$
declare h public.hostels%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into h from public.hostels where id = new.hostel_id;
    if not found or (not public.is_admin() and h.owner_id <> auth.uid()) then
      raise exception 'You can only promote your own hostel';
    end if;
    new.owner_id := h.owner_id;
    new.status := 'pending';
    new.starts_at := null;
    new.expires_at := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status in ('active', 'rejected') and not public.is_admin() then
      raise exception 'Only an admin can approve or reject a promotion';
    end if;
    if new.status = 'active' then
      new.starts_at := now();
      new.expires_at := now() + make_interval(days => public.promotion_plan_days(new.plan));
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    elsif new.status = 'rejected' then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_promotion on public.promotions;
create trigger trg_guard_promotion
  before insert or update on public.promotions
  for each row execute function public.guard_promotion();

-- Expire promotions past their window (scheduled job; safe to re-run).
create or replace function public.expire_promotions()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.promotions set status = 'expired'
   where status = 'active' and expires_at < now();
  get diagnostics n = row_count;
  return n;
end; $$;

-- Track an impression/click against a hostel's active promotion (public-facing).
create or replace function public.track_promotion_event(p_hostel_id uuid, p_event text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_event = 'click' then
    update public.promotions set clicks = clicks + 1
     where hostel_id = p_hostel_id and status = 'active' and now() < expires_at;
  else
    update public.promotions set impressions = impressions + 1
     where hostel_id = p_hostel_id and status = 'active' and now() < expires_at;
  end if;
end; $$;

grant execute on function public.track_promotion_event(uuid, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- search_hostels — replace (from 0004) to add a `is_featured` flag + featured-first order.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.search_hostels(
  p_q            text             default null,
  p_city         text             default null,
  p_hostel_type  public.hostel_type default null,
  p_seat_type    public.seat_type   default null,
  p_min_price    numeric          default null,
  p_max_price    numeric          default null,
  p_facility_ids uuid[]           default null,
  p_lat          double precision default null,
  p_lng          double precision default null,
  p_sort         text             default 'relevance'
)
returns table (
  id                  uuid,
  owner_id            uuid,
  name                text,
  hostel_type         public.hostel_type,
  city                text,
  nearest_institution text,
  address             text,
  latitude            double precision,
  longitude           double precision,
  cover_image_url     text,
  avg_rating          numeric,
  review_count        integer,
  cheapest_rent       numeric,
  seat_type_count     integer,
  distance_km         double precision,
  is_featured         boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with matched as (
    select
      h.*,
      (
        select min(s.monthly_rent * (1 - s.discount_percent / 100.0))
        from public.seat_types s
        where s.hostel_id = h.id
          and (p_seat_type is null or s.occupancy = p_seat_type)
          and (p_min_price is null or s.monthly_rent >= p_min_price)
          and (p_max_price is null or s.monthly_rent <= p_max_price)
      ) as cheapest_rent,
      (select count(*) from public.seat_types s where s.hostel_id = h.id) as seat_type_count,
      case
        when p_lat is null or p_lng is null or h.latitude is null or h.longitude is null then null
        else 6371 * acos(least(1, greatest(-1,
          cos(radians(p_lat)) * cos(radians(h.latitude)) *
          cos(radians(h.longitude) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(h.latitude))
        )))
      end as distance_km,
      exists (
        select 1 from public.promotions pr
        where pr.hostel_id = h.id and pr.status = 'active' and now() < pr.expires_at
      ) as is_featured
    from public.hostels h
    where h.status = 'published'
      and (p_city is null or h.city ilike '%' || p_city || '%')
      and (p_hostel_type is null or h.hostel_type = p_hostel_type)
      and (
        p_q is null
        or h.name ilike '%' || p_q || '%'
        or h.nearest_institution ilike '%' || p_q || '%'
        or h.city ilike '%' || p_q || '%'
      )
      and exists (
        select 1 from public.seat_types s
        where s.hostel_id = h.id
          and (p_seat_type is null or s.occupancy = p_seat_type)
          and (p_min_price is null or s.monthly_rent >= p_min_price)
          and (p_max_price is null or s.monthly_rent <= p_max_price)
      )
      and (
        p_facility_ids is null
        or array_length(p_facility_ids, 1) is null
        or (
          select count(distinct hf.facility_id)
          from public.hostel_facilities hf
          where hf.hostel_id = h.id and hf.facility_id = any(p_facility_ids)
        ) = array_length(p_facility_ids, 1)
      )
  )
  select
    id, owner_id, name, hostel_type, city, nearest_institution, address,
    latitude, longitude, cover_image_url, avg_rating, review_count,
    cheapest_rent, seat_type_count::integer, distance_km, is_featured
  from matched
  order by
    is_featured desc,
    case when p_sort = 'price'    then cheapest_rent end asc nulls last,
    case when p_sort = 'distance' then distance_km   end asc nulls last,
    case when p_sort = 'rating'   then avg_rating     end desc nulls last,
    avg_rating desc, review_count desc, created_at desc;
$$;

grant execute on function public.search_hostels(
  text, text, public.hostel_type, public.seat_type, numeric, numeric, uuid[],
  double precision, double precision, text
) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.promotions enable row level security;

drop policy if exists "promotions_select" on public.promotions;
create policy "promotions_select" on public.promotions for select
  using (owner_id = auth.uid() or public.is_admin());

drop policy if exists "promotions_insert_owner" on public.promotions;
create policy "promotions_insert_owner" on public.promotions for insert
  with check (owner_id = auth.uid() and public.current_role() = 'owner');

drop policy if exists "promotions_update" on public.promotions;
create policy "promotions_update" on public.promotions for update
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage — let an owner upload/read promotion proofs under payment-proofs/<owner_id>/…
-- (complements the booking-scoped policies from 0007; combined with OR).
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "payment_proofs_owner_folder_read" on storage.objects;
create policy "payment_proofs_owner_folder_read" on storage.objects for select
  using (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "payment_proofs_owner_folder_write" on storage.objects;
create policy "payment_proofs_owner_folder_write" on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
