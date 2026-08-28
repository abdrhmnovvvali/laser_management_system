import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ZoneDef {
  az: string;
  ru: string;
  en: string;
  price: number;
}

const femaleZones: ZoneDef[] = [
  { az: 'Üz', ru: 'Лицо', en: 'Face', price: 200000 },
  { az: 'Alın', ru: 'Лоб', en: 'Forehead', price: 100000 },
  { az: 'Qaşarası', ru: 'Монобровь', en: 'Unibrow', price: 60000 },
  { az: 'Bakenbard', ru: 'Баки', en: 'Sideburns', price: 100000 },
  { az: 'Bığ', ru: 'Усики', en: 'Upper lip', price: 90000 },
  { az: 'Çənə', ru: 'Подбородок', en: 'Chin', price: 100000 },
  { az: 'Boyun', ru: 'Шея', en: 'Neck', price: 200000 },
  { az: 'Yarım boyun', ru: 'Шея половина', en: 'Half neck', price: 100000 },
  { az: 'Qollar (tam)', ru: 'Руки полностью', en: 'Full arms', price: 450000 },
  { az: 'Qollar (yarım)', ru: 'Руки половина', en: 'Half arms', price: 350000 },
  { az: 'Əl daraqları / barmaqlar', ru: 'Кисти рук', en: 'Hands / Fingers', price: 80000 },
  { az: 'Qoltuqaltı', ru: 'Подмышки', en: 'Underarms', price: 250000 },
  { az: 'Bütün kürək', ru: 'Спина целиком', en: 'Full back', price: 650000 },
  { az: 'Kürək sümükləri', ru: 'Лопатки', en: 'Shoulder blades', price: 400000 },
  { az: 'Çiyinlər', ru: 'Плечи', en: 'Shoulders', price: 200000 },
  { az: 'Bel', ru: 'Поясница', en: 'Lower back', price: 250000 },
  { az: 'Dekolte', ru: 'Декольте', en: 'Decollete', price: 250000 },
  { az: 'Sinə arası', ru: 'Между грудей', en: 'Between breasts', price: 80000 },
  { az: 'Gilə ətrafı', ru: 'Вокруг сосков', en: 'Areola', price: 80000 },
  { az: 'Sinə', ru: 'Грудь с сосками', en: 'Breasts', price: 250000 },
  { az: 'Tam qarın', ru: 'Живот полностью', en: 'Full abdomen', price: 270000 },
  { az: 'Aşağı qarın', ru: 'Живот низ', en: 'Lower abdomen', price: 130000 },
  { az: 'Yuxarı qarın', ru: 'Живот верх', en: 'Upper abdomen', price: 170000 },
  { az: 'Ayaqlar (tam)', ru: 'Ноги', en: 'Full legs', price: 650000 },
  { az: 'Ayaqlar (yarım)', ru: 'Ноги половина', en: 'Half legs', price: 400000 },
  { az: 'Sarğı / Yan', ru: 'Ягодицы', en: 'Buttocks', price: 250000 },
  { az: 'Bikini', ru: 'Бикини', en: 'Bikini', price: 300000 },
];

