-- Müştərilər (customers)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  birth_date date,
  gender text check (gender in ('female', 'male', 'other')),
  branch_id uuid not null references public.branches(id) on delete restrict,
  registered_at timestamptz not null default now()
);

create index if not exists idx_customers_branch_id on public.customers(branch_id);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_customers_birth_date on public.customers(birth_date);

comment on table public.customers is 'Müştəri qeydiyyat məlumatları';

alter table public.customers enable row level security;
