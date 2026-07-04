-- Nahiyələr (zones) — cihaz üzrə qiymət matrisası
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  device_id uuid not null references public.devices(id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_zones_device_id on public.zones(device_id);

comment on table public.zones is 'Bədən nahiyələri və cihaz üzrə qiymətləri';

alter table public.zones enable row level security;
