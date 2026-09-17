/**
 * Excel bazasından müştəri + vizit (prosedur) importu.
 *
 * Nə edir:
 *   1. Excel-dəki hər sətri bir "vizit" kimi oxuyur (ad, telefon, tarix, zonalar, atış sayı, qiymət).
 *   2. Eyni müştərini telefon nömrəsi (nömrə yoxdursa ad) üzrə birləşdirir.
 *   3. Müştərini yaradır/tapır və `visit_count` sahəsini həmin müştərinin cəmi vizit sayı ilə yeniləyir.
 *   4. Hər vizit üçün `procedures` sətri yaradır ki, "hansı tarixlərdə gəlib" tarixçəsi və
 *      "təkrar vizit vaxtı gəldi" xəbərdarlığı işləsin.
 *
 * İstifadə (serverdə):
 *   node scripts/import-visits.js "/path/Fərman baza (1) (2).xlsx"
 *   node scripts/import-visits.js "<fayl>" --dry-run      → bazaya yazmır, yalnız hesabat verir
 *   node scripts/import-visits.js "<fayl>" --no-zones     → prosedur-zona bağlantısı qurmur
 *   node scripts/import-visits.js "<fayl>" --no-price     → qiymətləri 0 kimi yazır
 *
 * Təkrar icra təhlükəsizdir (idempotent): eyni müştəri + eyni tarix + eyni cihaz üçün
 * artıq mövcud olan prosedurlar yenidən yaradılmır.
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');

/** seed-admin.ts-dəki kimi: PrismaClient yaradılmazdan əvvəl .env oxunur. */
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

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

loadEnvFile();

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// KONFİQURASİYA — Excel vərəqləri ilə filial/cihaz uyğunluğu
// ---------------------------------------------------------------------------

const BRANCHES = {
  DASKENT: {
    name: 'Doctor laser',
    address: 'Дархан, Ниёзбек Йули 8',
    matches: ['Daşkənd', 'Daskent', 'Doctor laser'],
  },
  SEMERQEND: {
    name: 'Laser N1',
    address: 'Гагарина, дом 81',
    matches: ['Səmərqənd', 'Semerqend', 'Laser N1'],
  },
};

/**
 * Excel blokları. Sütun nömrələri ExcelJS-dəki kimi 1-dən başlayır.
 * `priceMultiplier`: 10761 vərəqində qiymətlər min-lə yazılıb (350 → 350 000),
 * 1245 vərəqində isə tam məbləğdir ("800.000" → 800 000).
 */
const SOURCES = [
  {
    label: 'Vərəq "10761"',
    sheet: '10761',
    branch: 'DASKENT',
    device: 'Candela Pro U',
    startRow: 1,
    columns: { name: 3, phone: 4, zones: 6, date: 7, shots: 9, price: 10 },
    priceMultiplier: 1000,
  },
  {
    label: 'Vərəq "1245 Pro"',
    sheet: '1245 Pro',
    branch: 'SEMERQEND',
    device: 'Candela Pro U',
    startRow: 4,
    columns: { name: 3, phone: 4, zones: 6, date: 7, shots: 9, price: 10 },
    priceMultiplier: 1,
  },
  {
    label: 'Vərəq "Лист1" — Pro U 10761 bloku',
    sheet: 'Лист1',
    branch: 'DASKENT',
    device: 'Candela Pro U',
    startRow: 3,
    columns: { name: 2, phone: 3, date: 4 },
    priceMultiplier: 1,
  },
  {
    label: 'Vərəq "Лист1" — Pro 1245 bloku',
    sheet: 'Лист1',
    branch: 'SEMERQEND',
    device: 'Candela Pro U',
    startRow: 3,
    columns: { name: 6, phone: 7, date: 8 },
    priceMultiplier: 1,
  },
  {
    // Qeyd: Deka cihazı seed-zones.ts-də Daşkənd filialına yaradılır, amma bu Excel-dəki
    // Deka bloku əvvəlki importda (generate-customer-sql.js) Səmərqəndə yazılıb —
    // müştərilərin ikiləşməməsi üçün həmin seçim saxlanılıb. Lazım gələrsə burdan dəyiş.
    label: 'Vərəq "Лист1" — Deka bloku',
    sheet: 'Лист1',
    branch: 'SEMERQEND',
    device: 'Deka',
    startRow: 3,
    columns: { name: 10, phone: 11, date: 12 },
    priceMultiplier: 1,
  },
];

