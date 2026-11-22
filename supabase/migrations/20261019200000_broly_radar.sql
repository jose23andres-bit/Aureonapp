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
