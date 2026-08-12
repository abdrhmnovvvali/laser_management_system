-- follow_up_zones: follow_ups ilə eyni filial-sərhədi (follow_up -> customer -> branch).

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
