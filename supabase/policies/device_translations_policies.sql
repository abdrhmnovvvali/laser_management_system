-- device_translations: devices ilə eyni filial sərhədi
create policy "device_translations_select"
on public.device_translations
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.devices d
    where d.id = device_translations.device_id
      and d.branch_id = public.current_user_branch_id()
  )
);

create policy "device_translations_admin_write"
on public.device_translations
for all
using (public.is_admin())
with check (public.is_admin());
