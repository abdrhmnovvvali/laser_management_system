-- Katalog entity-ləri üçün AZ/EN/RU translation cədvəlləri.
-- Mövcud text sütunları az locale-ə köçürülür, sonra parent-dən silinir.

-- ========== branch_translations ==========
create table if not exists public.branch_translations (
  branch_id uuid not null references public.branches(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  name text not null,
  address text,
  primary key (branch_id, locale)
);

create index if not exists idx_branch_translations_locale
  on public.branch_translations(locale);

insert into public.branch_translations (branch_id, locale, name, address)
select id, 'az', name, address
from public.branches
on conflict do nothing;

alter table public.branches drop column if exists name;
alter table public.branches drop column if exists address;

alter table public.branch_translations enable row level security;

create policy "branch_translations_select"
on public.branch_translations
for select
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "branch_translations_admin_write"
on public.branch_translations
for all
using (public.is_admin())
with check (public.is_admin());

-- ========== device_translations ==========
create table if not exists public.device_translations (
  device_id uuid not null references public.devices(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  type text not null,
  primary key (device_id, locale)
);

create index if not exists idx_device_translations_locale
  on public.device_translations(locale);

insert into public.device_translations (device_id, locale, type)
select id, 'az', type
from public.devices
on conflict do nothing;

alter table public.devices drop column if exists type;

alter table public.device_translations enable row level security;

create policy "device_translations_select"
on public.device_translations
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.devices d
    where d.id = device_translations.device_id
      and d.branch_id = public.current_user_branch_id()
  )
);

create policy "device_translations_admin_write"
on public.device_translations
for all
using (public.is_admin())
with check (public.is_admin());

-- ========== zone_translations ==========
create table if not exists public.zone_translations (
  zone_id uuid not null references public.zones(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  name text not null,
  primary key (zone_id, locale)
);

create index if not exists idx_zone_translations_locale
  on public.zone_translations(locale);

create index if not exists idx_zone_translations_name
  on public.zone_translations(name);

insert into public.zone_translations (zone_id, locale, name)
select id, 'az', name
from public.zones
on conflict do nothing;

alter table public.zones drop column if exists name;

alter table public.zone_translations enable row level security;

create policy "zone_translations_select"
on public.zone_translations
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.zones z
    join public.devices d on d.id = z.device_id
    where z.id = zone_translations.zone_id
      and d.branch_id = public.current_user_branch_id()
  )
);

create policy "zone_translations_admin_write"
on public.zone_translations
for all
using (public.is_admin())
with check (public.is_admin());

-- ========== package_translations ==========
create table if not exists public.package_translations (
  package_id uuid not null references public.packages(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  name text not null,
  primary key (package_id, locale)
);

create index if not exists idx_package_translations_locale
  on public.package_translations(locale);

insert into public.package_translations (package_id, locale, name)
select id, 'az', name
from public.packages
on conflict do nothing;

alter table public.packages drop column if exists name;

alter table public.package_translations enable row level security;

create policy "package_translations_select"
on public.package_translations
for select
using (auth.role() = 'authenticated');

create policy "package_translations_admin_write"
on public.package_translations
for all
using (public.is_admin())
with check (public.is_admin());

-- ========== campaign_translations ==========
create table if not exists public.campaign_translations (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  name text not null,
  description text,
  primary key (campaign_id, locale)
);

create index if not exists idx_campaign_translations_locale
  on public.campaign_translations(locale);

insert into public.campaign_translations (campaign_id, locale, name, description)
select id, 'az', name, description
from public.campaigns
on conflict do nothing;

alter table public.campaigns drop column if exists name;
alter table public.campaigns drop column if exists description;

alter table public.campaign_translations enable row level security;

create policy "campaign_translations_select"
on public.campaign_translations
for select
using (auth.role() = 'authenticated');

create policy "campaign_translations_admin_write"
on public.campaign_translations
for all
using (public.is_admin())
with check (public.is_admin());
