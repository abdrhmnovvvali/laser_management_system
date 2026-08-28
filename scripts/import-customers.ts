import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.resolve(__dirname, 'import_customers.sql');
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`import_customers.sql not found at ${sqlPath}`);
  }

  console.log('Reading SQL file...');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Executing customer import transaction...');
  await prisma.$executeRawUnsafe(sql);

  console.log('--- Import Verification ---');
  const branches = await prisma.branch.findMany({
    include: {
      translations: true,
      _count: {
        select: { customers: true },
      },
    },
  });

  for (const b of branches) {
    const name = b.translations.find((t) => t.locale === 'az')?.name || b.translations[0]?.name || 'Unknown';
    console.log(`Branch: ${name} (ID: ${b.id}) -> Total Customers: ${b._count.customers}`);
  }

  const totalCustomers = await prisma.customer.count();
  console.log(`Total customers in database: ${totalCustomers}`);
}

main()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
