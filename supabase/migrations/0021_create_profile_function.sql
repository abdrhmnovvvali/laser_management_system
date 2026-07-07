-- Profil yaratma/yeniləmə (staff seed, POST /auth/staff).
-- profiles cədvəlində INSERT policy olmadığı üçün yazma bu funksiya
-- vasitəsilə edilir; security definer RLS-i aradan qaldırır.

create or replace function public.upsert_profile(
  p_id uuid,
  p_role text,
  p_branch_id uuid,
  p_full_name text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_profile public.profiles;
begin
  if p_role not in ('admin', 'branch_staff') then
    raise exception 'Invalid role: %', p_role;
  end if;

  insert into public.profiles (id, role, branch_id, full_name)
  values (p_id, p_role, p_branch_id, p_full_name)
  on conflict (id) do update set
    role = excluded.role,
    branch_id = excluded.branch_id,
    full_name = excluded.full_name
  returning * into saved_profile;

  return saved_profile;
end;
$$;

revoke all on function public.upsert_profile(uuid, text, uuid, text) from public;
grant execute on function public.upsert_profile(uuid, text, uuid, text) to service_role;
