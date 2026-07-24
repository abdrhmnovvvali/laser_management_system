-- ============================================================
-- LAZER EPILYASIYA MƏRKƏZİ -- Full Supabase Setup Script
-- Bu skripti Supabase SQL Editor-da BİR DƏFƏYƏ işə salın.
-- ============================================================

-- ============ 1) MIGRATIONS (cədvəllər + funksiyalar + view-lar) ============

-- ---- migrations/0001_create_branches.sql ----
-- Filiallar (branches)
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

comment on table public.branches is 'Klinikanın filialları';

alter table public.branches enable row level security;

create table if not exists public.branch_translations (
  branch_id uuid not null references public.branches(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  name text not null,
  address text,
  primary key (branch_id, locale)
);

create index if not exists idx_branch_translations_locale
  on public.branch_translations(locale);

alter table public.branch_translations enable row level security;

-- ---- migrations/0002_create_devices.sql ----
-- Cihazlar (devices)
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  shot_counter bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_devices_branch_id on public.devices(branch_id);

comment on table public.devices is 'Filiallara bağlı lazer cihazları və atış sayğacı';

alter table public.devices enable row level security;

create table if not exists public.device_translations (
  device_id uuid not null references public.devices(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  type text not null,
  primary key (device_id, locale)
);

create index if not exists idx_device_translations_locale
  on public.device_translations(locale);

alter table public.device_translations enable row level security;

-- ---- migrations/0003_create_profiles.sql ----
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

-- ---- migrations/0004_create_customers.sql ----
-- Müştərilər (customers)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  birth_date date,
  gender text check (gender in ('female', 'male', 'other')),
  branch_id uuid not null references public.branches(id) on delete restrict,
  registered_at timestamptz not null default now()
);

create index if not exists idx_customers_branch_id on public.customers(branch_id);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_customers_birth_date on public.customers(birth_date);

comment on table public.customers is 'Müştəri qeydiyyat məlumatları';

alter table public.customers enable row level security;

-- ---- migrations/0005_create_zones.sql ----
-- Nahiyələr (zones) — cihaz üzrə qiymət matrisası
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_zones_device_id on public.zones(device_id);

comment on table public.zones is 'Bədən nahiyələri və cihaz üzrə qiymətləri';

alter table public.zones enable row level security;

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

alter table public.zone_translations enable row level security;

-- ---- migrations/0006_create_packages.sql ----
-- Paketlər (packages) — zonaların birləşməsi + endirimli qiymət
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

comment on table public.packages is 'Bir neçə nahiyəni birləşdirən endirimli paketlər';

alter table public.packages enable row level security;

create table if not exists public.package_translations (
  package_id uuid not null references public.packages(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  name text not null,
  primary key (package_id, locale)
);

create index if not exists idx_package_translations_locale
  on public.package_translations(locale);

alter table public.package_translations enable row level security;

-- ---- migrations/0007_create_package_zones.sql ----
-- package_zones: paket <-> zona many-to-many əlaqəsi
create table if not exists public.package_zones (
  package_id uuid not null references public.packages(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete cascade,
  primary key (package_id, zone_id)
);

create index if not exists idx_package_zones_zone_id on public.package_zones(zone_id);

comment on table public.package_zones is 'Paketə daxil olan nahiyələr';

alter table public.package_zones enable row level security;

-- ---- migrations/0008_create_procedures.sql ----
-- Prosedurlar (procedures) — vizit qeydi
create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete restrict,
  package_id uuid references public.packages(id) on delete set null,
  date timestamptz not null default now(),
  declared_shot_count integer not null check (declared_shot_count >= 0),
  actual_shot_count integer not null check (actual_shot_count >= 0),
  price numeric(10, 2) not null check (price >= 0),
  free_zone_id uuid references public.zones(id) on delete set null,
  discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0),
  visit_number integer check (visit_number is null or visit_number > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_procedures_customer_id on public.procedures(customer_id);
create index if not exists idx_procedures_device_id on public.procedures(device_id);
create index if not exists idx_procedures_date on public.procedures(date);

comment on table public.procedures is 'Müştəri vizitləri: zona/paket seçimi, bəyan edilən vs faktiki atış sayı';

alter table public.procedures enable row level security;

-- ---- migrations/0009_create_procedure_zones.sql ----
-- procedure_zones: bir prosedurda bir neçə zona ola bilər
create table if not exists public.procedure_zones (
  procedure_id uuid not null references public.procedures(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete restrict,
  primary key (procedure_id, zone_id)
);

create index if not exists idx_procedure_zones_zone_id on public.procedure_zones(zone_id);

comment on table public.procedure_zones is 'Prosedurda seçilən nahiyələr';

alter table public.procedure_zones enable row level security;

-- ---- migrations/0010_create_campaigns.sql ----
-- Kampaniyalar (campaigns)
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value >= 0),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  constraint chk_campaign_date_range check (end_date >= start_date)
);

create index if not exists idx_campaigns_date_range on public.campaigns(start_date, end_date);

comment on table public.campaigns is 'Endirim kampaniyaları';

alter table public.campaigns enable row level security;

create table if not exists public.campaign_translations (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  name text not null,
  description text,
  primary key (campaign_id, locale)
);

create index if not exists idx_campaign_translations_locale
  on public.campaign_translations(locale);

alter table public.campaign_translations enable row level security;

-- ---- migrations/0020_create_campaign_zones.sql ----
-- campaign_zones: kampaniya <-> zona many-to-many əlaqəsi
create table if not exists public.campaign_zones (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete cascade,
  primary key (campaign_id, zone_id)
);

create index if not exists idx_campaign_zones_zone_id on public.campaign_zones(zone_id);

comment on table public.campaign_zones is 'Kampaniyanın tətbiq olunduğu nahiyələr';

alter table public.campaign_zones enable row level security;

-- ---- migrations/0021_create_profile_function.sql ----
-- Profil yaratma/yeniləmə (staff seed, POST /auth/staff).
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

-- ---- migrations/0011_create_notes.sql ----
-- Qeydlər (notes) — zəng/sosial media/üz-üzə kommunikasiya
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null check (type in ('call', 'social', 'in_person')),
  content text not null,
  outcome text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notes_customer_id on public.notes(customer_id);

comment on table public.notes is 'Müştəri ilə kommunikasiya qeydləri';

alter table public.notes enable row level security;

-- ---- migrations/0012_create_follow_ups.sql ----
-- Növbəti vizit planlaması (follow_ups)
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  planned_date date not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'missed')),
  zone_id uuid references public.zones(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_follow_ups_customer_id on public.follow_ups(customer_id);
create index if not exists idx_follow_ups_planned_date on public.follow_ups(planned_date);
create index if not exists idx_follow_ups_status on public.follow_ups(status);
create index if not exists idx_follow_ups_zone_id on public.follow_ups(zone_id);

comment on table public.follow_ups is 'Müştərilər üçün planlaşdırılan növbəti vizitlər';

alter table public.follow_ups enable row level security;

-- ---- migrations/0013_create_notifications.sql ----
-- Bildirişlər (notifications) — ad günü, fraud, follow-up mərkəzi anbarı
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('birthday', 'fraud', 'follow_up')),
  customer_id uuid references public.customers(id) on delete cascade,
  procedure_id uuid references public.procedures(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_customer_id on public.notifications(customer_id);
create index if not exists idx_notifications_procedure_id on public.notifications(procedure_id);
create index if not exists idx_notifications_type on public.notifications(type);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

comment on table public.notifications is 'Bütün modullardan gələn bildirişlərin mərkəzi anbarı';

alter table public.notifications enable row level security;

create table if not exists public.notification_translations (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  locale text not null check (locale in ('az', 'en', 'ru')),
  message text not null,
  primary key (notification_id, locale)
);

create index if not exists idx_notification_translations_locale
  on public.notification_translations(locale);

alter table public.notification_translations enable row level security;

-- ---- migrations/0014_create_auth_helper_functions.sql ----
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

-- ---- migrations/0015_create_increment_shot_counter_function.sql ----
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

-- ---- migrations/0016_create_fraud_report_view.sql ----
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

-- ---- migrations/0017_create_todays_birthdays_view.sql ----
-- Bu gün ad günü olan müştəriləri göstərən görünüş (il nəzərə alınmadan ay/gün müqayisəsi).
-- `security_invoker = true` sayəsində filial işçisi yalnız öz filialının
-- müştərilərini görür, admin isə hamısını.
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

-- ---- migrations/0018_create_notification_function.sql ----
-- Event-driven bildiriş yaratma (fraud, ad günü, follow-up).
-- notifications cədvəlində INSERT policy olmadığı üçün yazma bu funksiya
-- vasitəsilə edilir; security definer RLS-i aradan qaldırır.
-- p_messages: {"az":"...","en":"...","ru":"..."}

create or replace function public.create_notification(
  p_type text,
  p_customer_id uuid,
  p_procedure_id uuid,
  p_messages jsonb
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  created_notification public.notifications;
  locale_key text;
  locale_message text;
begin
  if p_type not in ('birthday', 'fraud', 'follow_up') then
    raise exception 'Invalid notification type: %', p_type;
  end if;

  if p_messages is null or jsonb_typeof(p_messages) <> 'object' then
    raise exception 'p_messages must be a JSON object of locale -> message';
  end if;

  if not (p_messages ? 'az' and p_messages ? 'en' and p_messages ? 'ru') then
    raise exception 'p_messages must include az, en and ru';
  end if;

  insert into public.notifications (type, customer_id, procedure_id, is_read)
  values (p_type, p_customer_id, p_procedure_id, false)
  returning * into created_notification;

  for locale_key, locale_message in
    select key, value
    from jsonb_each_text(p_messages)
  loop
    if locale_key not in ('az', 'en', 'ru') then
      raise exception 'Invalid notification locale: %', locale_key;
    end if;

    if locale_message is null or btrim(locale_message) = '' then
      raise exception 'Empty notification message for locale: %', locale_key;
    end if;

    insert into public.notification_translations (notification_id, locale, message)
    values (created_notification.id, locale_key, locale_message);
  end loop;

  return created_notification;
end;
$$;

revoke all on function public.create_notification(text, uuid, uuid, jsonb) from public;
grant execute on function public.create_notification(text, uuid, uuid, jsonb) to service_role;

-- ---- migrations/0019_add_procedure_loyalty_fields.sql ----
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

-- ---- migrations/0022_add_follow_up_zone_id.sql ----
-- follow_ups cədvəlinə nahiyə əlavə et
alter table public.follow_ups
  add column if not exists zone_id uuid references public.zones(id) on delete set null;

create index if not exists idx_follow_ups_zone_id on public.follow_ups(zone_id);

comment on column public.follow_ups.zone_id is 'Planlaşdırılan nahiyə';

-- ---- migrations/0023_add_notification_procedure_id.sql ----
-- notifications cədvəlinə fraud üçün prosedur referansı əlavə et
alter table public.notifications
  add column if not exists procedure_id uuid references public.procedures(id) on delete set null;

create index if not exists idx_notifications_procedure_id on public.notifications(procedure_id);

comment on column public.notifications.procedure_id is
  'Fraud bildirişi ilə bağlı prosedurun ID-si';

-- create_notification (jsonb messages) artıq yuxarıda (0018) təyin olunub.

-- ---- migrations/0024_update_todays_birthdays_view_timezone.sql ----
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

-- ---- migrations/0025_create_catalog_translations.sql ----
-- (Translation cədvəlləri yuxarıda parent cədvəllərlə birlikdə yaradılır.
--  Mövcud DB-lər üçün ayrıca 0025 migration faylına baxın.)

-- ============ 2) RLS POLICY-LƏRİ ============

-- ---- policies/branches_policies.sql ----
-- branches: admin bütün filialları idarə edir, filial işçisi yalnız öz filialını görür.

create policy "branches_select"
on public.branches
for select
using (
  public.is_admin()
  or id = public.current_user_branch_id()
);

create policy "branches_admin_write"
on public.branches
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/branch_translations_policies.sql ----
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

-- ---- policies/devices_policies.sql ----
-- devices: admin bütün cihazları idarə edir, filial işçisi yalnız öz filialının cihazlarını görür.

create policy "devices_select"
on public.devices
for select
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "devices_admin_write"
on public.devices
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/device_translations_policies.sql ----
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

-- ---- policies/profiles_policies.sql ----
-- profiles: hər kəs öz profilini oxuya bilər, admin hamısını görür.
-- Yazma əməliyyatları `upsert_profile` RPC funksiyası ilə edilir
-- (security definer — bax 0021_create_profile_function.sql).

create policy "profiles_select_self_or_admin"
on public.profiles
for select
using (
  id = auth.uid()
  or public.is_admin()
);

-- ---- policies/customers_policies.sql ----
-- customers: admin bütün müştəriləri görür/idarə edir, filial işçisi yalnız öz
-- filialının müştəriləri üzərində tam CRUD edə bilər.

create policy "customers_select"
on public.customers
for select
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "customers_staff_write"
on public.customers
for insert
with check (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "customers_staff_update"
on public.customers
for update
using (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
)
with check (
  public.is_admin()
  or branch_id = public.current_user_branch_id()
);

create policy "customers_admin_delete"
on public.customers
for delete
using (public.is_admin());

-- ---- policies/zones_policies.sql ----
-- zones: admin bütün nahiyələri idarə edir, filial işçisi yalnız öz filialının
-- cihazlarına bağlı nahiyələri görür.

create policy "zones_select"
on public.zones
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.devices d
    where d.id = zones.device_id
      and d.branch_id = public.current_user_branch_id()
  )
);

