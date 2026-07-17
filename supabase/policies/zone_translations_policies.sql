-- zone_translations: zones ilə eyni filial sərhədi
create policy "zone_translations_select"
on public.zone_translations
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.zones z
    join public.devices d on d.id = z.device_id
    where z.id = zone_translations.zone_id
      and d.branch_id = public.current_user_branch_id()
  )
);

create policy "zone_translations_admin_write"
on public.zone_translations
for all
using (public.is_admin())
with check (public.is_admin());
