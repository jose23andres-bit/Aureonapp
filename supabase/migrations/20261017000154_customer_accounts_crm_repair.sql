-- Applied to production Supabase project AUREON AI PROJECT on 2026-10-17.
-- Idempotent repair migration: customer profile, inquiry and order tables + RLS.
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '', full_name text not null default '', phone text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customer_inquiries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'consulta-general', reference text not null default '', message text not null default '',
  phone text not null default '', budget text not null default '', dates text not null default '', consent_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','in_progress','answered','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null, amount numeric(12,2) not null default 0 check (amount >= 0), currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending','paid','cancelled','refunded')),
  order_reference text not null unique, provider text not null default 'manual-reconciliation', provider_payment_id text,
  paid_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.customer_profiles enable row level security;
alter table public.customer_inquiries enable row level security;
alter table public.customer_orders enable row level security;
drop policy if exists "Customers read own profile" on public.customer_profiles;
create policy "Customers read own profile" on public.customer_profiles for select to authenticated using (id = auth.uid() or private.is_aureon_admin());
drop policy if exists "Customers insert own profile" on public.customer_profiles;
create policy "Customers insert own profile" on public.customer_profiles for insert to authenticated with check (id = auth.uid() or private.is_aureon_admin());
drop policy if exists "Customers update own profile" on public.customer_profiles;
create policy "Customers update own profile" on public.customer_profiles for update to authenticated using (id = auth.uid() or private.is_aureon_admin()) with check (id = auth.uid() or private.is_aureon_admin());
drop policy if exists "Customers read own inquiries" on public.customer_inquiries;
create policy "Customers read own inquiries" on public.customer_inquiries for select to authenticated using (user_id = auth.uid() or private.is_aureon_admin());
drop policy if exists "Customers insert own inquiries" on public.customer_inquiries;
create policy "Customers insert own inquiries" on public.customer_inquiries for insert to authenticated with check (user_id = auth.uid() and consent_at is not null);
drop policy if exists "Admins update inquiries" on public.customer_inquiries;
create policy "Admins update inquiries" on public.customer_inquiries for update to authenticated using (private.is_aureon_admin()) with check (private.is_aureon_admin());
drop policy if exists "Customers read own orders" on public.customer_orders;
create policy "Customers read own orders" on public.customer_orders for select to authenticated using (user_id = auth.uid() or private.is_aureon_admin());
drop policy if exists "Admins insert orders" on public.customer_orders;
create policy "Admins insert orders" on public.customer_orders for insert to authenticated with check (private.is_aureon_admin());
drop policy if exists "Admins update orders" on public.customer_orders;
create policy "Admins update orders" on public.customer_orders for update to authenticated using (private.is_aureon_admin()) with check (private.is_aureon_admin());
grant select, insert, update on public.customer_profiles to authenticated;
grant select, insert, update on public.customer_inquiries to authenticated;
grant select, insert, update on public.customer_orders to authenticated;
