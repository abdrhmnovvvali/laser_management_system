-- packages: filial-spesifik deyil — bütün autentifikasiya olunmuş istifadəçilər
-- oxuya bilər, yalnız admin dəyişiklik edə bilər.

create policy "packages_select_authenticated"
on public.packages
for select
using (auth.role() = 'authenticated');

create policy "packages_admin_write"
on public.packages
for all
using (public.is_admin())
with check (public.is_admin());
