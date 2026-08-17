-- Waitlist schema.
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text        not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness: Alex@x.com and alex@x.com are the same person.
-- A plain `unique` on the column would let both through.
create unique index if not exists waitlist_email_lower_key
  on public.waitlist ((lower(email)));

-- Newest-first admin reads.
create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- RLS is enabled with ZERO policies. That is deliberate, not unfinished:
-- with RLS on and no policy, the `anon` and `authenticated` roles can do
-- nothing at all — no select, no insert. Nobody can read or enumerate the
-- list from a browser, even with the publishable key in hand.
--
-- The `service_role` key bypasses RLS entirely, and that is the only key the
-- waitlist Server Action uses. It never leaves the server.
--
-- If you ever want to insert straight from the browser instead (dropping the
-- Server Action), you would add an insert-only policy — note it grants no
-- read access, so the list still can't be enumerated:
--
--   create policy "anon can join" on public.waitlist
--     for insert to anon with check (true);

alter table public.waitlist enable row level security;
