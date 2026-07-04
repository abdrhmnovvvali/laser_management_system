-- Paketlər (packages) — zonaların birləşməsi + endirimli qiymət
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

comment on table public.packages is 'Bir neçə nahiyəni birləşdirən endirimli paketlər';

alter table public.packages enable row level security;
