-- 0004_search.sql — Find Your Hostel · M3 (Search & Filter)
-- A single search RPC over published hostels: filters (text, city, category, seat type,
-- price range, amenities AND-match), haversine distance, and sortable results.

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes to keep search fast
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists hostels_published_idx on public.hostels (status) where status = 'published';
create index if not exists hostels_geo_idx on public.hostels (latitude, longitude);
create index if not exists seat_types_occ_rent_idx on public.seat_types (hostel_id, occupancy, monthly_rent);

-- ─────────────────────────────────────────────────────────────────────────────
-- search_hostels — returns published listings with cheapest rent + optional distance.
-- security definer: published listings are public; we only ever return status='published'.
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
  distance_km         double precision
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
      end as distance_km
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
      -- must have at least one seat type matching the seat/price filter
      and exists (
        select 1 from public.seat_types s
        where s.hostel_id = h.id
          and (p_seat_type is null or s.occupancy = p_seat_type)
          and (p_min_price is null or s.monthly_rent >= p_min_price)
          and (p_max_price is null or s.monthly_rent <= p_max_price)
      )
      -- amenities: must have ALL requested facilities
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
    cheapest_rent, seat_type_count::integer, distance_km
  from matched
  order by
    case when p_sort = 'price'    then cheapest_rent end asc nulls last,
    case when p_sort = 'distance' then distance_km   end asc nulls last,
    case when p_sort = 'rating'   then avg_rating     end desc nulls last,
    -- relevance fallback (featured ranking is layered in at M11)
    avg_rating desc, review_count desc, created_at desc;
$$;

-- Allow both anonymous and authenticated visitors to search.
grant execute on function public.search_hostels(
  text, text, public.hostel_type, public.seat_type, numeric, numeric, uuid[],
  double precision, double precision, text
) to anon, authenticated;