create policy "zones_admin_write"
on public.zones
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/zone_translations_policies.sql ----
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

-- ---- policies/packages_policies.sql ----
-- packages: filial-spesifik deyil — bütün autentifikasiya olunmuş istifadəçilər
-- oxuya bilər, yalnız admin dəyişiklik edə bilər.

create policy "packages_select_authenticated"
on public.packages
for select
using (auth.role() = 'authenticated');

create policy "packages_admin_write"
on public.packages
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/package_translations_policies.sql ----
create policy "package_translations_select"
on public.package_translations
for select
using (auth.role() = 'authenticated');

create policy "package_translations_admin_write"
on public.package_translations
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/package_zones_policies.sql ----
-- package_zones: paket-nahiyə əlaqəsi, packages ilə eyni məntiq.

create policy "package_zones_select_authenticated"
on public.package_zones
for select
using (auth.role() = 'authenticated');

create policy "package_zones_admin_write"
on public.package_zones
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/procedures_policies.sql ----
-- procedures: filial işçisi yalnız öz filialının müştərilərinə aid prosedurları
-- görə/yarada bilər (müştərinin branch_id-si vasitəsilə).

create policy "procedures_select"
on public.procedures
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedures_staff_insert"
on public.procedures
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedures_staff_update"
on public.procedures
for update
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = procedures.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedures_admin_delete"
on public.procedures
for delete
using (public.is_admin());

