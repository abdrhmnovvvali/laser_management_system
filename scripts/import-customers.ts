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
  let sql = fs.readFileSync(sqlPath, 'utf8');

  // Strip standalone BEGIN; and COMMIT; statements so PostgreSQL doesn't fail on prepared statement protocol
  sql = sql.replace(/^\s*BEGIN\s*;\s*$/gim, '').replace(/^\s*COMMIT\s*;\s*$/gim, '').trim();

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
  const totalProcedures = await prisma.procedure.count();
  console.log(`Total customers in database: ${totalCustomers}`);
  console.log(`Total procedures (visits) in database: ${totalProcedures}`);

  const sampleCustomers = await prisma.customer.findMany({
    take: 5,
    include: {
      _count: {
        select: { procedures: true },
      },
    },
  });

  console.log('\nSample customers with visit counts:');
  for (const c of sampleCustomers) {
    console.log(`- ${c.firstName} ${c.lastName} (${c.phone}): ${c._count.procedures} visits`);
  }
}

main()
  .catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
