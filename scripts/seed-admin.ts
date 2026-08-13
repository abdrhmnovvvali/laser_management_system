/**
 * Seed script: Postgres `users` cədvəlində ilk admin istifadəçisini yaradır.
 *
 * İstifadə:
 *   npm run seed:admin -- <email> <password> ["Ad Soyad"]
 *
 * Nümunə:
 *   npm run seed:admin -- admin@lazer.az StrongPass123! "Baş Admin"
 *
 * Qeyd: .env faylında DATABASE_URL dolu olmalıdır.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  const [, , emailArg, password, fullName] = process.argv;

  if (!emailArg || !password) {
    console.error(
      'İstifadə: npm run seed:admin -- <email> <password> ["Ad Soyad"]',
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('.env faylında DATABASE_URL dolu olmalıdır.');
    process.exit(1);
  }

  const email = emailArg.toLowerCase();
  const prisma = new PrismaClient();

  try {
    console.log(`Admin istifadəçisi yaradılır: ${email} ...`);
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        role: Role.admin,
        branchId: null,
        fullName: fullName ?? 'Admin',
      },
      update: {
        passwordHash,
        role: Role.admin,
        branchId: null,
        fullName: fullName ?? 'Admin',
      },
    });

    console.log('✔ Admin istifadəçisi hazırdır.');
    console.log(`  Email: ${email}`);
    console.log(`  Şifrə: ${password}`);
    console.log(`  User ID: ${user.id}`);
    console.log(
      '\nİndi POST /auth/login ilə bu email/şifrə ilə daxil ola bilərsiniz.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Gözlənilməz xəta:', error);
  process.exit(1);
});
