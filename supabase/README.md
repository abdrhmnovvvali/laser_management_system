# Supabase Migrations & Policies

## Tətbiq ardıcıllığı

1. `migrations/` qovluğundakı fayllar **nömrə sırası ilə** Supabase SQL Editor-da və ya
   `supabase db push` / `supabase migration up` ilə tətbiq olunmalıdır (fayl adındakı `NNNN_`
   prefiksi sırayı təyin edir).
2. Bütün `migrations/*.sql` tətbiq olunduqdan sonra `policies/` qovluğundakı fayllar tətbiq
   olunmalıdır (RLS policy-ləri cədvəllər mövcud olduqdan sonra yaradıla bilər).

## Qeydlər

- Hər cədvəl `alter table ... enable row level security;` ilə RLS aktivləşdirilir (bax
  müvafiq migration faylı).
- `0014_create_auth_helper_functions.sql` faylındakı `current_user_role()`,
  `current_user_branch_id()`, `is_admin()` funksiyaları bütün policy-lərdə istifadə olunur.
- Backend iki fərqli Supabase client istifadə edir (`src/shared/supabase`):
  - **request-scoped** (anon key + istifadəçi JWT-si) — RLS-ə tabedir, adi CRUD üçün.
  - **admin** (service role key) — RLS-i bypass edir, yalnız sistem/cron/auth əməliyyatları üçün.
