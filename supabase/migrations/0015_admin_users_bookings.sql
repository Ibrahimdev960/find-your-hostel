-- 0015_admin_users_bookings.sql — Find Your Hostel · M13 (Web Admin Panel — slice 2)
-- Users management (suspend/reactivate, with a guard closing the self-edit hole) and a
-- read-only bookings monitor RPC. Builds on 0014_admin (activity_logs + log_activity).

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles: suspension state for any user (owners already have their own gate via
-- owner_profiles.status; this covers students/owners as platform accounts).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists suspended        boolean not null default false,
  add column if not exists suspended_at     timestamptz,
  add column if not exists suspended_reason text;

create index if not exists profiles_suspended_idx on public.profiles (suspended) where suspended;

-- ─────────────────────────────────────────────────────────────────────────────
-- Guard: non-admins can never change admin-owned profile fields (suspended flags,
-- role). This closes a latent hole — the profiles update policy allows a user to
-- update their own row, which would otherwise let a suspended user clear the flag
-- or self-promote to admin. Admin writes pass through untouched.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role             := old.role;
    new.suspended        := old.suspended;
    new.suspended_at     := old.suspended_at;
    new.suspended_reason := old.suspended_reason;
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_profile_admin_fields on public.profiles;
create trigger trg_guard_profile_admin_fields
  before update on public.profiles
  for each row execute function public.guard_profile_admin_fields();

-- ─────────────────────────────────────────────────────────────────────────────
-- admin_set_user_suspended — suspend / reactivate a user account (admin only),
-- audited via log_activity (0014). Reversible; hard account deletion is deferred
-- (it spans auth.users + FK cascades against the booking edit-lock triggers).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.admin_set_user_suspended(
  p_user_id   uuid,
  p_suspended boolean,
  p_reason    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin role required';
  end if;

  update public.profiles
     set suspended        = p_suspended,
         suspended_at     = case when p_suspended then now() else null end,
         suspended_reason = case when p_suspended then p_reason else null end
   where id = p_user_id;

  perform public.log_activity(
    case when p_suspended then 'user.suspended' else 'user.reactivated' end,
    'user',
    p_user_id,
    jsonb_build_object('reason', p_reason)
  );
end; $$;

grant execute on function public.admin_set_user_suspended(uuid, boolean, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- admin_list_bookings — read-only platform-wide bookings feed for the admin monitor.
-- security definer + admin guard; flattens hostel + student/owner names so the admin
-- UI needs no cross-role profile reads. Newest first; optional status filter.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.admin_list_bookings(
  p_status public.booking_status default null,
  p_limit  integer default 100
)
returns table (
  id             uuid,
  hostel_id      uuid,
  hostel_name    text,
  student_name   text,
  owner_name     text,
  occupancy      public.seat_type,
  status         public.booking_status,
  payment_method public.payment_method,
  effective_rent numeric,
  advance_amount numeric,
  move_in_date   date,
  created_at     timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin role required';
  end if;

  return query
  select
    b.id,
    b.hostel_id,
    h.name        as hostel_name,
    sp.full_name  as student_name,
    op.full_name  as owner_name,
    b.occupancy,
    b.status,
    b.payment_method,
    b.effective_rent,
    b.advance_amount,
    b.move_in_date,
    b.created_at
  from public.bookings b
  left join public.hostels  h  on h.id  = b.hostel_id
  left join public.profiles sp on sp.id = b.student_id
  left join public.profiles op on op.id = b.owner_id
  where p_status is null or b.status = p_status
  order by b.created_at desc
  limit greatest(1, least(p_limit, 500));
end; $$;

grant execute on function public.admin_list_bookings(public.booking_status, integer) to authenticated;