const maleZones: ZoneDef[] = [
  { az: 'Ayaqlar tam (Kişi)', ru: 'Ноги полностью (Муж.)', en: 'Full legs (Men)', price: 1000000 },
  { az: 'Ayaqlar yarım (Kişi)', ru: 'Ноги половина (Муж.)', en: 'Half legs (Men)', price: 600000 },
  { az: 'Ayaq barmaqları (Kişi)', ru: 'Пальцы ног (Муж.)', en: 'Toes (Men)', price: 200000 },
  { az: 'Qollar tam (Kişi)', ru: 'Руки полностью (Муж.)', en: 'Full arms (Men)', price: 600000 },
  { az: 'Qollar yarım (Kişi)', ru: 'Руки половина (Муж.)', en: 'Half arms (Men)', price: 400000 },
  { az: 'Əl barmaqları (Kişi)', ru: 'Пальцы рук (Муж.)', en: 'Fingers (Men)', price: 200000 },
  { az: 'Bikini (Kişi)', ru: 'Бикини (Муж.)', en: 'Bikini (Men)', price: 600000 },
  { az: 'Bel (Kişi)', ru: 'Поясница (Муж.)', en: 'Lower back (Men)', price: 400000 },
  { az: 'Sarğı (Kişi)', ru: 'Ягодицы (Муж.)', en: 'Buttocks (Men)', price: 500000 },
  { az: 'Beldən yuxarı kürək (Kişi)', ru: 'Спина до поясницы (Муж.)', en: 'Upper back (Men)', price: 600000 },
  { az: 'Bütün kürək (Kişi)', ru: 'Спина общая (Муж.)', en: 'Full back (Men)', price: 750000 },
  { az: 'Çiyinlər (Kişi)', ru: 'Плечи (Муж.)', en: 'Shoulders (Men)', price: 450000 },
  { az: 'Qoltuqaltı (Kişi)', ru: 'Подмышки (Муж.)', en: 'Underarms (Men)', price: 300000 },
  { az: 'Tam boyun (Kişi)', ru: 'Шея полностью (Муж.)', en: 'Full neck (Men)', price: 400000 },
  { az: 'Yarım boyun (Kişi)', ru: 'Шея половина (Муж.)', en: 'Half neck (Men)', price: 200000 },
  { az: 'Üz (Kişi)', ru: 'Лицо (Муж.)', en: 'Face (Men)', price: 500000 },
  { az: 'Alın (Kişi)', ru: 'Лоб (Муж.)', en: 'Forehead (Men)', price: 200000 },
  { az: 'Bığ (Kişi)', ru: 'Усики (Муж.)', en: 'Mustache (Men)', price: 200000 },
  { az: 'Qaşarası (Kişi)', ru: 'Межбrovье (Муж.)', en: 'Unibrow (Men)', price: 100000 },
  { az: 'Çənə (Kişi)', ru: 'Подбородок (Муж.)', en: 'Chin (Men)', price: 200000 },
  { az: 'Yanaqlar (Kişi)', ru: 'Щёки (Муж.)', en: 'Cheeks (Men)', price: 300000 },
  { az: 'Tam qarın (Kişi)', ru: 'Живот полностью (Муж.)', en: 'Full abdomen (Men)', price: 500000 },
  { az: 'Göbəyə qədər qarın (Kişi)', ru: 'Живот от лобка до пупка (Муж.)', en: 'Lower abdomen to navel (Men)', price: 250000 },
  { az: 'Köksə qədər qarın (Kişi)', ru: 'Живот от лобка до груди (Муж.)', en: 'Abdomen to chest (Men)', price: 250000 },
  { az: 'Sinə arası (Kişi)', ru: 'Между грудей (Муж.)', en: 'Between chest (Men)', price: 250000 },
  { az: 'Sinə (Kişi)', ru: 'Грудь (Муж.)', en: 'Chest (Men)', price: 600000 },
  { az: 'Gilə ətrafı (Kişi)', ru: 'Ареолы (Муж.)', en: 'Areola (Men)', price: 150000 },
];

const allZonesToAdd: ZoneDef[] = [...femaleZones, ...maleZones];

async function syncZonesForDevice(deviceId: string) {
  for (const zoneDef of allZonesToAdd) {
    const existingZoneTranslation = await prisma.zoneTranslation.findFirst({
      where: {
        name: zoneDef.ru,
        zone: { deviceId },
      },
    });

    if (existingZoneTranslation) {
      await prisma.zone.update({
        where: { id: existingZoneTranslation.zoneId },
        data: { price: zoneDef.price },
      });
    } else {
      await prisma.zone.create({
        data: {
          deviceId,
          price: zoneDef.price,
          translations: {
            create: [
              { locale: 'az', name: zoneDef.az },
              { locale: 'ru', name: zoneDef.ru },
              { locale: 'en', name: zoneDef.en },
            ],
          },
        },
      });
    }
  }
}