-- ---- policies/procedure_zones_policies.sql ----
-- procedure_zones: procedures ilə eyni filial-sərhədi (procedure -> customer -> branch).

create policy "procedure_zones_select"
on public.procedure_zones
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.procedures p
    join public.customers c on c.id = p.customer_id
    where p.id = procedure_zones.procedure_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedure_zones_staff_write"
on public.procedure_zones
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.procedures p
    join public.customers c on c.id = p.customer_id
    where p.id = procedure_zones.procedure_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "procedure_zones_admin_delete"
on public.procedure_zones
for delete
using (public.is_admin());

-- ---- policies/campaigns_policies.sql ----
-- campaigns: filial-spesifik deyil, bütün autentifikasiya olunmuş istifadəçilər
-- oxuya bilər, yalnız admin dəyişiklik edə bilər.

create policy "campaigns_select_authenticated"
on public.campaigns
for select
using (auth.role() = 'authenticated');

create policy "campaigns_admin_write"
on public.campaigns
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/campaign_translations_policies.sql ----
create policy "campaign_translations_select"
on public.campaign_translations
for select
using (auth.role() = 'authenticated');

create policy "campaign_translations_admin_write"
on public.campaign_translations
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/campaign_zones_policies.sql ----
-- campaign_zones: kampaniya-nahiyə əlaqəsi, campaigns ilə eyni məntiq.

