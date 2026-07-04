-- follow_ups: müştərinin filialına görə sərhədlənir.

create policy "follow_ups_select"
on public.follow_ups
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_ups_staff_insert"
on public.follow_ups
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_ups_staff_update"
on public.follow_ups
for update
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_ups_admin_delete"
on public.follow_ups
for delete
using (public.is_admin());
