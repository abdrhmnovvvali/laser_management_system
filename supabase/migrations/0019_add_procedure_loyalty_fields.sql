-- Loyallıq endirimi: hansı nahiyənin pulsuz verildiyini və endirim məbləğini saxlayır.
alter table public.procedures
  add column if not exists free_zone_id uuid references public.zones(id) on delete set null,
  add column if not exists discount_amount numeric(10, 2) not null default 0
    check (discount_amount >= 0),
  add column if not exists visit_number integer check (visit_number is null or visit_number > 0);

comment on column public.procedures.free_zone_id is
  'Loyallıq qaydası ilə pulsuz verilən nahiyə (məs. hər 7-ci vizit)';
comment on column public.procedures.discount_amount is
  'Loyallıq endiriminin məbləği (AZN)';
comment on column public.procedures.visit_number is
  'Müştərinin bu prosedur üzrə vizit nömrəsi (1, 2, 3, ...)';
