-- Prosedurlara kampaniya əlaqəsi
alter table public.procedures
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

create index if not exists idx_procedures_campaign_id
  on public.procedures (campaign_id);

comment on column public.procedures.campaign_id is
  'Vizitə tətbiq olunan kampaniya (istəyə bağlı)';
