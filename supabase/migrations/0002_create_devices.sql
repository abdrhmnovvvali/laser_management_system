-- Cihazlar (devices)
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  type text not null,
  shot_counter bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_devices_branch_id on public.devices(branch_id);

comment on table public.devices is 'Filiallara bağlı lazer cihazları və atış sayğacı';

alter table public.devices enable row level security;
