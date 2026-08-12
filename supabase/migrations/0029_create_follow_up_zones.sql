-- Follow-up üçün çoxlu nahiyə (M2M)
create table if not exists public.follow_up_zones (
  follow_up_id uuid not null references public.follow_ups(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete restrict,
  primary key (follow_up_id, zone_id)
);

create index if not exists idx_follow_up_zones_zone_id
  on public.follow_up_zones(zone_id);

comment on table public.follow_up_zones is 'Follow-up-da planlaşdırılan nahiyələr';

alter table public.follow_up_zones enable row level security;

-- Köhnə zone_id dəyərlərini junction-a köçür
insert into public.follow_up_zones (follow_up_id, zone_id)
select id, zone_id
from public.follow_ups
where zone_id is not null
on conflict do nothing;

alter table public.follow_ups
  drop column if exists zone_id;

-- RLS policies (cədvəl yaradılandan sonra mütləq lazımdır)
drop policy if exists "follow_up_zones_select" on public.follow_up_zones;
drop policy if exists "follow_up_zones_staff_write" on public.follow_up_zones;
drop policy if exists "follow_up_zones_staff_delete" on public.follow_up_zones;

create policy "follow_up_zones_select"
on public.follow_up_zones
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.follow_ups f
    join public.customers c on c.id = f.customer_id
    where f.id = follow_up_zones.follow_up_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_up_zones_staff_write"
on public.follow_up_zones
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.follow_ups f
    join public.customers c on c.id = f.customer_id
    where f.id = follow_up_zones.follow_up_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_up_zones_staff_delete"
on public.follow_up_zones
for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.follow_ups f
    join public.customers c on c.id = f.customer_id
    where f.id = follow_up_zones.follow_up_id
      and c.branch_id = public.current_user_branch_id()
  )
);
