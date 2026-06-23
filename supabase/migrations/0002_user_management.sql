-- 0002_user_management.sql — Find Your Hostel · M1 (User Management & Auth)
-- Adds owner_profiles (business details + verification gate) on top of profiles (0001).
-- Owner lifecycle: pending → approved (or rejected / suspended). §5.3 / §3.1.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enum
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.owner_verification_status as enum
    ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- owner_profiles — 1:1 with a profile whose role = 'owner'
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.owner_profiles (
  id                 uuid primary key references public.profiles (id) on delete cascade,
  business_name      text,
  cnic               text,                 -- national ID number
  cnic_front_url     text,                 -- storage: owner-documents/<uid>/...
  cnic_back_url      text,
  ownership_proof_url text,
  address            text,
  city               text,
  status             public.owner_verification_status not null default 'pending',
  submitted_at       timestamptz,          -- set when the owner submits documents
  reviewed_at        timestamptz,          -- set by admin on approve/reject
  reviewed_by        uuid references public.profiles (id),
  rejection_reason   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists owner_profiles_status_idx on public.owner_profiles (status);

drop trigger if exists trg_owner_profiles_updated_at on public.owner_profiles;
create trigger trg_owner_profiles_updated_at
  before update on public.owner_profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Guard trigger — owners can never set/alter their own verification status.
-- Non-admins: status (and review fields) are forced/preserved by the server.
-- Admins: changing status stamps reviewed_at / reviewed_by automatically.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_owner_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_admin() then
      new.status := 'pending';
      new.reviewed_at := null;
      new.reviewed_by := null;
      new.rejection_reason := null;
    end if;
    return new;
  end if;

  -- UPDATE
  if public.is_admin() then
    if new.status is distinct from old.status then
      new.reviewed_at := now();
      new.reviewed_by := auth.uid();
    end if;
  else
    -- preserve admin-owned fields against tampering by the owner
    new.status := old.status;
    new.reviewed_at := old.reviewed_at;
    new.reviewed_by := old.reviewed_by;
    new.rejection_reason := old.rejection_reason;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_owner_verification on public.owner_profiles;
create trigger trg_guard_owner_verification
  before insert or update on public.owner_profiles
  for each row execute function public.guard_owner_verification();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
--   • owner reads/writes their own row (status protected by the trigger above)
--   • admins read/write all
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.owner_profiles enable row level security;

drop policy if exists "owner_profiles_select_self_or_admin" on public.owner_profiles;
create policy "owner_profiles_select_self_or_admin"
  on public.owner_profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "owner_profiles_insert_self" on public.owner_profiles;
create policy "owner_profiles_insert_self"
  on public.owner_profiles for insert
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "owner_profiles_update_self_or_admin" on public.owner_profiles;
create policy "owner_profiles_update_self_or_admin"
  on public.owner_profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage — private bucket for verification documents
--   path convention: owner-documents/<user_id>/<file>
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('owner-documents', 'owner-documents', false)
on conflict (id) do nothing;

drop policy if exists "owner_documents_owner_rw" on storage.objects;
create policy "owner_documents_owner_rw"
  on storage.objects for all
  using (
    bucket_id = 'owner-documents'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'owner-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
