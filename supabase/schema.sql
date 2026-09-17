-- ==========================================================
-- TYPEFLOW DATABASE SCHEMA & SECURITY POLICIES (SUPABASE)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  display_name text,
  avatar_url text,
  theme_id text default 'cyber-emerald',
  sound_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Test Results Table
create table if not exists public.test_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mode text not null,               -- 'time' | 'words' | 'code' | 'quotes'
  mode_config text not null,        -- '15s', '30s', '25 words', 'javascript', etc.
  wpm integer not null,
  net_wpm integer not null,
  raw_wpm integer not null,
  burst_wpm integer default 0,
  speed_loss_wpm integer default 0,
  accuracy numeric(5,2) not null,
  consistency numeric(5,2) default 100,
  stamina_ratio numeric(5,2) default 100,
  total_chars integer not null,
  correct_chars integer not null,
  incorrect_chars integer not null,
  extra_chars integer default 0,
  missed_chars integer default 0,
  elapsed_seconds numeric(6,2) not null,
  is_personal_best boolean default false,
  timeline jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Fast Query Indices
create index if not exists idx_test_results_user_date on public.test_results (user_id, created_at desc);
create index if not exists idx_test_results_leaderboard on public.test_results (mode, mode_config, wpm desc, accuracy desc);
create index if not exists idx_profiles_username on public.profiles (username);

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.test_results enable row level security;

-- 6. RLS Policies for Profiles
-- Anyone can view profiles (needed for leaderboards and public profiles)
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 7. RLS Policies for Test Results
-- Users can view their own test history
create policy "Users can view own test results" 
  on public.test_results for select 
  using (auth.uid() = user_id);

-- Everyone can view test results for leaderboard ranking
create policy "Leaderboard test results are viewable by everyone" 
  on public.test_results for select 
  using (true);

-- Authenticated users can insert their own test results
create policy "Users can insert own test results" 
  on public.test_results for insert 
  with check (auth.uid() = user_id);

-- Users can delete their own test results
create policy "Users can delete own test results" 
  on public.test_results for delete 
  using (auth.uid() = user_id);

-- 8. Automated Trigger: Create Profile on User Sign Up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
begin
  -- Use username from user metadata or generate from email
  raw_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, username, display_name, avatar_url)
  values (
    new.id,
    new.email,
    raw_username,
    coalesce(new.raw_user_meta_data->>'display_name', raw_username),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to invoke on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 9. Community Leaderboard View
create or replace view public.leaderboards as
select
  r.id as test_id,
  r.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  r.mode,
  r.mode_config,
  r.wpm,
  r.raw_wpm,
  r.accuracy,
  r.consistency,
  r.elapsed_seconds,
  r.created_at
from public.test_results r
join public.profiles p on r.user_id = p.id
order by r.wpm desc, r.accuracy desc;
