import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ZoneDef {
  az: string;
  ru: string;
  en: string;
  price: number;
  /** Seans üçün atış sayı aralığı [min, max] */
  shots?: [number, number];
  /** Seans müddəti aralığı (dəq) [min, max] */
  minutes?: [number, number];
}

function normsData(zoneDef: ZoneDef) {
  return {
    minShots: zoneDef.shots?.[0] ?? null,
    maxShots: zoneDef.shots?.[1] ?? null,
    minDurationMinutes: zoneDef.minutes?.[0] ?? null,
    maxDurationMinutes: zoneDef.minutes?.[1] ?? null,
  };
}

const femaleZones: ZoneDef[] = [
  { az: 'Üz', ru: 'Лицо', en: 'Face', price: 200000, shots: [170, 250], minutes: [5, 10] },
  { az: 'Alın', ru: 'Лоб', en: 'Forehead', price: 100000, shots: [70, 120], minutes: [3, 5] },
  { az: 'Qaşarası', ru: 'Монобровь', en: 'Unibrow', price: 60000, shots: [8, 12], minutes: [3, 5] },
  { az: 'Bakenbard', ru: 'Баки', en: 'Sideburns', price: 100000, shots: [70, 130], minutes: [3, 7] },
  { az: 'Bığ', ru: 'Усики', en: 'Upper lip', price: 90000, shots: [10, 25], minutes: [3, 5] },
  { az: 'Çənə', ru: 'Подбородок', en: 'Chin', price: 100000, shots: [30, 60], minutes: [5, 7] },
  { az: 'Boyun', ru: 'Шея', en: 'Neck', price: 200000, shots: [150, 300], minutes: [7, 10] },
  { az: 'Yarım boyun', ru: 'Шея половина', en: 'Half neck', price: 100000, shots: [70, 150], minutes: [5, 7] },
  { az: 'Qollar (tam)', ru: 'Руки полностью', en: 'Full arms', price: 450000, shots: [900, 1500], minutes: [15, 25] },
  { az: 'Qollar (yarım)', ru: 'Руки половина', en: 'Half arms', price: 350000, shots: [400, 900], minutes: [10, 20] },
  { az: 'Əl daraqları / barmaqlar', ru: 'Кисти рук', en: 'Hands / Fingers', price: 80000, shots: [180, 230], minutes: [10, 10] },
  { az: 'Qoltuqaltı', ru: 'Подмышки', en: 'Underarms', price: 250000, shots: [70, 170], minutes: [5, 7] },
  { az: 'Bütün kürək', ru: 'Спина целиком', en: 'Full back', price: 650000, shots: [1000, 1800], minutes: [20, 25] },
  { az: 'Kürək sümükləri', ru: 'Лопатки', en: 'Shoulder blades', price: 400000 },
  { az: 'Çiyinlər', ru: 'Плечи', en: 'Shoulders', price: 200000 },
  { az: 'Bel', ru: 'Поясница', en: 'Lower back', price: 250000 },
  { az: 'Dekolte', ru: 'Декольте', en: 'Decollete', price: 250000 },
  { az: 'Sinə arası', ru: 'Между грудей', en: 'Between breasts', price: 80000 },
  { az: 'Gilə ətrafı', ru: 'Вокруг сосков', en: 'Areola', price: 80000 },
  { az: 'Sinə', ru: 'Грудь с сосками', en: 'Breasts', price: 250000, shots: [350, 600], minutes: [15, 20] },
  { az: 'Tam qarın', ru: 'Живот полностью', en: 'Full abdomen', price: 270000, shots: [300, 550], minutes: [15, 15] },
  { az: 'Aşağı qarın', ru: 'Живот низ', en: 'Lower abdomen', price: 130000, shots: [150, 270], minutes: [5, 10] },
  { az: 'Yuxarı qarın', ru: 'Живот верх', en: 'Upper abdomen', price: 170000, shots: [130, 250], minutes: [10, 10] },
  { az: 'Ayaqlar (tam)', ru: 'Ноги', en: 'Full legs', price: 650000, shots: [1800, 2200], minutes: [25, 35] },
  { az: 'Ayaqlar (yarım)', ru: 'Ноги половина', en: 'Half legs', price: 400000, shots: [1000, 1500], minutes: [15, 20] },
  { az: 'Sarğı / Yan', ru: 'Ягодицы', en: 'Buttocks', price: 250000, shots: [300, 600], minutes: [15, 15] },
  { az: 'Bikini', ru: 'Бикини', en: 'Bikini', price: 300000, shots: [250, 350], minutes: [10, 15] },
];

