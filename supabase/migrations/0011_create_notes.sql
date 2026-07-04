-- Qeydlər (notes) — zəng/sosial media/üz-üzə kommunikasiya
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null check (type in ('call', 'social', 'in_person')),
  content text not null,
  outcome text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notes_customer_id on public.notes(customer_id);

comment on table public.notes is 'Müştəri ilə kommunikasiya qeydləri';

alter table public.notes enable row level security;
