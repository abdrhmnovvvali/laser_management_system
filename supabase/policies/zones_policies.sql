-- zones: admin bütün nahiyələri idarə edir, filial işçisi yalnız öz filialının
-- cihazlarına bağlı nahiyələri görür.

create policy "zones_select"
on public.zones
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.devices d
    where d.id = zones.device_id
      and d.branch_id = public.current_user_branch_id()
  )
);

create policy "zones_admin_write"
on public.zones
for all
using (public.is_admin())
with check (public.is_admin());
