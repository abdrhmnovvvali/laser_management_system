-- RLS policy-lərində istifadə olunan köməkçi funksiyalar.
-- security definer + search_path təhlükəsizlik üçün sabitlənib ki, profiles
-- cədvəlinə çağıran istifadəçinin öz RLS-i mane olmasın (sonsuz rekursiyanın qarşısı alınır).

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_branch_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select branch_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'admin';
$$;
