create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  phone text,
  region text,
  farm_name text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists diseases (
  id uuid primary key default gen_random_uuid(),
  disease_key text unique not null,
  name text unique not null,
  description text not null,
  causes text,
  treatment text not null,
  prevention text not null,
  fertilizer text,
  pesticide text,
  irrigation text,
  severity text,
  palette jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  image_src text not null,
  disease_key text not null,
  disease_name text not null,
  confidence integer not null check (confidence >= 1 and confidence <= 99),
  analysis_source text not null default 'local',
  model_used text,
  summary text,
  indicators jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_scans_user_created_at on scans(user_id, created_at desc);
create index if not exists idx_scans_disease_name on scans(disease_name);
create index if not exists idx_users_email on app_users(email);
