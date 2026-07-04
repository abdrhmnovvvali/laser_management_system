-- devices: admin bütün cihazları idarə edir, filial işçisi yalnız öz filialının cihazlarını görür.

create policy "devices_select"
on public.devices
for select
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "devices_admin_write"
on public.devices
for all
using (public.is_admin())
with check (public.is_admin());
