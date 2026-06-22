create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  last_active timestamptz default now(),
  preferences jsonb default '{}'
);

create table roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  job_title text not null,
  job_data jsonb,
  user_profile jsonb,
  skill_tree jsonb,
  gap_map jsonb,
  resources jsonb,
  roadmap_plan jsonb,
  match_score integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text default 'active'
);

create table progress_logs (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid references roadmaps(id),
  user_id uuid references users(id),
  task_id text not null,
  skill_id text not null,
  completed_at timestamptz default now(),
  task_type text,
  notes text
);

create table streaks (
  user_id uuid primary key references users(id),
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date default current_date,
  total_tasks_done integer default 0
);

create table resource_cache (
  skill_id text primary key,
  resources jsonb not null,
  fetched_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);
