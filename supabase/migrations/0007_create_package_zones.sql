-- package_zones: paket <-> zona many-to-many əlaqəsi
create table if not exists public.package_zones (
  package_id uuid not null references public.packages(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete cascade,
  primary key (package_id, zone_id)
);

create index if not exists idx_package_zones_zone_id on public.package_zones(zone_id);

comment on table public.package_zones is 'Paketə daxil olan nahiyələr';

alter table public.package_zones enable row level security;
