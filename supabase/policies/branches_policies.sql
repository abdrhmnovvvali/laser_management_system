-- branches: admin bütün filialları idarə edir, filial işçisi yalnız öz filialını görür.

create policy "branches_select"
on public.branches
for select
using (
  public.is_admin()
  or id = public.current_user_branch_id()
);

create policy "branches_admin_write"
on public.branches
for all
using (public.is_admin())
with check (public.is_admin());
