-- Bu gün ad günü olan müştəriləri göstərən görünüş (il nəzərə alınmadan ay/gün müqayisəsi).
-- `security_invoker = true` sayəsində filial işçisi yalnız öz filialının
-- müştərilərini görür, admin isə hamısını.
create or replace view public.todays_birthdays_view
with (security_invoker = true)
as
select
  id,
  first_name,
  last_name,
  branch_id,
  birth_date
from public.customers
where
  birth_date is not null
  and extract(month from birth_date) =
    extract(month from timezone('Asia/Baku', now())::date)
  and extract(day from birth_date) =
    extract(day from timezone('Asia/Baku', now())::date);
