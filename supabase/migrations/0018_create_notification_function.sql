-- Event-driven bildiriş yaratma (fraud, ad günü, follow-up).
-- notifications cədvəlində INSERT policy olmadığı üçün yazma bu funksiya
-- vasitəsilə edilir; security definer RLS-i aradan qaldırır.

create or replace function public.create_notification(
  p_type text,
  p_customer_id uuid,
  p_message text
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  created_notification public.notifications;
begin
  if p_type not in ('birthday', 'fraud', 'follow_up') then
    raise exception 'Invalid notification type: %', p_type;
  end if;

  insert into public.notifications (type, customer_id, message, is_read)
  values (p_type, p_customer_id, p_message, false)
  returning * into created_notification;

  return created_notification;
end;
$$;

revoke all on function public.create_notification(text, uuid, text) from public;
grant execute on function public.create_notification(text, uuid, text) to service_role;
