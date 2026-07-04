-- Bildirişlər (notifications) — ad günü, fraud, follow-up mərkəzi anbarı
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('birthday', 'fraud', 'follow_up')),
  customer_id uuid references public.customers(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_customer_id on public.notifications(customer_id);
create index if not exists idx_notifications_type on public.notifications(type);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

comment on table public.notifications is 'Bütün modullardan gələn bildirişlərin mərkəzi anbarı';

alter table public.notifications enable row level security;
