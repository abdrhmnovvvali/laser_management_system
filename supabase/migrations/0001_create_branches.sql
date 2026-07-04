-- Filiallar (branches)
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

comment on table public.branches is 'Klinikanın filialları';

alter table public.branches enable row level security;
