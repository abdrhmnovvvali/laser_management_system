-- procedure_zones: procedures ilə eyni filial-sərhədi (procedure -> customer -> branch).

create policy "procedure_zones_select"
on public.procedure_zones
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.procedures p
    join public.customers c on c.id = p.customer_id
    where p.id = procedure_zones.procedure_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedure_zones_staff_write"
on public.procedure_zones
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.procedures p
    join public.customers c on c.id = p.customer_id
    where p.id = procedure_zones.procedure_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedure_zones_admin_delete"
on public.procedure_zones
for delete
using (public.is_admin());
