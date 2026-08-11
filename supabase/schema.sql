-- Idiomify Supabase schema
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- File path: supabase/schema.sql
--
-- NOTE: Auth accounts live in auth.users (Dashboard → Authentication → Users).
-- That schema is managed by Supabase and does not appear under Table Editor by
-- default. The public.profiles table below mirrors users so you can browse them
-- in Table Editor.

-- ---------------------------------------------------------------------------
-- 0) Profiles (visible user table in public schema)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill existing auth users into profiles (safe to re-run)
insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 1) Learner progress (points, stats, badges)
-- ---------------------------------------------------------------------------

create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  stats jsonb not null default '{}'::jsonb,
  unlocked_badge_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.learner_progress enable row level security;

drop policy if exists "learner_progress_select_own" on public.learner_progress;
create policy "learner_progress_select_own"
  on public.learner_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "learner_progress_insert_own" on public.learner_progress;
create policy "learner_progress_insert_own"
  on public.learner_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "learner_progress_update_own" on public.learner_progress;
create policy "learner_progress_update_own"
  on public.learner_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learner_progress_updated_at on public.learner_progress;
create trigger learner_progress_updated_at
  before update on public.learner_progress
  for each row
  execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2) Daily Challenge leaderboard
-- ---------------------------------------------------------------------------

create table if not exists public.daily_scores (
  user_id uuid not null references auth.users (id) on delete cascade,
  date_key text not null,
  score integer not null default 0 check (score >= 0),
  display_name text not null default 'Player',
  updated_at timestamptz not null default now(),
  primary key (user_id, date_key)
);

create index if not exists daily_scores_date_score_idx
  on public.daily_scores (date_key, score desc);

alter table public.daily_scores enable row level security;

drop policy if exists "daily_scores_select_authenticated" on public.daily_scores;
create policy "daily_scores_select_authenticated"
  on public.daily_scores
  for select
  to authenticated
  using (true);

drop policy if exists "daily_scores_insert_own" on public.daily_scores;
create policy "daily_scores_insert_own"
  on public.daily_scores
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "daily_scores_update_own" on public.daily_scores;
create policy "daily_scores_update_own"
  on public.daily_scores
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists daily_scores_updated_at on public.daily_scores;
create trigger daily_scores_updated_at
  before update on public.daily_scores
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3) Dynamic vocabulary (optional) — JSON files remain the app fallback
--    Seed rows in Table Editor or SQL; empty tables → app uses data/*.json
-- ---------------------------------------------------------------------------

create table if not exists public.words (
  id text primary key,
  term text not null,
  phonetic text,
  definition text not null,
  example text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists words_term_idx on public.words (term);

alter table public.words enable row level security;

drop policy if exists "words_select_public" on public.words;
create policy "words_select_public"
  on public.words
  for select
  to anon, authenticated
  using (true);

drop trigger if exists words_updated_at on public.words;
create trigger words_updated_at
  before update on public.words
  for each row
  execute function public.set_updated_at();

create table if not exists public.idioms (
  id text primary key,
  term text not null,
  category text not null,
  definition text not null,
  example text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idioms_category_idx on public.idioms (category);
create index if not exists idioms_term_idx on public.idioms (term);

alter table public.idioms enable row level security;

drop policy if exists "idioms_select_public" on public.idioms;
create policy "idioms_select_public"
  on public.idioms
  for select
  to anon, authenticated
  using (true);

drop trigger if exists idioms_updated_at on public.idioms;
create trigger idioms_updated_at
  before update on public.idioms
  for each row
  execute function public.set_updated_at();
