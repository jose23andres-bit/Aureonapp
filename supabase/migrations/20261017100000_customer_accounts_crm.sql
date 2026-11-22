-- AUREON customer accounts, inquiry history and verified purchase ledger.
-- Apply in Supabase SQL Editor after reviewing the current project policies.
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.customer_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  reference text not null default '',
  message text not null,
  phone text not null default '',
  budget text not null default '',
  dates text not null default '',
  consent_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','contacted','in_progress','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending','paid','refunded','cancelled')),
  order_reference text not null unique,
  provider text not null default 'manual-reconciliation',
  provider_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists customer_profiles_email_idx on public.customer_profiles(lower(email));
create index if not exists customer_inquiries_user_created_idx on public.customer_inquiries(user_id,created_at desc);
create index if not exists customer_orders_user_created_idx on public.customer_orders(user_id,created_at desc);
alter table public.customer_profiles enable row level security;
alter table public.customer_inquiries enable row level security;
alter table public.customer_orders enable row level security;
-- Customers can read/update only their own profile; profile identity/email cannot be changed to another user.
drop policy if exists "Customer reads own profile" on public.customer_profiles;
create policy "Customer reads own profile" on public.customer_profiles for select to authenticated using (id=auth.uid());
drop policy if exists "Customer inserts own profile" on public.customer_profiles;
create policy "Customer inserts own profile" on public.customer_profiles for insert to authenticated with check (id=auth.uid() and lower(email)=lower(coalesce(auth.jwt()->>'email','')));
drop policy if exists "Customer updates own profile" on public.customer_profiles;
create policy "Customer updates own profile" on public.customer_profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid() and lower(email)=lower(coalesce(auth.jwt()->>'email','')));
drop policy if exists "Admin reads all customer profiles" on public.customer_profiles;
create policy "Admin reads all customer profiles" on public.customer_profiles for select to authenticated using (exists(select 1 from public.admin_allowlist a where lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))));
drop policy if exists "Customer reads own inquiries" on public.customer_inquiries;
create policy "Customer reads own inquiries" on public.customer_inquiries for select to authenticated using (user_id=auth.uid());
drop policy if exists "Customer creates own inquiries" on public.customer_inquiries;
create policy "Customer creates own inquiries" on public.customer_inquiries for insert to authenticated with check (user_id=auth.uid() and consent_at <= now() and consent_at > now()-interval '10 minutes');
drop policy if exists "Admin reads all inquiries" on public.customer_inquiries;
create policy "Admin reads all inquiries" on public.customer_inquiries for select to authenticated using (exists(select 1 from public.admin_allowlist a where lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))));
drop policy if exists "Admin updates inquiries" on public.customer_inquiries;
create policy "Admin updates inquiries" on public.customer_inquiries for update to authenticated using (exists(select 1 from public.admin_allowlist a where lower(a.email)=lower(coalesce(auth.jwt()->>'email','')))) with check (exists(select 1 from public.admin_allowlist a where lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))));
drop policy if exists "Customer reads own orders" on public.customer_orders;
create policy "Customer reads own orders" on public.customer_orders for select to authenticated using (user_id=auth.uid());
drop policy if exists "Admin reads all orders" on public.customer_orders;
create policy "Admin reads all orders" on public.customer_orders for select to authenticated using (exists(select 1 from public.admin_allowlist a where lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))));
drop policy if exists "Admin manages orders" on public.customer_orders;
create policy "Admin manages orders" on public.customer_orders for all to authenticated using (exists(select 1 from public.admin_allowlist a where lower(a.email)=lower(coalesce(auth.jwt()->>'email','')))) with check (exists(select 1 from public.admin_allowlist a where lower(a.email)=lower(coalesce(auth.jwt()->>'email',''))));
-- No public/anon insert/update policies exist for purchase records. Never mark an order paid from browser input.
-- Automatically register the profile row when Supabase Auth creates an account,
-- including accounts awaiting email confirmation. The auth table remains private.
create or replace function public.handle_aureon_new_customer()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.customer_profiles(id,email,full_name,phone)
  values(new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.raw_user_meta_data->>'phone',''))
  on conflict(id) do update set email=excluded.email, updated_at=now();
  return new;
end;
$$;
drop trigger if exists on_aureon_auth_user_created on auth.users;
create trigger on_aureon_auth_user_created after insert on auth.users
for each row execute function public.handle_aureon_new_customer();
