-- Intelligence guild · interest signups
-- Run in Supabase SQL editor. Enable Realtime after table exists.

create table if not exists public.interest_signups (
  id uuid primary key default gen_random_uuid(),
  character_name text not null,
  class text not null,
  created_at timestamptz not null default now(),
  is_hidden boolean not null default false
);

create index if not exists interest_signups_created_at_desc
  on public.interest_signups (created_at desc);

alter table public.interest_signups enable row level security;

-- Public read of visible rows only
drop policy if exists "interest_signups_public_select" on public.interest_signups;
create policy "interest_signups_public_select"
  on public.interest_signups
  for select
  to anon, authenticated
  using (is_hidden = false);

-- Public insert with basic validation (no update/delete for public)
drop policy if exists "interest_signups_public_insert" on public.interest_signups;
create policy "interest_signups_public_insert"
  on public.interest_signups
  for insert
  to anon, authenticated
  with check (
    char_length(trim(character_name)) between 1 and 24
    and class in (
      'Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest',
      'Shaman', 'Mage', 'Warlock', 'Druid'
    )
    and is_hidden = false
  );

-- Realtime: add table to supabase_realtime publication
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'interest_signups'
  ) then
    alter publication supabase_realtime add table public.interest_signups;
  end if;
end $$;
