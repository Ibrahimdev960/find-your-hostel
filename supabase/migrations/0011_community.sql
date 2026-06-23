-- 0011_community.sql — Find Your Hostel · M10 (Community)
-- Private saved-hostel shortlist + student Q&A posts (optionally anonymous) with replies and
-- likes. Author names are snapshotted (anonymous → null) so the feed needs no profile reads.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enum
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  create type public.community_topic as enum
    ('general', 'area', 'budget', 'facilities', 'food', 'safety');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- saved_hostels — private shortlist (one row per student+hostel)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.saved_hostels (
  student_id uuid not null references public.profiles (id) on delete cascade,
  hostel_id  uuid not null references public.hostels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, hostel_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- community_posts
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.community_posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles (id) on delete cascade,
  author_name   text,
  topic         public.community_topic not null default 'general',
  title         text not null,
  body          text not null,
  is_anonymous  boolean not null default false,
  like_count    integer not null default 0,
  reply_count   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists community_posts_topic_idx on public.community_posts (topic, created_at desc);

drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at
  before update on public.community_posts
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- community_replies
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.community_replies (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.community_posts (id) on delete cascade,
  author_id    uuid not null references public.profiles (id) on delete cascade,
  author_name  text,
  body         text not null,
  is_anonymous boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists community_replies_post_idx on public.community_replies (post_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- post_likes
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.post_likes (
  post_id    uuid not null references public.community_posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Author snapshot + counter triggers
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.stamp_community_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.author_id := auth.uid();
  new.author_name := case
    when new.is_anonymous then null
    else (select full_name from public.profiles where id = auth.uid())
  end;
  return new;
end; $$;

drop trigger if exists trg_stamp_post_author on public.community_posts;
create trigger trg_stamp_post_author
  before insert on public.community_posts
  for each row execute function public.stamp_community_author();

drop trigger if exists trg_stamp_reply_author on public.community_replies;
create trigger trg_stamp_reply_author
  before insert on public.community_replies
  for each row execute function public.stamp_community_author();

create or replace function public.bump_reply_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts set reply_count = reply_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.community_posts set reply_count = greatest(reply_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_bump_reply_count on public.community_replies;
create trigger trg_bump_reply_count
  after insert or delete on public.community_replies
  for each row execute function public.bump_reply_count();

create or replace function public.bump_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts set like_count = like_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.community_posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_bump_like_count on public.post_likes;
create trigger trg_bump_like_count
  after insert or delete on public.post_likes
  for each row execute function public.bump_like_count();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.saved_hostels enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;
alter table public.post_likes enable row level security;

-- saved_hostels: strictly private to the student.
drop policy if exists "saved_hostels_own" on public.saved_hostels;
create policy "saved_hostels_own" on public.saved_hostels for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- community_posts: any signed-in user reads; author writes; author/admin edit+delete.
drop policy if exists "community_posts_select" on public.community_posts;
create policy "community_posts_select" on public.community_posts for select
  using (auth.uid() is not null);

drop policy if exists "community_posts_insert" on public.community_posts;
create policy "community_posts_insert" on public.community_posts for insert
  with check (author_id = auth.uid());

drop policy if exists "community_posts_modify" on public.community_posts;
create policy "community_posts_modify" on public.community_posts for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "community_posts_delete" on public.community_posts;
create policy "community_posts_delete" on public.community_posts for delete
  using (author_id = auth.uid() or public.is_admin());

-- community_replies: same visibility; author writes/deletes.
drop policy if exists "community_replies_select" on public.community_replies;
create policy "community_replies_select" on public.community_replies for select
  using (auth.uid() is not null);

drop policy if exists "community_replies_insert" on public.community_replies;
create policy "community_replies_insert" on public.community_replies for insert
  with check (author_id = auth.uid());

drop policy if exists "community_replies_delete" on public.community_replies;
create policy "community_replies_delete" on public.community_replies for delete
  using (author_id = auth.uid() or public.is_admin());

-- post_likes: a user manages only their own likes; visible to the liker.
drop policy if exists "post_likes_own" on public.post_likes;
create policy "post_likes_own" on public.post_likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
