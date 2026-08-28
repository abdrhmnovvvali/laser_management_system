import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ZoneDef {
  az: string;
  ru: string;
  en: string;
  price: number;
}

// 1. Qadın / Ümumi qiymətlər (Doctor Laser & Laser N1)
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

// 2. Kişi qiymətləri (Наш прайс Мужской)
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
  { az: 'Qaşarası (Kişi)', ru: 'Межбровье (Муж.)', en: 'Unibrow (Men)', price: 100000 },
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

async function main() {
  console.log('--- Seeding Devices & Zones ---');

  // 1. Fetch all branches
  const branches = await prisma.branch.findMany({
    include: {
      translations: true,
      devices: {
        include: {
          translations: true,
        },
      },
    },
  });

  if (branches.length === 0) {
    console.log('No branches found. Please create branches first.');
    return;
  }

  for (const branch of branches) {
    const branchName =
      branch.translations.find((t) => t.locale === 'az')?.name ||
      branch.translations[0]?.name ||
      branch.id;
    console.log(`\nProcessing branch: "${branchName}" (${branch.id})`);

    let devices = branch.devices;

    // If branch has no devices, create default laser device
    if (devices.length === 0) {
      console.log(`Creating default device for branch "${branchName}"...`);
      const createdDevice = await prisma.device.create({
        data: {
          branchId: branch.id,
          translations: {
            create: [
              { locale: 'az', type: 'Lazer Cihazı' },
              { locale: 'ru', type: 'Лазерный аппарат' },
              { locale: 'en', type: 'Laser Device' },
            ],
          },
        },
        include: {
          translations: true,
        },
      });
      devices = [createdDevice];
    }

    // For each device in this branch, add or update zones
    for (const device of devices) {
      const deviceType =
        device.translations.find((t) => t.locale === 'az')?.type ||
        device.translations[0]?.type ||
        'Lazer';
      console.log(`  Adding/Updating zones for Device: "${deviceType}" (${device.id})`);

      for (const zoneDef of allZonesToAdd) {
        // Check if zone with this Russian name already exists for this device
        const existingZoneTranslation = await prisma.zoneTranslation.findFirst({
          where: {
            name: zoneDef.ru,
            zone: {
              deviceId: device.id,
            },
          },
          include: {
            zone: true,
          },
        });

        if (existingZoneTranslation) {
          // Update price if different
          await prisma.zone.update({
            where: { id: existingZoneTranslation.zoneId },
            data: { price: zoneDef.price },
          });
        } else {
          // Create new zone with 3 translations
          await prisma.zone.create({
            data: {
              deviceId: device.id,
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
      console.log(`    ✓ ${allZonesToAdd.length} zones synchronized.`);
    }
  }

  const totalZones = await prisma.zone.count();
  console.log(`\nDone! Total zones in system: ${totalZones}`);
}

main()
  .catch((err) => {
    console.error('Zone seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
