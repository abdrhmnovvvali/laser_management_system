-- package_zones: paket-nahiyə əlaqəsi, packages ilə eyni məntiq.

create policy "package_zones_select_authenticated"
on public.package_zones
for select
using (auth.role() = 'authenticated');

create policy "package_zones_admin_write"
on public.package_zones
for all
using (public.is_admin())
with check (public.is_admin());