const maleZones: ZoneDef[] = [
  { az: 'Ayaqlar tam (Kişi)', ru: 'Ноги полностью (Муж.)', en: 'Full legs (Men)', price: 1000000, shots: [2200, 3000], minutes: [40, 60] },
  { az: 'Ayaqlar yarım (Kişi)', ru: 'Ноги половина (Муж.)', en: 'Half legs (Men)', price: 600000, shots: [1500, 2000], minutes: [20, 35] },
  { az: 'Ayaq barmaqları (Kişi)', ru: 'Пальцы ног (Муж.)', en: 'Toes (Men)', price: 200000, shots: [35, 70], minutes: [10, 10] },
  { az: 'Qollar tam (Kişi)', ru: 'Руки полностью (Муж.)', en: 'Full arms (Men)', price: 600000, shots: [1400, 2000], minutes: [25, 35] },
  { az: 'Qollar yarım (Kişi)', ru: 'Руки половина (Муж.)', en: 'Half arms (Men)', price: 400000, shots: [1000, 1600], minutes: [20, 30] },
  { az: 'Əl barmaqları (Kişi)', ru: 'Пальцы рук (Муж.)', en: 'Fingers (Men)', price: 200000, shots: [25, 50], minutes: [5, 10] },
  { az: 'Bikini (Kişi)', ru: 'Бикини (Муж.)', en: 'Bikini (Men)', price: 600000, shots: [300, 400], minutes: [15, 15] },
  { az: 'Bel (Kişi)', ru: 'Поясница (Муж.)', en: 'Lower back (Men)', price: 400000, shots: [450, 700], minutes: [15, 20] },
  { az: 'Sarğı (Kişi)', ru: 'Ягодицы (Муж.)', en: 'Buttocks (Men)', price: 500000, shots: [500, 750], minutes: [15, 15] },
  { az: 'Beldən yuxarı kürək (Kişi)', ru: 'Спина до поясницы (Муж.)', en: 'Upper back (Men)', price: 600000, shots: [1500, 1800], minutes: [25, 25] },
  { az: 'Bütün kürək (Kişi)', ru: 'Спина общая (Муж.)', en: 'Full back (Men)', price: 750000, shots: [1600, 2200], minutes: [30, 40] },
  { az: 'Çiyinlər (Kişi)', ru: 'Плечи (Муж.)', en: 'Shoulders (Men)', price: 450000, shots: [350, 500], minutes: [15, 15] },
  { az: 'Qoltuqaltı (Kişi)', ru: 'Подмышки (Муж.)', en: 'Underarms (Men)', price: 300000, shots: [100, 200], minutes: [5, 5] },
  { az: 'Tam boyun (Kişi)', ru: 'Шея полностью (Муж.)', en: 'Full neck (Men)', price: 400000, shots: [350, 500], minutes: [10, 10] },
  { az: 'Yarım boyun (Kişi)', ru: 'Шея половина (Муж.)', en: 'Half neck (Men)', price: 200000, shots: [250, 300], minutes: [5, 5] },
  { az: 'Üz (Kişi)', ru: 'Лицо (Муж.)', en: 'Face (Men)', price: 500000, shots: [300, 500], minutes: [10, 10] },
  { az: 'Alın (Kişi)', ru: 'Лоб (Муж.)', en: 'Forehead (Men)', price: 200000, shots: [100, 150], minutes: [5, 5] },
  { az: 'Bığ (Kişi)', ru: 'Усики (Муж.)', en: 'Mustache (Men)', price: 200000, shots: [50, 80], minutes: [5, 5] },
  { az: 'Qaşarası (Kişi)', ru: 'Межбrovье (Муж.)', en: 'Unibrow (Men)', price: 100000, shots: [15, 25], minutes: [3, 3] },
  { az: 'Çənə (Kişi)', ru: 'Подбородок (Муж.)', en: 'Chin (Men)', price: 200000, shots: [130, 200], minutes: [5, 5] },
  { az: 'Yanaqlar (Kişi)', ru: 'Щёки (Муж.)', en: 'Cheeks (Men)', price: 300000, shots: [150, 200], minutes: [10, 10] },
  { az: 'Tam qarın (Kişi)', ru: 'Живот полностью (Муж.)', en: 'Full abdomen (Men)', price: 500000, shots: [450, 600], minutes: [15, 15] },
  { az: 'Göbəyə qədər qarın (Kişi)', ru: 'Живот от лобка до пупка (Муж.)', en: 'Lower abdomen to navel (Men)', price: 250000, shots: [350, 500], minutes: [10, 13] },
  { az: 'Köksə qədər qarın (Kişi)', ru: 'Живот от лобка до груди (Муж.)', en: 'Abdomen to chest (Men)', price: 250000, shots: [350, 500], minutes: [10, 13] },
  { az: 'Sinə arası (Kişi)', ru: 'Между грудей (Муж.)', en: 'Between chest (Men)', price: 250000, shots: [200, 350], minutes: [10, 10] },
  { az: 'Sinə (Kişi)', ru: 'Грудь (Муж.)', en: 'Chest (Men)', price: 600000, shots: [600, 1100], minutes: [15, 20] },
  { az: 'Gilə ətrafı (Kişi)', ru: 'Ареолы (Муж.)', en: 'Areola (Men)', price: 150000, shots: [100, 130], minutes: [5, 5] },
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
        data: { price: zoneDef.price, ...normsData(zoneDef) },
      });
    } else {
      await prisma.zone.create({
        data: {
          deviceId,
          price: zoneDef.price,
          ...normsData(zoneDef),
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
