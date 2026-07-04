-- Növbəti vizit planlaması (follow_ups)
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  planned_date date not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'missed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_follow_ups_customer_id on public.follow_ups(customer_id);
create index if not exists idx_follow_ups_planned_date on public.follow_ups(planned_date);
create index if not exists idx_follow_ups_status on public.follow_ups(status);

comment on table public.follow_ups is 'Müştərilər üçün planlaşdırılan növbəti vizitlər';

alter table public.follow_ups enable row level security;
