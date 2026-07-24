-- Bildiriş mesajları üçün AZ/EN/RU translation cədvəli.
-- Mövcud message sütunu az locale-ə köçürülür, sonra parent-dən silinir.

create table if not exists public.notification_translations (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  message text not null,
  primary key (notification_id, locale)
);

create index if not exists idx_notification_translations_locale
  on public.notification_translations(locale);

insert into public.notification_translations (notification_id, locale, message)
select id, 'az', message
from public.notifications
where message is not null
on conflict do nothing;

alter table public.notifications drop column if exists message;

alter table public.notification_translations enable row level security;

create policy "notification_translations_select"
on public.notification_translations
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.notifications n
    join public.customers c on c.id = n.customer_id
    where n.id = notification_translations.notification_id
      and c.branch_id = public.current_user_branch_id()
  )
);

-- Köhnə imzaları sil (varsa)
drop function if exists public.create_notification(text, uuid, text);
drop function if exists public.create_notification(text, uuid, uuid, text);

-- p_messages: {"az":"...","en":"...","ru":"..."}
create or replace function public.create_notification(
  p_type text,
  p_customer_id uuid,
  p_procedure_id uuid,
  p_messages jsonb
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  created_notification public.notifications;
  locale_key text;
  locale_message text;
begin
  if p_type not in ('birthday', 'fraud', 'follow_up') then
    raise exception 'Invalid notification type: %', p_type;
  end if;

  if p_messages is null or jsonb_typeof(p_messages) <> 'object' then
    raise exception 'p_messages must be a JSON object of locale -> message';
  end if;

  if not (p_messages ? 'az' and p_messages ? 'en' and p_messages ? 'ru') then
    raise exception 'p_messages must include az, en and ru';
  end if;

  insert into public.notifications (type, customer_id, procedure_id, is_read)
  values (p_type, p_customer_id, p_procedure_id, false)
  returning * into created_notification;

  for locale_key, locale_message in
    select key, value
    from jsonb_each_text(p_messages)
  loop
    if locale_key not in ('az', 'en', 'ru') then
      raise exception 'Invalid notification locale: %', locale_key;
    end if;

    if locale_message is null or btrim(locale_message) = '' then
      raise exception 'Empty notification message for locale: %', locale_key;
    end if;

    insert into public.notification_translations (notification_id, locale, message)
    values (created_notification.id, locale_key, locale_message);
  end loop;

  return created_notification;
end;
$$;

revoke all on function public.create_notification(text, uuid, uuid, jsonb) from public;
grant execute on function public.create_notification(text, uuid, uuid, jsonb) to service_role;
