-- Cihazın atış sayğacını atomik şəkildə artırmaq üçün RPC funksiyası.
-- Tətbiq (Node.js) tərəfində "oxu-sonra-yaz" adətindən qaynaqlanan race
-- condition-ların qarşısını almaq üçün DB səviyyəsində icra olunur.

create or replace function public.increment_device_shot_counter(
  p_device_id uuid,
  p_amount integer
)
returns public.devices
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_device public.devices;
begin
  update public.devices
  set shot_counter = shot_counter + p_amount
  where id = p_device_id
  returning * into updated_device;

  if not found then
    raise exception 'Device % not found', p_device_id;
  end if;

  return updated_device;
end;
$$;
