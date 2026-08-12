-- Fərq üzrə filtr üçün generated column (actual - declared).
alter table public.procedures
  add column if not exists shot_count_difference integer
  generated always as (actual_shot_count - declared_shot_count) stored;

create index if not exists idx_procedures_shot_count_difference
  on public.procedures (shot_count_difference);

create index if not exists idx_procedures_price
  on public.procedures (price);

create index if not exists idx_procedures_package_id
  on public.procedures (package_id);

create index if not exists idx_procedures_visit_number
  on public.procedures (visit_number);
