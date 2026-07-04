-- procedure_zones: bir prosedurda bir neçə zona ola bilər
create table if not exists public.procedure_zones (
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete restrict,
  primary key (procedure_id, zone_id)
);

create index if not exists idx_procedure_zones_zone_id on public.procedure_zones(zone_id);

comment on table public.procedure_zones is 'Prosedurda seçilən nahiyələr';

alter table public.procedure_zones enable row level security;
