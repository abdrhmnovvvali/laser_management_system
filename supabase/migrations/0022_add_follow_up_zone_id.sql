-- follow_ups cədvəlinə nahiyə əlavə et
alter table public.follow_ups
  add column if not exists zone_id uuid references public.zones(id) on delete set null;

create index if not exists idx_follow_ups_zone_id on public.follow_ups(zone_id);

comment on column public.follow_ups.zone_id is 'Planlaşdırılan nahiyə';
