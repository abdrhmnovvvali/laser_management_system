-- notifications: müştəriyə bağlı olanlar filial üzrə sərhədlənir; müştərisiz
-- (sistem səviyyəli) bildirişləri yalnız admin görür. Yazma əməliyyatları
-- NotificationModule tərəfindən `create_notification` RPC funksiyası ilə edilir
-- (event-driven, security definer — bax 0018_create_notification_function.sql).

create policy "notifications_select"
on public.notifications
for select
using (
  public.is_admin()
  or (
    customer_id is not null
    and exists (
      select 1 from public.customers c
      where c.id = notifications.customer_id
        and c.branch_id = public.current_user_branch_id()
    )
  )
);

create policy "notifications_staff_mark_read"
on public.notifications
for update
using (
  public.is_admin()
  or (
    customer_id is not null
    and exists (
      select 1 from public.customers c
      where c.id = notifications.customer_id
        and c.branch_id = public.current_user_branch_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    customer_id is not null
    and exists (
      select 1 from public.customers c
      where c.id = notifications.customer_id
        and c.branch_id = public.current_user_branch_id()
    )
  )
);

create policy "notifications_admin_delete"
on public.notifications
for delete
using (public.is_admin());
