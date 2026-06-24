-- 0014_admin.sql — Find Your Hostel · M13 (Web Admin Panel — slice 1)
-- Adds the audit trail (activity_logs) + an owner-status audit trigger, and the
-- admin dashboard KPI RPC. Owner approve/reject/suspend already works via the
-- guard_owner_verification trigger (0002) + admin RLS; this layer adds visibility.

-- ─────────────────────────────────────────────────────────────────────────────
-- activity_logs — admin/audit trail. Written by security-definer triggers/RPCs
-- (which bypass RLS), read by admins only.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,                 -- e.g. 'owner.approved', 'owner.suspended'
  target_type text,                          -- e.g. 'owner_profile', 'hostel', 'user'
  target_id   uuid,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_target_idx on public.activity_logs (target_type, target_id);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_select_admin" on public.activity_logs;
create policy "activity_logs_select_admin" on public.activity_logs for select
  using (public.is_admin());
-- No insert/update/delete policy: rows are written only by security-definer code below.

-- ─────────────────────────────────────────────────────────────────────────────
-- log_activity — reusable insertion point (security definer → bypasses RLS).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.log_activity(
  p_action      text,
  p_target_type text default null,
  p_target_id   uuid default null,
  p_detail      jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_logs (actor_id, action, target_type, target_id, detail)
  values (auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_detail, '{}'::jsonb));
end; $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Audit owner verification status changes (admin-driven). AFTER trigger so it only
-- records committed transitions; complements guard_owner_verification (0002) which
-- still owns the rules.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.audit_owner_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    perform public.log_activity(
      'owner.' || new.status,
      'owner_profile',
      new.id,
      jsonb_build_object('from', old.status, 'to', new.status, 'reason', new.rejection_reason)
    );
  end if;
  return new;
end; $$;

drop trigger if exists trg_audit_owner_status on public.owner_profiles;
create trigger trg_audit_owner_status
  after update on public.owner_profiles
  for each row execute function public.audit_owner_status();

-- ─────────────────────────────────────────────────────────────────────────────
-- admin_dashboard_stats — one-row KPI snapshot for the admin dashboard.
-- security definer + an explicit admin guard (the function reads across all users).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.admin_dashboard_stats()
returns table (
  owners_pending      integer,
  owners_approved     integer,
  owners_suspended    integer,
  listings_pending    integer,
  listings_published  integer,
  reports_open        integer,
  promotions_pending  integer,
  bookings_active     integer,
  bookings_total      integer,
  users_total         integer,
  new_users_7d        integer,
  new_users_30d       integer
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
    (select count(*) from public.owner_profiles where status = 'pending')::int,
    (select count(*) from public.owner_profiles where status = 'approved')::int,
    (select count(*) from public.owner_profiles where status = 'suspended')::int,
    (select count(*) from public.hostels where status = 'pending')::int,
    (select count(*) from public.hostels where status = 'published')::int,
    (select count(*) from public.reports where status in ('pending', 'reviewing'))::int,
    (select count(*) from public.promotions where status = 'pending')::int,
    (select count(*) from public.bookings where status in ('reserved', 'moved_in', 'active'))::int,
    (select count(*) from public.bookings)::int,
    (select count(*) from public.profiles)::int,
    (select count(*) from public.profiles where created_at >= now() - interval '7 days')::int,
    (select count(*) from public.profiles where created_at >= now() - interval '30 days')::int;
end; $$;

grant execute on function public.admin_dashboard_stats() to authenticated;
