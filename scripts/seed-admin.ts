/**
 * Seed script: Supabase Auth-da ilk admin istifadəçisini yaradır və
 * `profiles` cədvəlində uyğun sətri (role='admin') insert edir.
 *
 * İstifadə:
 *   npm run seed:admin -- <email> <password> ["Ad Soyad"]
 *
 * Nümunə:
 *   npm run seed:admin -- admin@lazer.az StrongPass123! "Baş Admin"
 *
 * Qeyd: .env faylında SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY dolu olmalıdır.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(): void {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvFile();

  const [, , email, password, fullName] = process.argv;

  if (!email || !password) {
    console.error(
      'İstifadə: npm run seed:admin -- <email> <password> ["Ad Soyad"]',
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      '.env faylında SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY dolu olmalıdır.',
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Admin istifadəçisi yaradılır: ${email} ...`);

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  let userId: string;

  if (createError) {
    const alreadyExists = createError.message
      .toLowerCase()
      .includes('already been registered');

    if (!alreadyExists) {
      console.error('İstifadəçi yaradıla bilmədi:', createError.message);
      process.exit(1);
    }

    console.log(
      'Bu email artıq Supabase Auth-da mövcuddur, profil yenə də yaradılacaq/yenilənəcək.',
    );

    const { data: listData, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('İstifadəçi siyahısı alına bilmədi:', listError.message);
      process.exit(1);
    }

    const existingUser = listData.users.find((u) => u.email === email);
    if (!existingUser) {
      console.error('Mövcud istifadəçi tapılmadı.');
      process.exit(1);
    }
    userId = existingUser.id;
  } else {
    userId = created.user.id;
  }

  const { error: profileError } = await supabase.rpc('upsert_profile', {
    p_id: userId,
    p_role: 'admin',
    p_branch_id: null,
    p_full_name: fullName ?? 'Admin',
  });

  if (profileError) {
    console.error('Profil yaradıla bilmədi:', profileError.message);
    process.exit(1);
  }

  console.log('✔ Admin istifadəçisi hazırdır.');
  console.log(`  Email: ${email}`);
  console.log(`  Şifrə: ${password}`);
  console.log(`  User ID: ${userId}`);
  console.log(
    '\nİndi POST /auth/login ilə bu email/şifrə ilə daxil ola bilərsiniz.',
  );
}

main().catch((error) => {
  console.error('Gözlənilməz xəta:', error);
  process.exit(1);
});