/** Excel-dəki sərbəst zona adları → bazadakı rəsmi (az) zona adları. */
const ZONE_ALIASES = {
  üz: 'Üz',
  uz: 'Üz',
  alın: 'Alın',
  alin: 'Alın',
  bığ: 'Bığ',
  'bığ nahiyəsi': 'Bığ',
  bıg: 'Bığ',
  çənə: 'Çənə',
  'çənə alti': 'Çənə',
  'çənə altı': 'Çənə',
  çənəalti: 'Çənə',
  bak: 'Bakenbard',
  bakenbard: 'Bakenbard',
  bakinbord: 'Bakenbard',
  boyun: 'Boyun',
  'boyun 1/2': 'Yarım boyun',
  yarımboyun: 'Yarım boyun',
  'yarım boyun': 'Yarım boyun',
  qolaltı: 'Qoltuqaltı',
  qolalti: 'Qoltuqaltı',
  'qol altı': 'Qoltuqaltı',
  qoltuqaltı: 'Qoltuqaltı',
  qoltuqalti: 'Qoltuqaltı',
  qol: 'Qollar (tam)',
  qollar: 'Qollar (tam)',
  'qol 1/2': 'Qollar (yarım)',
  yarımqol: 'Qollar (yarım)',
  'yarım qol': 'Qollar (yarım)',
  əl: 'Əl daraqları / barmaqlar',
  'əl üstü': 'Əl daraqları / barmaqlar',
  ayaq: 'Ayaqlar (tam)',
  ayaqlar: 'Ayaqlar (tam)',
  'ayaq 1/2': 'Ayaqlar (yarım)',
  yarımayaq: 'Ayaqlar (yarım)',
  'yarım ayaq': 'Ayaqlar (yarım)',
  bikini: 'Bikini',
  qarın: 'Tam qarın',
  qarin: 'Tam qarın',
  'aşağı qarın': 'Aşağı qarın',
  'yuxarı qarın': 'Yuxarı qarın',
  bel: 'Bel',
  'aşağı bel': 'Bel',
  sinə: 'Sinə',
  'sinə nahiyəsi': 'Sinə',
  döşətrafı: 'Sinə',
  'döş ətrafı': 'Sinə',
  'sinə ucu': 'Gilə ətrafı',
  gilə: 'Gilə ətrafı',
  dekolte: 'Dekolte',
  kürək: 'Bütün kürək',
  çiyin: 'Çiyinlər',
  çiyinlər: 'Çiyinlər',
  omba: 'Sarğı / Yan',
  popa: 'Sarğı / Yan',
};

const LOCALES = ['az', 'en', 'ru'];
const BATCH_SIZE = 500;

// ---------------------------------------------------------------------------
// Köməkçi funksiyalar
// ---------------------------------------------------------------------------

function cleanPhone(raw) {
  if (raw === null || raw === undefined) return '';
  let str = String(raw).trim().replace(/[\s\-()+.]/g, '');
  if (!str || /^(-|null|undefined)$/i.test(str)) return '';
  if (!/^\d+$/.test(str)) return '';
  if (str.length < 7 || str.length > 15) return '';
  if (str.length === 9) str = `998${str}`;
  return str;
}

