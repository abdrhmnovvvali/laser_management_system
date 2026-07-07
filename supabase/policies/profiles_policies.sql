-- profiles: hər kəs öz profilini oxuya bilər, admin hamısını görür.
-- Yazma əməliyyatları `upsert_profile` RPC funksiyası ilə edilir
-- (security definer — bax 0021_create_profile_function.sql).

create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (
  id = auth.uid()
  or public.is_admin()
);
