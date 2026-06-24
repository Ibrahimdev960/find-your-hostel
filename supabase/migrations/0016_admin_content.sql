-- 0016_admin_content.sql — Find Your Hostel · M13 (Web Admin Panel — slice 3)
-- Content moderation. Reviews gain a soft-hide flag an admin can toggle; hidden reviews
-- drop out of the hostel's average rating. Community posts/replies already allow admin
-- delete via their RLS (0011), so they need no schema change here.

-- ─────────────────────────────────────────────────────────────────────────────
-- reviews.is_hidden — soft moderation. Hidden reviews are filtered from public lists
-- (in the API) and excluded from the rating aggregate below.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.reviews
  add column if not exists is_hidden boolean not null default false;

-- Admins may update any review (to toggle is_hidden). The existing reviews_update
-- policy only covers the author + hostel owner; this adds an admin-scoped path.
drop policy if exists "reviews_update_admin" on public.reviews;
create policy "reviews_update_admin" on public.reviews for update
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- recompute_hostel_rating — replace (from 0010) to count only NON-hidden reviews,
-- so hiding/un-hiding a review immediately reflects in avg_rating + review_count.
-- (Same new-review notification behaviour as before.)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.recompute_hostel_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare h uuid; owner uuid;
begin
  h := coalesce(new.hostel_id, old.hostel_id);
  update public.hostels x
     set avg_rating = coalesce(
           (select round(avg(rating_overall), 2) from public.reviews
             where hostel_id = h and not is_hidden), 0),
         review_count = (select count(*) from public.reviews
             where hostel_id = h and not is_hidden)
   where x.id = h
  returning x.owner_id into owner;

  if tg_op = 'INSERT' and owner is not null then
    perform public.create_notification(owner, 'review_received',
      'New review', 'Your hostel received a ' || new.rating_overall || '★ review.',
      jsonb_build_object('hostel_id', h, 'review_id', new.id));
  end if;
  return null;
end; $$;

-- (trigger trg_recompute_hostel_rating from 0010 already points at this function;
--  re-create it defensively in case migrations are replayed out of order.)
drop trigger if exists trg_recompute_hostel_rating on public.reviews;
create trigger trg_recompute_hostel_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_hostel_rating();
