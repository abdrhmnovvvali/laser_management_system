-- package_translations: packages ilə eyni məntiq
create policy "package_translations_select"
on public.package_translations
for select
using (auth.role() = 'authenticated');

create policy "package_translations_admin_write"
on public.package_translations
for all
using (public.is_admin())
with check (public.is_admin());
