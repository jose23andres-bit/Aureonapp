-- BROLY assistant (phases 2-6): conversations, proposed/approved actions, controllable memory, plans.
-- Requires 20261018090000_broly_phase1.sql to be applied first. Additive only: no existing table or row is dropped.
-- All tables are private: RLS enabled and no grants to anon/authenticated. Access only via the Netlify
-- function with the service role, always filtered by the authenticated admin's user_id.

-- Allow plans and their states in the existing task table.
alter table public.broly_tasks drop constraint if exists broly_tasks_task_type_check;
alter table public.broly_tasks add constraint broly_tasks_task_type_check check (task_type in ('general','agenda-summary','plan'));
alter table public.broly_tasks drop constraint if exists broly_tasks_status_check;
alter table public.broly_tasks add constraint broly_tasks_status_check check (status in ('queued','running','completed','failed','needs_connection','planned','cancelled'));

create table if not exists public.broly_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Conversación' check (char_length(title) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists broly_conversations_user_updated_idx on public.broly_conversations(user_id, updated_at desc);

create table if not exists public.broly_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.broly_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) <= 8000),
  metadata jsonb not null default '{}'::jsonb,
  feedback smallint check (feedback in (-1, 1)),
  created_at timestamptz not null default now()
);
create index if not exists broly_messages_conversation_idx on public.broly_messages(conversation_id, created_at desc);
create index if not exists broly_messages_user_created_idx on public.broly_messages(user_id, role, created_at desc);

create table if not exists public.broly_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid references public.broly_conversations(id) on delete set null,
  tool text not null check (tool in ('list_tasks','create_plan','save_memory','agenda_summary')),
  label text not null,
  summary text not null check (char_length(summary) <= 500),
  risk text not null check (risk in ('lectura-interna','escritura-interna','lectura-externa')),
  arguments jsonb not null default '{}'::jsonb,
  status text not null default 'proposed' check (status in ('proposed','running','completed','verified','failed','rejected','expired','needs_connection')),
  result jsonb,
  verification jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  decided_at timestamptz,
  completed_at timestamptz
);
create index if not exists broly_actions_user_created_idx on public.broly_actions(user_id, created_at desc);
create index if not exists broly_actions_conversation_idx on public.broly_actions(conversation_id, created_at);

create table if not exists public.broly_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 3 and 500),
  category text not null default 'otro' check (category in ('preferencia','proyecto','dato','otro')),
  source text not null default 'user' check (source in ('user','assistant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists broly_memories_user_updated_idx on public.broly_memories(user_id, updated_at desc);

alter table public.broly_conversations enable row level security;
alter table public.broly_messages enable row level security;
alter table public.broly_actions enable row level security;
alter table public.broly_memories enable row level security;
revoke all on public.broly_conversations from anon, authenticated;
revoke all on public.broly_messages from anon, authenticated;
revoke all on public.broly_actions from anon, authenticated;
revoke all on public.broly_memories from anon, authenticated;
