-- Bəyan edilən və faktiki atış sayı fərqli olan prosedurları göstərən görünüş.
-- `security_invoker = true` sayəsində RLS, sorğunu edən istifadəçinin (filial
-- işçisi/admin) hüquqları ilə tətbiq olunur — ayrıca policy yazmağa ehtiyac yoxdur.
create or replace view public.fraud_report_view
with (security_invoker = true)
as
select
  p.id,
  p.device_id,
  p.declared_shot_count,
  p.actual_shot_count,
  p.date,
  c.id as customer_id,
  c.branch_id
from public.procedures p
join public.customers c on c.id = p.customer_id
where p.actual_shot_count <> p.declared_shot_count;
