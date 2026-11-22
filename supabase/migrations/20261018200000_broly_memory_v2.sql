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
