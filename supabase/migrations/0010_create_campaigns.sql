-- Kampaniyalar (campaigns)
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value >= 0),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint chk_campaign_date_range check (end_date >= start_date)
);

create index if not exists idx_campaigns_date_range on public.campaigns(start_date, end_date);

comment on table public.campaigns is 'Endirim kampaniyaları';

alter table public.campaigns enable row level security;
