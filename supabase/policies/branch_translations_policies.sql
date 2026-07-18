-- branch_translations: branches ilə eyni filial sərhədi
create policy "branch_translations_select"
on public.branch_translations
for select
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "branch_translations_admin_write"
on public.branch_translations
for all
using (public.is_admin())
with check (public.is_admin());
