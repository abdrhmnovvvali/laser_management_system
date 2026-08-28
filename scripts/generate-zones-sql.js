const fs = require('fs');
const path = require('path');

const femaleZones = [
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

const maleZones = [
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

const allZones = [...femaleZones, ...maleZones];

function escapeSql(str) {
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- ==========================================================\n`;
sql += `-- Update Branches, Devices & Synchronize Zones\n`;
sql += `-- Daşkənd: Doctor laser -> Devices: Candela Pro U, Deka\n`;
sql += `-- Səmərqənd: Laser N1   -> Device:  Candela Pro U\n`;
sql += `-- ==========================================================\n\n`;

sql += `DO $$\n`;
sql += `DECLARE\n`;
sql += `  v_daskent_id UUID;\n`;
sql += `  v_semerqend_id UUID;\n`;
sql += `  v_candela_daskent_id UUID;\n`;
sql += `  v_deka_daskent_id UUID;\n`;
sql += `  v_candela_semerqend_id UUID;\n`;
sql += `  v_zone_id UUID;\n`;
sql += `  v_dev_id UUID;\n`;
sql += `BEGIN\n`;

// 1. Daşkənd branch (Doctor laser)
sql += `  -- 1. Find or create Daşkənd branch\n`;
sql += `  SELECT branch_id INTO v_daskent_id FROM branch_translations WHERE name ILIKE '%Daşkənd%' OR name ILIKE '%Daskent%' OR name ILIKE '%Doctor laser%' LIMIT 1;\n`;
sql += `  IF v_daskent_id IS NULL THEN\n`;
sql += `    v_daskent_id := gen_random_uuid();\n`;
sql += `    INSERT INTO branches (id, created_at) VALUES (v_daskent_id, NOW());\n`;
sql += `  END IF;\n\n`;

sql += `  -- Update translations to "Doctor laser"\n`;
sql += `  INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
sql += `    (v_daskent_id, 'az', 'Doctor laser', 'Дархан, Ниёзбек Йули 8'),\n`;
sql += `    (v_daskent_id, 'en', 'Doctor laser', 'Darkhan, Niyozbek Yuli 8'),\n`;
sql += `    (v_daskent_id, 'ru', 'Doctor laser', 'Дархан, Ниёзбек Йули 8')\n`;
sql += `  ON CONFLICT (branch_id, locale) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;\n\n`;

// 2. Səmərqənd branch (Laser N1)
sql += `  -- 2. Find or create Səmərqənd branch\n`;
sql += `  SELECT branch_id INTO v_semerqend_id FROM branch_translations WHERE name ILIKE '%Səmərqənd%' OR name ILIKE '%Semerqend%' OR name ILIKE '%Laser N1%' LIMIT 1;\n`;
sql += `  IF v_semerqend_id IS NULL THEN\n`;
sql += `    v_semerqend_id := gen_random_uuid();\n`;
sql += `    INSERT INTO branches (id, created_at) VALUES (v_semerqend_id, NOW());\n`;
sql += `  END IF;\n\n`;

sql += `  -- Update translations to "Laser N1"\n`;
sql += `  INSERT INTO branch_translations (branch_id, locale, name, address) VALUES\n`;
sql += `    (v_semerqend_id, 'az', 'Laser N1', 'Гагарина, дом 81'),\n`;
sql += `    (v_semerqend_id, 'en', 'Laser N1', 'Gagarina, house 81'),\n`;
sql += `    (v_semerqend_id, 'ru', 'Laser N1', 'Гагарина, дом 81')\n`;
sql += `  ON CONFLICT (branch_id, locale) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;\n\n`;

// 3. Daşkənd Devices: Candela Pro U and Deka
sql += `  -- 3. Setup Daşkənd Devices: Candela Pro U and Deka\n`;
sql += `  SELECT d.id INTO v_candela_daskent_id\n`;
sql += `  FROM devices d\n`;
sql += `  JOIN device_translations dt ON dt.device_id = d.id\n`;
sql += `  WHERE d.branch_id = v_daskent_id AND dt.type ILIKE '%Candela%'\n`;
sql += `  LIMIT 1;\n`;

sql += `  IF v_candela_daskent_id IS NULL THEN\n`;
sql += `    -- Check if there is an unrenamed device in Daşkənd branch\n`;
sql += `    SELECT id INTO v_candela_daskent_id FROM devices WHERE branch_id = v_daskent_id LIMIT 1;\n`;
sql += `    IF v_candela_daskent_id IS NULL THEN\n`;
sql += `      v_candela_daskent_id := gen_random_uuid();\n`;
sql += `      INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_candela_daskent_id, v_daskent_id, 0, NOW());\n`;
sql += `    END IF;\n`;
sql += `  END IF;\n\n`;

sql += `  INSERT INTO device_translations (device_id, locale, type) VALUES\n`;
sql += `    (v_candela_daskent_id, 'az', 'Candela Pro U'),\n`;
sql += `    (v_candela_daskent_id, 'en', 'Candela Pro U'),\n`;
sql += `    (v_candela_daskent_id, 'ru', 'Candela Pro U')\n`;
sql += `  ON CONFLICT (device_id, locale) DO UPDATE SET type = EXCLUDED.type;\n\n`;

sql += `  -- Deka device for Daşkənd\n`;
sql += `  SELECT d.id INTO v_deka_daskent_id\n`;
sql += `  FROM devices d\n`;
sql += `  JOIN device_translations dt ON dt.device_id = d.id\n`;
sql += `  WHERE d.branch_id = v_daskent_id AND dt.type ILIKE '%Deka%'\n`;
sql += `  LIMIT 1;\n`;

sql += `  IF v_deka_daskent_id IS NULL THEN\n`;
sql += `    v_deka_daskent_id := gen_random_uuid();\n`;
sql += `    INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_deka_daskent_id, v_daskent_id, 0, NOW());\n`;
sql += `  END IF;\n\n`;

sql += `  INSERT INTO device_translations (device_id, locale, type) VALUES\n`;
sql += `    (v_deka_daskent_id, 'az', 'Deka'),\n`;
sql += `    (v_deka_daskent_id, 'en', 'Deka'),\n`;
sql += `    (v_deka_daskent_id, 'ru', 'Deka')\n`;
sql += `  ON CONFLICT (device_id, locale) DO UPDATE SET type = EXCLUDED.type;\n\n`;

// 4. Səmərqənd Device: Candela Pro U
sql += `  -- 4. Setup Səmərqənd Device: Candela Pro U\n`;
sql += `  SELECT d.id INTO v_candela_semerqend_id\n`;
sql += `  FROM devices d\n`;
sql += `  JOIN device_translations dt ON dt.device_id = d.id\n`;
sql += `  WHERE d.branch_id = v_semerqend_id AND dt.type ILIKE '%Candela%'\n`;
sql += `  LIMIT 1;\n`;

sql += `  IF v_candela_semerqend_id IS NULL THEN\n`;
sql += `    SELECT id INTO v_candela_semerqend_id FROM devices WHERE branch_id = v_semerqend_id LIMIT 1;\n`;
sql += `    IF v_candela_semerqend_id IS NULL THEN\n`;
sql += `      v_candela_semerqend_id := gen_random_uuid();\n`;
sql += `      INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_candela_semerqend_id, v_semerqend_id, 0, NOW());\n`;
sql += `    END IF;\n`;
sql += `  END IF;\n\n`;

sql += `  INSERT INTO device_translations (device_id, locale, type) VALUES\n`;
sql += `    (v_candela_semerqend_id, 'az', 'Candela Pro U'),\n`;
sql += `    (v_candela_semerqend_id, 'en', 'Candela Pro U'),\n`;
sql += `    (v_candela_semerqend_id, 'ru', 'Candela Pro U')\n`;
sql += `  ON CONFLICT (device_id, locale) DO UPDATE SET type = EXCLUDED.type;\n\n`;

// 5. Seed / Sync zones for all 3 devices
sql += `  -- 5. Seed zones for all target devices\n`;
const devicesToSync = ['v_candela_daskent_id', 'v_deka_daskent_id', 'v_candela_semerqend_id'];

for (const targetDevVar of devicesToSync) {
  for (const z of allZones) {
    sql += `  SELECT z.id INTO v_zone_id\n`;
    sql += `  FROM zones z\n`;
    sql += `  JOIN zone_translations zt ON zt.zone_id = z.id\n`;
    sql += `  WHERE z.device_id = ${targetDevVar} AND zt.name = ${escapeSql(z.ru)} LIMIT 1;\n`;
    sql += `  IF v_zone_id IS NULL THEN\n`;
    sql += `    v_zone_id := gen_random_uuid();\n`;
    sql += `    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, ${targetDevVar}, ${z.price}, NOW());\n`;
    sql += `    INSERT INTO zone_translations (zone_id, locale, name) VALUES\n`;
    sql += `      (v_zone_id, 'az', ${escapeSql(z.az)}),\n`;
    sql += `      (v_zone_id, 'ru', ${escapeSql(z.ru)}),\n`;
    sql += `      (v_zone_id, 'en', ${escapeSql(z.en)});\n`;
    sql += `  ELSE\n`;
    sql += `    UPDATE zones SET price = ${z.price} WHERE id = v_zone_id;\n`;
    sql += `  END IF;\n\n`;
  }
}

sql += `END $$;\n`;

const outputPath = path.resolve(__dirname, 'import_zones.sql');
fs.writeFileSync(outputPath, sql);
console.log(`Updated import_zones.sql with accurate branch & device structures.`);