async function main() {
  console.log('--- Setting up Branches, Devices & Zones ---');

  // ==========================================
  // 1. Daşkənd Filialı -> "Doctor laser"
  // ==========================================
  let daskentBranch = await prisma.branch.findFirst({
    where: {
      translations: {
        some: {
          name: {
            contains: 'Daşkənd',
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      translations: true,
      devices: { include: { translations: true } },
    },
  });

  if (!daskentBranch) {
    // Try finding by any Daskent or Doctor laser
    daskentBranch = await prisma.branch.findFirst({
      where: {
        translations: {
          some: {
            name: {
              contains: 'Daskent',
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        translations: true,
        devices: { include: { translations: true } },
      },
    });
  }

  if (!daskentBranch) {
    console.log('Creating Daşkənd branch (Doctor laser)...');
    daskentBranch = await prisma.branch.create({
      data: {
        translations: {
          create: [
            { locale: 'az', name: 'Doctor laser', address: 'Дархан, Ниёзбек Йули 8' },
            { locale: 'ru', name: 'Doctor laser', address: 'Дархан, Ниёзбек Йули 8' },
            { locale: 'en', name: 'Doctor laser', address: 'Darkhan, Niyozbek Yuli 8' },
          ],
        },
      },
      include: {
        translations: true,
        devices: { include: { translations: true } },
      },
    });
  } else {
    console.log(`Updating Daşkənd branch name to "Doctor laser"... (ID: ${daskentBranch.id})`);
    for (const locale of ['az', 'ru', 'en'] as const) {
      await prisma.branchTranslation.upsert({
        where: { branchId_locale: { branchId: daskentBranch.id, locale } },
        update: { name: 'Doctor laser', address: 'Дархан, Ниёзбек Йули 8' },
        create: { branchId: daskentBranch.id, locale, name: 'Doctor laser', address: 'Дархан, Ниёзбек Йули 8' },
      });
    }
  }

  // Daşkənd Devices: Candela Pro U və Deka
  const daskentDeviceNames = ['Candela Pro U', 'Deka'];
  for (const devName of daskentDeviceNames) {
    let dev = await prisma.device.findFirst({
      where: {
        branchId: daskentBranch.id,
        translations: {
          some: { type: { equals: devName, mode: 'insensitive' } },
        },
      },
      include: { translations: true },
    });

    if (!dev) {
      // If there is an existing un-named or placeholder device in Daşkənd branch
      const unrenamedDev = await prisma.device.findFirst({
        where: {
          branchId: daskentBranch.id,
          translations: {
            none: { type: { in: daskentDeviceNames } },
          },
        },
      });

      if (unrenamedDev) {
        console.log(`Renaming existing device in Daşkənd to "${devName}" (ID: ${unrenamedDev.id})...`);
        for (const locale of ['az', 'ru', 'en'] as const) {
          await prisma.deviceTranslation.upsert({
            where: { deviceId_locale: { deviceId: unrenamedDev.id, locale } },
            update: { type: devName },
            create: { deviceId: unrenamedDev.id, locale, type: devName },
          });
        }
        dev = await prisma.device.findUnique({
          where: { id: unrenamedDev.id },
          include: { translations: true },
        });
      } else {
        console.log(`Creating new device in Daşkənd: "${devName}"...`);
        dev = await prisma.device.create({
          data: {
            branchId: daskentBranch.id,
            translations: {
              create: [
                { locale: 'az', type: devName },
                { locale: 'ru', type: devName },
                { locale: 'en', type: devName },
              ],
            },
          },
          include: { translations: true },
        });
      }
    }

    if (dev) {
      console.log(`  Syncing 54 zones for Daşkənd device: "${devName}"...`);
      await syncZonesForDevice(dev.id);
    }
  }

  // ==========================================
  // 2. Səmərqənd Filialı -> "Laser N1"
  // ==========================================
  let semerqendBranch = await prisma.branch.findFirst({
    where: {
      translations: {
        some: {
          name: {
            contains: 'Səmərqənd',
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      translations: true,
      devices: { include: { translations: true } },
    },
  });

  if (!semerqendBranch) {
    semerqendBranch = await prisma.branch.findFirst({
      where: {
        translations: {
          some: {
            name: {
              contains: 'Semerqend',
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        translations: true,
        devices: { include: { translations: true } },
      },
    });
  }

  if (!semerqendBranch) {
    console.log('Creating Səmərqənd branch (Laser N1)...');
    semerqendBranch = await prisma.branch.create({
      data: {
        translations: {
          create: [
            { locale: 'az', name: 'Laser N1', address: 'Гагарина, дом 81' },
            { locale: 'ru', name: 'Laser N1', address: 'Гагарина, дом 81' },
            { locale: 'en', name: 'Laser N1', address: 'Gagarina, house 81' },
          ],
        },
      },
      include: {
        translations: true,
        devices: { include: { translations: true } },
      },
    });
  } else {
    console.log(`Updating Səmərqənd branch name to "Laser N1"... (ID: ${semerqendBranch.id})`);
    for (const locale of ['az', 'ru', 'en'] as const) {
      await prisma.branchTranslation.upsert({
        where: { branchId_locale: { branchId: semerqendBranch.id, locale } },
        update: { name: 'Laser N1', address: 'Гагарина, дом 81' },
        create: { branchId: semerqendBranch.id, locale, name: 'Laser N1', address: 'Гагарина, дом 81' },
      });
    }
  }

  // Səmərqənd Device: Candela Pro U
  const semerqendDeviceName = 'Candela Pro U';
  let sDev = await prisma.device.findFirst({
    where: {
      branchId: semerqendBranch.id,
      translations: {
        some: { type: { equals: semerqendDeviceName, mode: 'insensitive' } },
      },
    },
    include: { translations: true },
  });

  if (!sDev) {
    const unrenamedDev = await prisma.device.findFirst({
      where: { branchId: semerqendBranch.id },
    });

    if (unrenamedDev) {
      console.log(`Renaming existing device in Səmərqənd to "${semerqendDeviceName}" (ID: ${unrenamedDev.id})...`);
      for (const locale of ['az', 'ru', 'en'] as const) {
        await prisma.deviceTranslation.upsert({
          where: { deviceId_locale: { deviceId: unrenamedDev.id, locale } },
          update: { type: semerqendDeviceName },
          create: { deviceId: unrenamedDev.id, locale, type: semerqendDeviceName },
        });
      }
      sDev = await prisma.device.findUnique({
        where: { id: unrenamedDev.id },
        include: { translations: true },
      });
    } else {
      console.log(`Creating new device in Səmərqənd: "${semerqendDeviceName}"...`);
      sDev = await prisma.device.create({
        data: {
          branchId: semerqendBranch.id,
          translations: {
            create: [
              { locale: 'az', type: semerqendDeviceName },
              { locale: 'ru', type: semerqendDeviceName },
              { locale: 'en', type: semerqendDeviceName },
            ],
          },
        },
        include: { translations: true },
      });
    }
  }

  if (sDev) {
    console.log(`  Syncing 54 zones for Səmərqənd device: "${semerqendDeviceName}"...`);
    await syncZonesForDevice(sDev.id);
  }

  console.log('\n--- Status Summary ---');
  const allBranches = await prisma.branch.findMany({
    include: {
      translations: true,
      devices: {
        include: {
          translations: true,
          _count: { select: { zones: true } },
        },
      },
    },
  });

  for (const b of allBranches) {
    const bName = b.translations.find((t) => t.locale === 'az')?.name || b.id;
    console.log(`Branch: "${bName}" (${b.id})`);
    for (const d of b.devices) {
      const dName = d.translations.find((t) => t.locale === 'az')?.type || d.id;
      console.log(`   └─ Device: "${dName}" (Zones count: ${d._count.zones})`);
    }
  }

  console.log('\nDone successfully!');
}

main()
  .catch((err) => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
