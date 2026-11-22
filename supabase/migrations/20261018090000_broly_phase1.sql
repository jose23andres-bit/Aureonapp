-- BROLY Phase 1: private task queue, audit trail and encrypted Google connection metadata.
create table if not exists public.broly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  task_type text not null default 'general' check (task_type in ('general','agenda-summary')),
  status text not null default 'queued' check (status in ('queued','running','completed','failed','needs_connection')),
  input jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
create index if not exists broly_tasks_user_created_idx on public.broly_tasks(user_id, created_at desc);

create table if not exists public.broly_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.broly_tasks(id) on delete set null,
  event_type text not null,
  message text not null check (char_length(message) <= 500),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists broly_activity_user_created_idx on public.broly_activity(user_id, created_at desc);

-- Tokens are encrypted in Netlify before storage. Do not expose this table through client APIs.
create table if not exists public.broly_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google')),
  encrypted_tokens text not null,
  scopes text[] not null default '{}',
  connected_email text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id, provider)
);

alter table public.broly_tasks enable row level security;
alter table public.broly_activity enable row level security;
alter table public.broly_connections enable row level security;
-- All mutations and token access go through the authenticated Netlify function using server secrets.
revoke all on public.broly_connections from anon, authenticated;
revoke all on public.broly_tasks from anon, authenticated;
revoke all on public.broly_activity from anon, authenticated;
