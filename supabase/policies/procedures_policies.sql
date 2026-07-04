-- procedures: filial işçisi yalnız öz filialının müştərilərinə aid prosedurları
-- görə/yarada bilər (müştərinin branch_id-si vasitəsilə).

create policy "procedures_select"
on public.procedures
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedures_staff_insert"
on public.procedures
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedures_staff_update"
on public.procedures
for update
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedures_admin_delete"
on public.procedures
for delete
using (public.is_admin());
