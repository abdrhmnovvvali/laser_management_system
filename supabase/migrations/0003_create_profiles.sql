-- Profiles: auth.users cədvəlini rol və filial məlumatı ilə genişləndirir
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'branch_staff')),
  branch_id uuid references public.branches(id) on delete set null,
  full_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_branch_id on public.profiles(branch_id);

comment on table public.profiles is 'Supabase Auth istifadəçilərinin rol/filial genişləndirməsi';

alter table public.profiles enable row level security;