function parseFullName(raw) {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim().replace(/\s+/g, ' ');
  if (!str || /^(-|null|undefined)$/i.test(str)) return null;
  const parts = str.split(' ');
  if (parts.length === 1) return { firstName: parts[0], lastName: '-' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

/** Excel tarix seriyası (və ya Date/mətn) → UTC gecəyarısı Date. */
function parseDate(raw) {
  if (raw === null || raw === undefined || raw === '') return null;

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return toUtcMidnight(raw);
  }

  const numeric = Number(String(raw).trim());
  if (Number.isFinite(numeric) && numeric > 20000 && numeric < 60000) {
    // Excel seriyası: 1899-12-30 bazası
    const ms = Date.UTC(1899, 11, 30) + Math.floor(numeric) * 86400000;
    return new Date(ms);
  }

  const parsed = new Date(String(raw).trim());
  if (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() > 2000 &&
    parsed.getFullYear() < 2100
  ) {
    return toUtcMidnight(parsed);
  }

  return null;
}

function toUtcMidnight(date) {
  // ExcelJS tarixləri UTC-də qaytarır — serverin saat qurşağından asılı olmamaq üçün UTC oxunur.
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

/** Bəzi xanalarda bir neçə dəyər alt-alta yazılıb — yalnız birinci sətir götürülür. */
function firstLine(raw) {
  if (raw === null || raw === undefined) return '';
  return String(raw).split('\n')[0].trim();
}

function parseInteger(raw) {
  const text = firstLine(raw);
  if (!text) return 0;
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const value = Number(digits);
  return Number.isFinite(value) ? value : 0;
}

/** "800.000" → 800000, "350" (×1000) → 350000 */
function parsePrice(raw, multiplier) {
  const text = firstLine(raw).replace(/\s/g, '');
  if (!text) return 0;
  const value = Number(text.replace(/[^\d]/g, ''));
  if (!Number.isFinite(value) || value <= 0) return 0;
  // Nöqtə/vergüllə yazılan məbləğ (800.000) artıq tam məbləğdir — vurmaya ehtiyac yoxdur.
  const alreadyFull = /[.,]\d{3}(?!\d)/.test(text);
  return alreadyFull ? value : value * multiplier;
}

function cellText(row, column) {
  if (!column) return '';
  const value = row.getCell(column).value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value instanceof Date) return value;
    if (value.text !== undefined) return String(value.text);
    if (value.result !== undefined) return String(value.result);
    if (value.richText) return value.richText.map((part) => part.text).join('');
    return '';
  }
  return value;
}

function normalizeZoneToken(token) {
  return token
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.;]/g, '')
    .trim();
}

function chunk(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

// ---------------------------------------------------------------------------
// 1. Excel oxunuşu
// ---------------------------------------------------------------------------

async function readVisits(filePath, options) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const visits = [];
  const unknownZones = new Map();
  let skippedRows = 0;

  for (const source of SOURCES) {
    const sheet = workbook.getWorksheet(source.sheet);

    if (!sheet) {
      console.warn(`  ! Vərəq tapılmadı: "${source.sheet}" (${source.label})`);
      continue;
    }

    let sourceCount = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < source.startRow) return;

      const name = parseFullName(cellText(row, source.columns.name));
      const phone = cleanPhone(cellText(row, source.columns.phone));

      if (!name && !phone) {
        return;
      }

      const date = parseDate(cellText(row, source.columns.date));
      if (!date) {
        skippedRows += 1;
        return;
      }

      const zoneNames = [];
      if (!options.noZones && source.columns.zones) {
        const rawZones = String(cellText(row, source.columns.zones) || '');
        for (const part of rawZones.split(/[,\n/]+/)) {
          const token = normalizeZoneToken(part);
          if (!token) continue;
          const mapped = ZONE_ALIASES[token];
          if (mapped) {
            if (!zoneNames.includes(mapped)) zoneNames.push(mapped);
          } else {
            unknownZones.set(token, (unknownZones.get(token) ?? 0) + 1);
          }
        }
      }

      const shots = parseInteger(cellText(row, source.columns.shots));
      const price = options.noPrice
        ? 0
        : parsePrice(cellText(row, source.columns.price), source.priceMultiplier);

      visits.push({
        branch: source.branch,
        device: source.device,
        firstName: name ? name.firstName : 'Müştəri',
        lastName: name ? name.lastName : '-',
        phone,
        date,
        zoneNames,
        shots,
        price,
      });

      sourceCount += 1;
    });

    console.log(`  • ${source.label}: ${sourceCount} vizit sətri`);
  }

  if (skippedRows > 0) {
    console.log(`  • Tarixi oxunmayan ${skippedRows} sətir buraxıldı`);
  }

  return { visits, unknownZones };
}

