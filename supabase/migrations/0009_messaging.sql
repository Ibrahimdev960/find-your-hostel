-- 0009_messaging.sql — Find Your Hostel · M8 (Messaging / Chat)
-- Context-bound student↔owner conversations (optionally about a hostel), realtime messages,
-- per-user pinning, and blocking that stops new messages (CLAUDE.md §4.9 / §5.9).
-- Each new message fires a `new_message` notification (M7).

-- ─────────────────────────────────────────────────────────────────────────────
-- conversations — one per (student, owner, hostel). Pin is per-participant.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles (id) on delete cascade,
  owner_id        uuid not null references public.profiles (id) on delete cascade,
  hostel_id       uuid references public.hostels (id) on delete set null,
  student_pinned  boolean not null default false,
  owner_pinned    boolean not null default false,
  is_blocked      boolean not null default false,
  blocked_by      uuid references public.profiles (id),
  last_message_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists conversations_student_idx on public.conversations (student_id);
create index if not exists conversations_owner_idx on public.conversations (owner_id);
create unique index if not exists conversations_unique_triple
  on public.conversations (student_id, owner_id, coalesce(hostel_id, '00000000-0000-0000-0000-000000000000'::uuid));

drop trigger if exists trg_conversations_updated_at on public.conversations;
create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- messages
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (length(trim(body)) > 0),
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

-- ─────────────────────────────────────────────────────────────────────────────
-- guard_message — sender must be a participant; blocked conversations reject new messages.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.guard_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare c public.conversations%rowtype;
begin
  select * into c from public.conversations where id = new.conversation_id;
  if not found then raise exception 'Conversation not found'; end if;

  if not public.is_admin() and auth.uid() not in (c.student_id, c.owner_id) then
    raise exception 'You are not a participant in this conversation';
  end if;
  if c.is_blocked then
    raise exception 'This conversation is blocked';
  end if;

  new.sender_id := auth.uid();
  return new;
end; $$;

drop trigger if exists trg_guard_message on public.messages;
create trigger trg_guard_message
  before insert on public.messages
  for each row execute function public.guard_message();

-- After a message: bump last_message_at + notify the other participant.
create or replace function public.after_message_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare c public.conversations%rowtype; recipient uuid;
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id
  returning * into c;

  recipient := case when new.sender_id = c.student_id then c.owner_id else c.student_id end;
  perform public.create_notification(recipient, 'new_message',
    'New message', left(new.body, 120),
    jsonb_build_object('conversation_id', new.conversation_id));
  return new;
end; $$;

drop trigger if exists trg_after_message_insert on public.messages;
create trigger trg_after_message_insert
  after insert on public.messages
  for each row execute function public.after_message_insert();

-- ─────────────────────────────────────────────────────────────────────────────
-- RPCs
-- ─────────────────────────────────────────────────────────────────────────────

-- Find or create the conversation between the caller and the other party (by role).
create or replace function public.get_or_create_conversation(
  p_other_id uuid,
  p_hostel_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare s uuid; o uuid; existing uuid;
begin
  if public.current_role() = 'owner' then
    o := auth.uid(); s := p_other_id;
  else
    s := auth.uid(); o := p_other_id;
  end if;

  select id into existing from public.conversations
   where student_id = s and owner_id = o and hostel_id is not distinct from p_hostel_id;
  if existing is not null then return existing; end if;

  insert into public.conversations (student_id, owner_id, hostel_id)
  values (s, o, p_hostel_id)
  returning id into existing;
  return existing;
end;
$$;

-- The caller's conversations, with the other party's name, hostel, last message + unread count.
create or replace function public.list_conversations()
returns table (
  id               uuid,
  other_id         uuid,
  other_name       text,
  hostel_id        uuid,
  hostel_name      text,
  last_message_at  timestamptz,
  last_message     text,
  unread_count     integer,
  is_blocked       boolean,
  blocked_by       uuid,
  pinned           boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    case when c.student_id = auth.uid() then c.owner_id else c.student_id end as other_id,
    p.full_name as other_name,
    c.hostel_id,
    h.name as hostel_name,
    c.last_message_at,
    (select m.body from public.messages m where m.conversation_id = c.id
      order by m.created_at desc limit 1) as last_message,
    (select count(*)::integer from public.messages m
      where m.conversation_id = c.id and m.sender_id <> auth.uid() and m.read_at is null) as unread_count,
    c.is_blocked,
    c.blocked_by,
    case when c.student_id = auth.uid() then c.student_pinned else c.owner_pinned end as pinned
  from public.conversations c
  left join public.profiles p
    on p.id = (case when c.student_id = auth.uid() then c.owner_id else c.student_id end)
  left join public.hostels h on h.id = c.hostel_id
  where c.student_id = auth.uid() or c.owner_id = auth.uid()
  order by pinned desc, c.last_message_at desc nulls last;
$$;

-- Toggle the caller's pin on a conversation.
create or replace function public.toggle_conversation_pin(p_conversation_id uuid, p_pinned boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
     set student_pinned = case when student_id = auth.uid() then p_pinned else student_pinned end,
         owner_pinned   = case when owner_id   = auth.uid() then p_pinned else owner_pinned end
   where id = p_conversation_id and auth.uid() in (student_id, owner_id);
end; $$;

-- Block / unblock a conversation (records who blocked it).
create or replace function public.set_conversation_block(p_conversation_id uuid, p_blocked boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
     set is_blocked = p_blocked,
         blocked_by = case when p_blocked then auth.uid() else null end
   where id = p_conversation_id and auth.uid() in (student_id, owner_id);
end; $$;

-- Mark the other party's messages as read.
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.messages
     set read_at = now()
   where conversation_id = p_conversation_id and sender_id <> auth.uid() and read_at is null
     and exists (select 1 from public.conversations c
                 where c.id = p_conversation_id and auth.uid() in (c.student_id, c.owner_id));
end; $$;

grant execute on function public.get_or_create_conversation(uuid, uuid) to authenticated;
grant execute on function public.list_conversations() to authenticated;
grant execute on function public.toggle_conversation_pin(uuid, boolean) to authenticated;
grant execute on function public.set_conversation_block(uuid, boolean) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conversations_select" on public.conversations;
create policy "conversations_select" on public.conversations for select
  using (student_id = auth.uid() or owner_id = auth.uid() or public.is_admin());

drop policy if exists "conversations_insert" on public.conversations;
create policy "conversations_insert" on public.conversations for insert
  with check (student_id = auth.uid() or owner_id = auth.uid());

drop policy if exists "conversations_update" on public.conversations;
create policy "conversations_update" on public.conversations for update
  using (student_id = auth.uid() or owner_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or owner_id = auth.uid() or public.is_admin());

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.student_id, c.owner_id)
    )
  );

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.student_id, c.owner_id)
    )
  );

drop policy if exists "messages_update_read" on public.messages;
create policy "messages_update_read" on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.student_id, c.owner_id)
    )
  );

-- Conversation partners may read each other's basic profile (so chat shows names).
drop policy if exists "profiles_select_conversation_partner" on public.profiles;
create policy "profiles_select_conversation_partner" on public.profiles for select
  using (
    exists (
      select 1 from public.conversations c
      where (c.student_id = auth.uid() and c.owner_id = profiles.id)
         or (c.owner_id = auth.uid() and c.student_id = profiles.id)
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime — publish messages so open threads update live.
-- ─────────────────────────────────────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
