-- campaigns: filial-spesifik deyil, bütün autentifikasiya olunmuş istifadəçilər
-- oxuya bilər, yalnız admin dəyişiklik edə bilər.

create policy "campaigns_select_authenticated"
on public.campaigns
for select
using (auth.role() = 'authenticated');

create policy "campaigns_admin_write"
on public.campaigns
for all
using (public.is_admin())
with check (public.is_admin());