/** Vizitləri müştəri üzrə qruplaşdırır: açar = filial + telefon (telefon yoxdursa ad). */
function groupByCustomer(visits) {
  const customers = new Map();

  for (const visit of visits) {
    const identity = visit.phone
      ? `P:${visit.phone}`
      : `N:${visit.firstName.toLowerCase()} ${visit.lastName.toLowerCase()}`;
    const key = `${visit.branch}|${identity}`;

    let customer = customers.get(key);

    if (!customer) {
      customer = {
        key,
        branch: visit.branch,
        firstName: visit.firstName,
        lastName: visit.lastName,
        phone: visit.phone ? `+${visit.phone}` : null,
        visits: [],
      };
      customers.set(key, customer);
    }

    // Adı "Müştəri" olan sətir sonradan real adla əvəzlənsin.
    if (customer.firstName === 'Müştəri' && visit.firstName !== 'Müştəri') {
      customer.firstName = visit.firstName;
      customer.lastName = visit.lastName;
    }

    customer.visits.push(visit);
  }

  for (const customer of customers.values()) {
    customer.visits.sort((a, b) => a.date - b.date);
  }

  return [...customers.values()];
}

// ---------------------------------------------------------------------------
// 2. Filial / cihaz / zona hazırlığı
// ---------------------------------------------------------------------------

async function ensureBranch(config) {
  const existing = await prisma.branchTranslation.findFirst({
    where: { OR: config.matches.map((name) => ({ name: { contains: name, mode: 'insensitive' } })) },
  });

  if (existing) {
    return existing.branchId;
  }

  const branch = await prisma.branch.create({
    data: {
      translations: {
        create: LOCALES.map((locale) => ({
          locale,
          name: config.name,
          address: config.address,
        })),
      },
    },
  });

  console.log(`  + Filial yaradıldı: ${config.name}`);
  return branch.id;
}

async function ensureDevice(branchId, deviceName) {
  const existing = await prisma.device.findFirst({
    where: {
      branchId,
      translations: { some: { type: { contains: deviceName, mode: 'insensitive' } } },
    },
  });

  if (existing) {
    return existing.id;
  }

  const fallback = await prisma.device.findFirst({ where: { branchId } });

  if (fallback) {
    console.warn(
      `  ! "${deviceName}" cihazı tapılmadı — bu filialın mövcud cihazı istifadə olunur (${fallback.id})`,
    );
    return fallback.id;
  }

  const device = await prisma.device.create({
    data: {
      branchId,
      translations: { create: LOCALES.map((locale) => ({ locale, type: deviceName })) },
    },
  });

  console.log(`  + Cihaz yaradıldı: ${deviceName}`);
  return device.id;
}

/** Cihazın zonalarını "az" adına görə xəritələyir. */
async function loadZoneMap(deviceId) {
  const zones = await prisma.zone.findMany({
    where: { deviceId },
    select: { id: true, translations: { where: { locale: 'az' }, select: { name: true } } },
  });

  const map = new Map();

  for (const zone of zones) {
    const name = zone.translations[0]?.name;
    if (name) map.set(name.toLowerCase(), zone.id);
  }

  return map;
}

// ---------------------------------------------------------------------------
// 3. Bazaya yazma
// ---------------------------------------------------------------------------

