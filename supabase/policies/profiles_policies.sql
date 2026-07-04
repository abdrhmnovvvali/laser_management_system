-- profiles: hər kəs öz profilini oxuya bilər, admin hamısını görür.
-- Yazma əməliyyatları normalda backend-in SUPABASE_ADMIN_CLIENT-i (service role) ilə
-- edilir və RLS-i bypass edir, ona görə burada yalnız SELECT policy-ləri kifayətdir.

create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (
  id = auth.uid()
  or public.is_admin()
);
