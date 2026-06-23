-- 0001_init.sql — Find Your Hostel · Foundation (M0)
-- Extensions, base enums, profiles table, signup trigger, RLS helpers, storage buckets.
-- Later migrations (0002+) add hostels, bookings, payments, etc. per the roadmap (§9).

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Enums (foundation only — feature enums land with their modules)
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.user_role as enum ('student', 'owner', 'admin');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at helper
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — extends auth.users (1:1)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         public.user_role not null default 'student',
  full_name    text,
  phone        text,
  gender       text,
  institution  text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Signup trigger — create a profiles row when an auth user is created.
-- Role is read from the signup metadata (raw_user_meta_data->>'role'), defaulting
-- to 'student'. 'admin' can never be self-assigned at signup.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  begin
    requested_role := (new.raw_user_meta_data ->> 'role')::public.user_role;
  exception when others then
    requested_role := 'student';
  end;

  if requested_role is null or requested_role = 'admin' then
    requested_role := 'student';
  end if;

  insert into public.profiles (id, role, full_name)
  values (new.id, requested_role, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS helper functions (reused by every later policy)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS on profiles
--   • a user can read/update their own profile
--   • admins can read/update all
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- (insert is handled by the signup trigger as security definer; no public insert policy)

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage buckets
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('hostel-images', 'hostel-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- hostel-images: public read; authenticated users may upload.
drop policy if exists "hostel_images_public_read" on storage.objects;
create policy "hostel_images_public_read"
  on storage.objects for select
  using (bucket_id = 'hostel-images');

drop policy if exists "hostel_images_auth_write" on storage.objects;
create policy "hostel_images_auth_write"
  on storage.objects for insert
  with check (bucket_id = 'hostel-images' and auth.role() = 'authenticated');

-- payment-proofs: private. Owner of the path (auth.uid() as first folder) reads/writes;
-- admins read all. Path convention: payment-proofs/<user_id>/<file>.
drop policy if exists "payment_proofs_owner_rw" on storage.objects;
create policy "payment_proofs_owner_rw"
  on storage.objects for all
  using (
    bucket_id = 'payment-proofs'
    and (public.is_admin() or (storage.foldername(name))[1] = auth.uid()::text)
  )
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
