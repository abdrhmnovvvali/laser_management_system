-- notes: müştərinin filialına görə sərhədlənir.

create policy "notes_select"
on public.notes
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "notes_staff_insert"
on public.notes
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "notes_staff_update"
on public.notes
for update
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "notes_admin_delete"
on public.notes
for delete
using (public.is_admin());
