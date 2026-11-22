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
