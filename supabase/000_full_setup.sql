-- ============================================================
-- LAZER EPILYASIYA MƏRKƏZİ -- Full Supabase Setup Script
-- Bu skripti Supabase SQL Editor-da BİR DƏFƏYƏ işə salın.
-- ============================================================

-- ============ 1) MIGRATIONS (cədvəllər + funksiyalar + view-lar) ============

-- ---- migrations/0001_create_branches.sql ----
-- Filiallar (branches)
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz not null default now()
);

comment on table public.branches is 'Klinikanın filialları';

alter table public.branches enable row level security;

-- ---- migrations/0002_create_devices.sql ----
-- Cihazlar (devices)
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  type text not null,
  shot_counter bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_devices_branch_id on public.devices(branch_id);

comment on table public.devices is 'Filiallara bağlı lazer cihazları və atış sayğacı';

alter table public.devices enable row level security;

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
  name text not null,
  device_id uuid not null references public.devices(id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_zones_device_id on public.zones(device_id);

comment on table public.zones is 'Bədən nahiyələri və cihaz üzrə qiymətləri';

alter table public.zones enable row level security;

-- ---- migrations/0006_create_packages.sql ----
-- Paketlər (packages) — zonaların birləşməsi + endirimli qiymət
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

comment on table public.packages is 'Bir neçə nahiyəni birləşdirən endirimli paketlər';

alter table public.packages enable row level security;

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
  name text not null,
  description text,
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
  created_at timestamptz not null default now()
);

create index if not exists idx_follow_ups_customer_id on public.follow_ups(customer_id);
create index if not exists idx_follow_ups_planned_date on public.follow_ups(planned_date);
create index if not exists idx_follow_ups_status on public.follow_ups(status);

comment on table public.follow_ups is 'Müştərilər üçün planlaşdırılan növbəti vizitlər';

alter table public.follow_ups enable row level security;

-- ---- migrations/0013_create_notifications.sql ----
-- Bildirişlər (notifications) — ad günü, fraud, follow-up mərkəzi anbarı
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('birthday', 'fraud', 'follow_up')),
  customer_id uuid references public.customers(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_customer_id on public.notifications(customer_id);
create index if not exists idx_notifications_type on public.notifications(type);
create index if not exists idx_notifications_is_read on public.notifications(is_read);

comment on table public.notifications is 'Bütün modullardan gələn bildirişlərin mərkəzi anbarı';

alter table public.notifications enable row level security;

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
  and extract(month from birth_date) = extract(month from current_date)
  and extract(day from birth_date) = extract(day from current_date);

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

-- ---- policies/profiles_policies.sql ----
-- profiles: hər kəs öz profilini oxuya bilər, admin hamısını görür.
-- Yazma əməliyyatları normalda backend-in SUPABASE_ADMIN_CLIENT-i (service role) ilə
-- edilir və RLS-i bypass edir, ona görə burada yalnız SELECT policy-ləri kifayətdir.

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
-- NotificationModule tərəfindən SUPABASE_ADMIN_CLIENT ilə edilir (event-driven).

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
