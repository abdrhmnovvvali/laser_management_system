-- notifications cədvəlinə fraud üçün prosedur referansı əlavə et
alter table public.notifications
  add column if not exists procedure_id uuid references public.procedures(id) on delete set null;

create index if not exists idx_notifications_procedure_id on public.notifications(procedure_id);

comment on column public.notifications.procedure_id is
  'Fraud bildirişi ilə bağlı prosedurun ID-si';

-- create_notification funksiyasını yeni sahə ilə yenilə
create or replace function public.create_notification(
  p_type text,
  p_customer_id uuid,
  p_procedure_id uuid,
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

  insert into public.notifications (type, customer_id, procedure_id, message, is_read)
  values (p_type, p_customer_id, p_procedure_id, p_message, false)
  returning * into created_notification;

  return created_notification;
end;
$$;

revoke all on function public.create_notification(text, uuid, uuid, text) from public;
grant execute on function public.create_notification(text, uuid, uuid, text) to service_role;
