-- campaign_zones: kampaniya <-> zona many-to-many əlaqəsi
create table if not exists public.campaign_zones (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete cascade,
  primary key (campaign_id, zone_id)
);

create index if not exists idx_campaign_zones_zone_id on public.campaign_zones(zone_id);

comment on table public.campaign_zones is 'Kampaniyanın tətbiq olunduğu nahiyələr';

alter table public.campaign_zones enable row level security;
