-- campaign_zones: kampaniya-nahiyə əlaqəsi, campaigns ilə eyni məntiq.

create policy "campaign_zones_select_authenticated"
on public.campaign_zones
for select
using (auth.role() = 'authenticated');

create policy "campaign_zones_admin_write"
on public.campaign_zones
for all
using (public.is_admin())
with check (public.is_admin());
