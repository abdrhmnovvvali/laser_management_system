-- customers: admin bütün müştəriləri görür/idarə edir, filial işçisi yalnız öz
-- filialının müştəriləri üzərində tam CRUD edə bilər.

create policy "customers_select"
on public.customers
for select
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "customers_staff_write"
on public.customers
for insert
with check (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "customers_staff_update"
on public.customers
for update
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
)
with check (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "customers_admin_delete"
on public.customers
for delete
using (public.is_admin());
