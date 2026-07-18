-- campaign_translations: campaigns ilə eyni məntiq
create policy "campaign_translations_select"
on public.campaign_translations
for select
using (auth.role() = 'authenticated');

create policy "campaign_translations_admin_write"
on public.campaign_translations
for all
using (public.is_admin())
with check (public.is_admin());