create policy "campaign_zones_select_authenticated"
on public.campaign_zones
for select
using (auth.role() = 'authenticated');

create policy "campaign_zones_admin_write"
on public.campaign_zones
for all
using (public.is_admin())
with check (public.is_admin());

-- ---- policies/notes_policies.sql ----
-- notes: müştərinin filialına görə sərhədlənir.

create policy "notes_select"
on public.notes
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "notes_staff_insert"
on public.notes
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "notes_staff_update"
on public.notes
for update
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = notes.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "notes_admin_delete"
on public.notes
for delete
using (public.is_admin());

-- ---- policies/follow_ups_policies.sql ----
-- follow_ups: müştərinin filialına görə sərhədlənir.

create policy "follow_ups_select"
on public.follow_ups
for select
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_ups_staff_insert"
on public.follow_ups
for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_ups_staff_update"
on public.follow_ups
for update
using (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.customers c
    where c.id = follow_ups.customer_id
      and c.branch_id = public.current_user_branch_id()
  )
);

create policy "follow_ups_admin_delete"
on public.follow_ups
for delete
using (public.is_admin());

-- ---- policies/notifications_policies.sql ----
-- notifications: müştəriyə bağlı olanlar filial üzrə sərhədlənir; müştərisiz
-- (sistem səviyyəli) bildirişləri yalnız admin görür. Yazma əməliyyatları
-- NotificationModule tərəfindən `create_notification` RPC funksiyası ilə edilir
-- (event-driven, security definer — bax 0018_create_notification_function.sql).

create policy "notifications_select"
on public.notifications
for select
using (
  public.is_admin()
  or (
    customer_id is not null
    and exists (
      select 1 from public.customers c
      where c.id = notifications.customer_id
        and c.branch_id = public.current_user_branch_id()
    )
  )
);

create policy "notifications_staff_mark_read"
on public.notifications
for update
using (
  public.is_admin()
  or (
    customer_id is not null
    and exists (
      select 1 from public.customers c
      where c.id = notifications.customer_id
        and c.branch_id = public.current_user_branch_id()
    )
  )
)
with check (
  public.is_admin()
  or (
    customer_id is not null
    and exists (
      select 1 from public.customers c
      where c.id = notifications.customer_id
        and c.branch_id = public.current_user_branch_id()
    )
  )
);

create policy "notifications_admin_delete"
on public.notifications
for delete
using (public.is_admin());

-- ---- policies/notification_translations_policies.sql ----
create policy "notification_translations_select"
on public.notification_translations
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.notifications n
    join public.customers c on c.id = n.customer_id
    where n.id = notification_translations.notification_id
      and c.branch_id = public.current_user_branch_id()
  )
);