-- 0013_recommendations.sql — Find Your Hostel · M12 (Recommendations)
-- Rule-based "Recommended for you": a per-student scoring RPC over published listings,
-- fed by a lightweight hostel-view history signal. No ML — a single weighted SQL ranking.

-- ─────────────────────────────────────────────────────────────────────────────
-- hostel_views — private per-student view history (one row per student+hostel,
-- viewed_at refreshed on re-view). A signal source for recommendations alongside
-- saved_hostels and bookings.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.hostel_views (
  student_id uuid not null references public.profiles (id) on delete cascade,
  hostel_id  uuid not null references public.hostels (id)  on delete cascade,
  viewed_at  timestamptz not null default now(),
  view_count integer not null default 1,
  primary key (student_id, hostel_id)
);

create index if not exists hostel_views_student_idx on public.hostel_views (student_id, viewed_at desc);

alter table public.hostel_views enable row level security;

-- A student sees and clears only their own view history.
drop policy if exists "hostel_views_select_own" on public.hostel_views;
create policy "hostel_views_select_own" on public.hostel_views for select
  using (student_id = auth.uid());

drop policy if exists "hostel_views_delete_own" on public.hostel_views;
create policy "hostel_views_delete_own" on public.hostel_views for delete
  using (student_id = auth.uid());

-- Writes go through track_hostel_view() (security definer) — no direct insert/update policy.

-- ─────────────────────────────────────────────────────────────────────────────
-- track_hostel_view — upsert the caller's view of a published hostel (fire-and-forget
-- from the hostel detail page). security definer so the bare table needs no write policy.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.track_hostel_view(p_hostel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return; -- anonymous visitors aren't tracked
  end if;

  -- only track real, published listings
  if not exists (select 1 from public.hostels h where h.id = p_hostel_id and h.status = 'published') then
    return;
  end if;

  insert into public.hostel_views (student_id, hostel_id)
  values (auth.uid(), p_hostel_id)
  on conflict (student_id, hostel_id)
  do update set viewed_at = now(), view_count = public.hostel_views.view_count + 1;
end; $$;

grant execute on function public.track_hostel_view(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- get_recommendations — personalized listings for the current student.
-- Returns the same row shape as search_hostels (so the UI reuses SearchHostelCard).
-- Rule-based score: institution match, saved/viewed/booked city + type affinity,
-- price-band proximity, rating, and the featured boost. New users (no signal) fall
-- back to top-rated published listings, so it never renders empty. distance_km is
-- always null (no origin point on the home surface).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_recommendations(p_limit integer default 8)
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
  with me as (
    select institution from public.profiles where id = auth.uid()
  ),
  -- every hostel the student has engaged with: saved, viewed, or booked
  ref_hostels as (
    select sv.hostel_id from public.saved_hostels sv where sv.student_id = auth.uid()
    union
    select hv.hostel_id from public.hostel_views hv where hv.student_id = auth.uid()
    union
    select b.hostel_id  from public.bookings b      where b.student_id  = auth.uid()
  ),
  -- aggregate affinities from those reference hostels
  ref as (
    select
      array_agg(distinct h.city) filter (where h.city is not null) as cities,
      array_agg(distinct h.hostel_type)                            as types,
      avg(rent.cheapest)                                           as avg_rent
    from ref_hostels rh
    join public.hostels h on h.id = rh.hostel_id
    left join lateral (
      select min(s.monthly_rent * (1 - s.discount_percent / 100.0)) as cheapest
      from public.seat_types s where s.hostel_id = h.id
    ) rent on true
  ),
  -- hostels the student has already booked are excluded (surface fresh options)
  booked as (
    select distinct b.hostel_id from public.bookings b where b.student_id = auth.uid()
  ),
  base as (
    select
      h.*,
      (
        select min(s.monthly_rent * (1 - s.discount_percent / 100.0))
        from public.seat_types s where s.hostel_id = h.id
      ) as cheapest_rent,
      (select count(*) from public.seat_types s where s.hostel_id = h.id) as seat_type_count,
      exists (
        select 1 from public.promotions pr
        where pr.hostel_id = h.id and pr.status = 'active' and now() < pr.expires_at
      ) as is_featured
    from public.hostels h
    where h.status = 'published'
      and not exists (select 1 from booked bk where bk.hostel_id = h.id)
      -- a listing must have at least one seat type to be recommendable
      and exists (select 1 from public.seat_types s where s.hostel_id = h.id)
  ),
  scored as (
    select
      b.*,
      (
        -- institution match (strongest signal)
        case when m.institution is not null and b.nearest_institution is not null
              and b.nearest_institution ilike '%' || m.institution || '%'
             then 3 else 0 end
        -- city affinity
        + case when r.cities is not null and b.city = any(r.cities) then 2 else 0 end
        -- gender/category affinity
        + case when r.types is not null and b.hostel_type = any(r.types) then 2 else 0 end
        -- price-band proximity (within ±40% of the student's typical rent)
        + case when r.avg_rent is not null and b.cheapest_rent is not null
                and b.cheapest_rent between r.avg_rent * 0.6 and r.avg_rent * 1.4
               then 1 else 0 end
        -- rating nudge (keeps quality listings ahead on ties)
        + coalesce(b.avg_rating, 0) * 0.4
      )::numeric as score
    from base b
    left join me  m on true
    left join ref r on true
  )
  select
    id, owner_id, name, hostel_type, city, nearest_institution, address,
    latitude, longitude, cover_image_url, avg_rating, review_count,
    cheapest_rent, seat_type_count::integer,
    null::double precision as distance_km,
    is_featured
  from scored
  order by
    is_featured desc,
    score desc,
    review_count desc,
    created_at desc
  limit greatest(1, least(p_limit, 50));
$$;

grant execute on function public.get_recommendations(integer) to authenticated;
