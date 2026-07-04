-- Prosedurlar (procedures) — vizit qeydi
create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete restrict,
  package_id uuid references public.packages(id) on delete set null,
  date timestamptz not null default now(),
  declared_shot_count integer not null check (declared_shot_count >= 0),
  actual_shot_count integer not null check (actual_shot_count >= 0),
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_procedures_customer_id on public.procedures(customer_id);
create index if not exists idx_procedures_device_id on public.procedures(device_id);
create index if not exists idx_procedures_date on public.procedures(date);

comment on table public.procedures is 'Müştəri vizitləri: zona/paket seçimi, bəyan edilən vs faktiki atış sayı';

alter table public.procedures enable row level security;