async function upsertCustomer(customer, branchId) {
  const where = customer.phone
    ? { branchId, phone: customer.phone }
    : {
        branchId,
        phone: null,
        firstName: customer.firstName,
        lastName: customer.lastName,
      };

  const existing = await prisma.customer.findFirst({ where });
  const registeredAt = customer.visits[0].date;

  if (existing) {
    return { id: existing.id, created: false, registeredAt: existing.registeredAt };
  }

  const created = await prisma.customer.create({
    data: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      branchId,
      registeredAt,
      visitCount: 0,
    },
  });

  return { id: created.id, created: true, registeredAt };
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args.find((arg) => !arg.startsWith('--'));
  const options = {
    dryRun: args.includes('--dry-run'),
    noZones: args.includes('--no-zones'),
    noPrice: args.includes('--no-price'),
  };

  if (!filePath) {
    console.error(
      'İstifadə: node scripts/import-visits.js "<fayl.xlsx>" [--dry-run] [--no-zones] [--no-price]',
    );
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Fayl tapılmadı: ${filePath}`);
    process.exit(1);
  }

  console.log(`\nExcel oxunur: ${filePath}`);
  const { visits, unknownZones } = await readVisits(filePath, options);
  const customers = groupByCustomer(visits);

  console.log(
    `\nCəmi ${visits.length} vizit sətri → ${customers.length} unikal müştəri\n`,
  );

  if (options.dryRun) {
    console.log('--dry-run: bazaya heç nə yazılmadı.');
    reportUnknownZones(unknownZones);
    const top = [...customers].sort((a, b) => b.visits.length - a.visits.length).slice(0, 10);
    console.log('\nƏn çox təkrarlanan 10 müştəri:');
    for (const customer of top) {
      console.log(
        `  ${customer.visits.length.toString().padStart(3)} vizit — ${customer.firstName} ${customer.lastName} (${customer.phone ?? 'nömrəsiz'})`,
      );
    }
    return;
  }

  console.log('Filial və cihazlar hazırlanır...');
  const branchIds = {};
  for (const [key, config] of Object.entries(BRANCHES)) {
    branchIds[key] = await ensureBranch(config);
  }

  const deviceIds = new Map();
  const zoneMaps = new Map();
  for (const source of SOURCES) {
    const deviceKey = `${source.branch}|${source.device}`;
    if (deviceIds.has(deviceKey)) continue;
    const deviceId = await ensureDevice(branchIds[source.branch], source.device);
    deviceIds.set(deviceKey, deviceId);
    zoneMaps.set(deviceKey, options.noZones ? new Map() : await loadZoneMap(deviceId));
  }

  console.log('\nMüştərilər və vizitlər yazılır...');

  let createdCustomers = 0;
  let updatedCustomers = 0;
  let createdProcedures = 0;
  let skippedProcedures = 0;
  let linkedZones = 0;
  let processed = 0;

  for (const customer of customers) {
    const branchId = branchIds[customer.branch];
    const {
      id: customerId,
      created,
      registeredAt: currentRegisteredAt,
    } = await upsertCustomer(customer, branchId);

    if (created) {
      createdCustomers += 1;
    } else {
      updatedCustomers += 1;
    }

    // Mövcud prosedurlar: eyni gün + eyni cihaz üzrə neçəsi artıq var?
    const existingProcedures = await prisma.procedure.findMany({
      where: { customerId },
      select: { date: true, deviceId: true },
    });

    const existingCounts = new Map();
    for (const procedure of existingProcedures) {
      const key = `${dayKey(procedure.date)}|${procedure.deviceId}`;
      existingCounts.set(key, (existingCounts.get(key) ?? 0) + 1);
    }

    const newProcedures = [];
    let visitNumber = 0;

    for (const visit of customer.visits) {
      visitNumber += 1;
      const deviceKey = `${visit.branch}|${visit.device}`;
      const deviceId = deviceIds.get(deviceKey);
      const key = `${dayKey(visit.date)}|${deviceId}`;
      const remaining = existingCounts.get(key) ?? 0;

      if (remaining > 0) {
        existingCounts.set(key, remaining - 1);
        skippedProcedures += 1;
        continue;
      }

      newProcedures.push({
        customerId,
        deviceId,
        date: visit.date,
        // Fərq 0 olsun ki, tarixi data saxta atış (fraud) kimi işarələnməsin.
        declaredShotCount: visit.shots,
        actualShotCount: visit.shots,
        price: visit.price,
        discountAmount: 0,
        visitNumber,
        zoneIds: (visit.zoneNames ?? [])
          .map((name) => zoneMaps.get(deviceKey)?.get(name.toLowerCase()))
          .filter(Boolean),
      });
    }

    if (newProcedures.length > 0) {
      for (const batch of chunk(newProcedures, BATCH_SIZE)) {
        const rows = await prisma.procedure.createManyAndReturn({
          data: batch.map((procedure) => ({
            customerId: procedure.customerId,
            deviceId: procedure.deviceId,
            date: procedure.date,
            declaredShotCount: procedure.declaredShotCount,
            actualShotCount: procedure.actualShotCount,
            price: procedure.price,
            discountAmount: procedure.discountAmount,
            visitNumber: procedure.visitNumber,
            createdAt: procedure.date,
          })),
          // visitNumber hər müştəri daxilində unikaldır — zonaları sıraya deyil,
          // məhz bu sahəyə görə uyğunlaşdırırıq.
          select: { id: true, visitNumber: true },
        });

        createdProcedures += rows.length;

        const idByVisitNumber = new Map(
          rows.map((row) => [row.visitNumber, row.id]),
        );

        const zoneLinks = [];
        for (const procedure of batch) {
          const procedureId = idByVisitNumber.get(procedure.visitNumber);
          if (!procedureId) continue;
          for (const zoneId of procedure.zoneIds) {
            zoneLinks.push({ procedureId, zoneId });
          }
        }

        if (zoneLinks.length > 0) {
          const result = await prisma.procedureZone.createMany({
            data: zoneLinks,
            skipDuplicates: true,
          });
          linkedZones += result.count;
        }
      }
    }

    // visit_count = həmin müştərinin bazadakı cəmi prosedur sayı.
    const totalVisits = await prisma.procedure.count({ where: { customerId } });
    const earliestVisit = customer.visits[0].date;
    // Qeydiyyat tarixi ilk vizitdən gec ola bilməz.
    const registeredAt =
      currentRegisteredAt && currentRegisteredAt < earliestVisit
        ? currentRegisteredAt
        : earliestVisit;

    await prisma.customer.update({
      where: { id: customerId },
      data: { visitCount: totalVisits, registeredAt },
    });

    processed += 1;
    if (processed % 250 === 0) {
      console.log(`  ... ${processed}/${customers.length} müştəri`);
    }
  }

  console.log('\n─────────── Nəticə ───────────');
  console.log(`Yeni müştəri:            ${createdCustomers}`);
  console.log(`Mövcud müştəri yeniləndi: ${updatedCustomers}`);
  console.log(`Yeni prosedur (vizit):    ${createdProcedures}`);
  console.log(`Artıq mövcud olan vizit:  ${skippedProcedures}`);
  console.log(`Bağlanan zona:            ${linkedZones}`);
  reportUnknownZones(unknownZones);
}

function reportUnknownZones(unknownZones) {
  if (unknownZones.size === 0) return;

  const top = [...unknownZones.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
  console.log(
    `\nTanınmayan ${unknownZones.size} zona adı (prosedur yaradıldı, sadəcə zona bağlanmadı).`,
  );
  console.log('Ən çox rast gələnlər — lazım olsa ZONE_ALIASES-ə əlavə et:');
  for (const [token, count] of top) {
    console.log(`  ${String(count).padStart(5)} × "${token}"`);
  }
}

main()
  .catch((error) => {
    console.error('\nImport uğursuz oldu:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
