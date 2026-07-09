-- Ad günü görünüşünü Bakı vaxt zonasına uyğunlaşdır
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

grant select on public.todays_birthdays_view to authenticated;
grant select on public.todays_birthdays_view to service_role;
