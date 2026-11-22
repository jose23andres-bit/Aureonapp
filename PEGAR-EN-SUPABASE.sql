-- AUREON · BROLY memoria v2 — pegar en Supabase → SQL Editor → Run. Incremental: solo añade columnas, se puede repetir.
-- BROLY memory v2: conversation summaries + private/global memories. Incremental and idempotent.
-- Requires 20261018090000_broly_phase1.sql and 20261018120000_broly_assistant.sql (already applied in production).
-- Adds columns only; no data is deleted and RLS/grants stay as they are (server-only access).

alter table public.broly_conversations add column if not exists summary text;
alter table public.broly_conversations add column if not exists summary_message_count integer not null default 0;

alter table public.broly_memories add column if not exists scope text not null default 'private';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'broly_memories_scope_check') then
    alter table public.broly_memories add constraint broly_memories_scope_check check (scope in ('private','global'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'broly_conversations_summary_len') then
    alter table public.broly_conversations add constraint broly_conversations_summary_len check (summary is null or char_length(summary) <= 2000);
  end if;
end $$;

create index if not exists broly_memories_scope_idx on public.broly_memories(scope, updated_at desc) where scope = 'global';
create index if not exists broly_messages_created_idx on public.broly_messages(created_at);

-- Keep the tables private (re-asserted; harmless if already set).
alter table public.broly_conversations enable row level security;
alter table public.broly_memories enable row level security;
revoke all on public.broly_conversations from anon, authenticated;
revoke all on public.broly_memories from anon, authenticated;

-- ===================================================================
-- AUREON · BROLY contratos + WhatsApp (19-10-2026). Se puede repetir sin riesgo.
-- ===================================================================
-- BROLY: contracts (PDF + secure fill/sign link) and WhatsApp inbox. Incremental and idempotent.
-- Server-only tables: RLS on, no grants to anon/authenticated.

create table if not exists public.broly_contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ref text not null,
  template_id text not null,
  title text not null,
  data jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','sent','completed','cancelled')),
  token_hash text not null unique,
  client_name text,
  client_phone text,
  client_email text,
  owner_role text,
  sent_via text,
  acceptance jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null
);
create index if not exists broly_contracts_user_idx on public.broly_contracts(user_id, created_at desc);

create table if not exists public.broly_wa_inbox (
  id bigint generated always as identity primary key,
  wa_message_id text not null unique,
  from_phone text not null,
  from_name text,
  body text not null,
  direction text not null default 'in' check (direction in ('in','out')),
  created_at timestamptz not null default now()
);
create index if not exists broly_wa_inbox_phone_idx on public.broly_wa_inbox(from_phone, created_at desc);

-- New tools and risk level for proposed actions.
alter table public.broly_actions drop constraint if exists broly_actions_tool_check;
alter table public.broly_actions add constraint broly_actions_tool_check check (tool in ('list_tasks','create_plan','save_memory','agenda_summary','list_contract_templates','prepare_contract'));
alter table public.broly_actions drop constraint if exists broly_actions_risk_check;
alter table public.broly_actions add constraint broly_actions_risk_check check (risk in ('lectura-interna','escritura-interna','lectura-externa','envio-externo'));

alter table public.broly_contracts enable row level security;
alter table public.broly_wa_inbox enable row level security;
revoke all on public.broly_contracts from anon, authenticated;
revoke all on public.broly_wa_inbox from anon, authenticated;

-- ===================================================================
-- AUREON · Radar BROLY (19-10-2026). Se puede repetir sin riesgo.
-- ===================================================================
-- BROLY Radar: public posts of people asking for services AUREON offers (from search-engine results).
-- Only what the report needs is kept (no phones/emails: they are removed before saving) and it is deleted
-- after LEADS_RETENTION_DAYS (30 by default). Server-only tables: RLS on, no grants to anon/authenticated.
-- Incremental and idempotent.

create table if not exists public.broly_lead_runs (
  id uuid primary key default gen_random_uuid(),
  ref text not null,
  status text not null default 'running' check (status in ('running','ok','error')),
  trigger text not null default 'schedule' check (trigger in ('schedule','manual','whatsapp')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  requests integer not null default 0,
  hits integer not null default 0,
  new_leads integer not null default 0,
  ai_used boolean not null default false,
  sent_via text,
  error text check (error is null or char_length(error) <= 1000)
);
create index if not exists broly_lead_runs_started_idx on public.broly_lead_runs(started_at desc);

create table if not exists public.broly_leads (
  id uuid primary key default gen_random_uuid(),
  url_hash text not null unique,
  url text not null check (url ~ '^https://'),
  source text not null,
  category text not null,
  title text not null,
  snippet text not null default '',
  request text not null,
  zone text,
  urgency text not null default 'baja' check (urgency in ('alta','media','baja')),
  score integer not null default 50 check (score between 0 and 100),
  age text,
  next_step text not null default '',
  sensitive boolean not null default false,
  ai boolean not null default false,
  run_id uuid references public.broly_lead_runs(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists broly_leads_created_idx on public.broly_leads(created_at desc);
create index if not exists broly_leads_run_idx on public.broly_leads(run_id);

alter table public.broly_lead_runs enable row level security;
alter table public.broly_leads enable row level security;
revoke all on public.broly_lead_runs from anon, authenticated;
revoke all on public.broly_leads from anon, authenticated;
