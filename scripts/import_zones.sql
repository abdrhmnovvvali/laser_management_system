-- ==========================================================
-- Update Branches, Devices & Synchronize Zones
-- Daşkənd: Doctor laser -> Devices: Candela Pro U, Deka
-- Səmərqənd: Laser N1   -> Device:  Candela Pro U
-- ==========================================================

DO $$
DECLARE
  v_daskent_id UUID;
  v_semerqend_id UUID;
  v_candela_daskent_id UUID;
  v_deka_daskent_id UUID;
  v_candela_semerqend_id UUID;
  v_zone_id UUID;
  v_dev_id UUID;
BEGIN
  -- 1. Find or create Daşkənd branch
  SELECT branch_id INTO v_daskent_id FROM branch_translations WHERE name ILIKE '%Daşkənd%' OR name ILIKE '%Daskent%' OR name ILIKE '%Doctor laser%' LIMIT 1;
  IF v_daskent_id IS NULL THEN
    v_daskent_id := gen_random_uuid();
    INSERT INTO branches (id, created_at) VALUES (v_daskent_id, NOW());
  END IF;

  -- Update translations to "Doctor laser"
  INSERT INTO branch_translations (branch_id, locale, name, address) VALUES
    (v_daskent_id, 'az', 'Doctor laser', 'Дархан, Ниёзбек Йули 8'),
    (v_daskent_id, 'en', 'Doctor laser', 'Darkhan, Niyozbek Yuli 8'),
    (v_daskent_id, 'ru', 'Doctor laser', 'Дархан, Ниёзбек Йули 8')
  ON CONFLICT (branch_id, locale) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

  -- 2. Find or create Səmərqənd branch
  SELECT branch_id INTO v_semerqend_id FROM branch_translations WHERE name ILIKE '%Səmərqənd%' OR name ILIKE '%Semerqend%' OR name ILIKE '%Laser N1%' LIMIT 1;
  IF v_semerqend_id IS NULL THEN
    v_semerqend_id := gen_random_uuid();
    INSERT INTO branches (id, created_at) VALUES (v_semerqend_id, NOW());
  END IF;

  -- Update translations to "Laser N1"
  INSERT INTO branch_translations (branch_id, locale, name, address) VALUES
    (v_semerqend_id, 'az', 'Laser N1', 'Гагарина, дом 81'),
    (v_semerqend_id, 'en', 'Laser N1', 'Gagarina, house 81'),
    (v_semerqend_id, 'ru', 'Laser N1', 'Гагарина, дом 81')
  ON CONFLICT (branch_id, locale) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

  -- 3. Setup Daşkənd Devices: Candela Pro U and Deka
  SELECT d.id INTO v_candela_daskent_id
  FROM devices d
  JOIN device_translations dt ON dt.device_id = d.id
  WHERE d.branch_id = v_daskent_id AND dt.type ILIKE '%Candela%'
  LIMIT 1;
  IF v_candela_daskent_id IS NULL THEN
    -- Check if there is an unrenamed device in Daşkənd branch
    SELECT id INTO v_candela_daskent_id FROM devices WHERE branch_id = v_daskent_id LIMIT 1;
    IF v_candela_daskent_id IS NULL THEN
      v_candela_daskent_id := gen_random_uuid();
      INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_candela_daskent_id, v_daskent_id, 0, NOW());
    END IF;
  END IF;

  INSERT INTO device_translations (device_id, locale, type) VALUES
    (v_candela_daskent_id, 'az', 'Candela Pro U'),
    (v_candela_daskent_id, 'en', 'Candela Pro U'),
    (v_candela_daskent_id, 'ru', 'Candela Pro U')
  ON CONFLICT (device_id, locale) DO UPDATE SET type = EXCLUDED.type;

  -- Deka device for Daşkənd
  SELECT d.id INTO v_deka_daskent_id
  FROM devices d
  JOIN device_translations dt ON dt.device_id = d.id
  WHERE d.branch_id = v_daskent_id AND dt.type ILIKE '%Deka%'
  LIMIT 1;
  IF v_deka_daskent_id IS NULL THEN
    v_deka_daskent_id := gen_random_uuid();
    INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_deka_daskent_id, v_daskent_id, 0, NOW());
  END IF;

  INSERT INTO device_translations (device_id, locale, type) VALUES
    (v_deka_daskent_id, 'az', 'Deka'),
    (v_deka_daskent_id, 'en', 'Deka'),
    (v_deka_daskent_id, 'ru', 'Deka')
  ON CONFLICT (device_id, locale) DO UPDATE SET type = EXCLUDED.type;

  -- 4. Setup Səmərqənd Device: Candela Pro U
  SELECT d.id INTO v_candela_semerqend_id
  FROM devices d
  JOIN device_translations dt ON dt.device_id = d.id
  WHERE d.branch_id = v_semerqend_id AND dt.type ILIKE '%Candela%'
  LIMIT 1;
  IF v_candela_semerqend_id IS NULL THEN
    SELECT id INTO v_candela_semerqend_id FROM devices WHERE branch_id = v_semerqend_id LIMIT 1;
    IF v_candela_semerqend_id IS NULL THEN
      v_candela_semerqend_id := gen_random_uuid();
      INSERT INTO devices (id, branch_id, shot_counter, created_at) VALUES (v_candela_semerqend_id, v_semerqend_id, 0, NOW());
    END IF;
  END IF;

  INSERT INTO device_translations (device_id, locale, type) VALUES
    (v_candela_semerqend_id, 'az', 'Candela Pro U'),
    (v_candela_semerqend_id, 'en', 'Candela Pro U'),
    (v_candela_semerqend_id, 'ru', 'Candela Pro U')
  ON CONFLICT (device_id, locale) DO UPDATE SET type = EXCLUDED.type;

  -- 5. Seed zones for all target devices
  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Лицо' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Üz'),
      (v_zone_id, 'ru', 'Лицо'),
      (v_zone_id, 'en', 'Face');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Лоб' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Alın'),
      (v_zone_id, 'ru', 'Лоб'),
      (v_zone_id, 'en', 'Forehead');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Монобровь' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 60000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qaşarası'),
      (v_zone_id, 'ru', 'Монобровь'),
      (v_zone_id, 'en', 'Unibrow');
  ELSE
    UPDATE zones SET price = 60000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Баки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bakenbard'),
      (v_zone_id, 'ru', 'Баки'),
      (v_zone_id, 'en', 'Sideburns');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Усики' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 90000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bığ'),
      (v_zone_id, 'ru', 'Усики'),
      (v_zone_id, 'en', 'Upper lip');
  ELSE
    UPDATE zones SET price = 90000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Подбородок' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çənə'),
      (v_zone_id, 'ru', 'Подбородок'),
      (v_zone_id, 'en', 'Chin');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Шея' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Boyun'),
      (v_zone_id, 'ru', 'Шея'),
      (v_zone_id, 'en', 'Neck');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Шея половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yarım boyun'),
      (v_zone_id, 'ru', 'Шея половина'),
      (v_zone_id, 'en', 'Half neck');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Руки полностью' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 450000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar (tam)'),
      (v_zone_id, 'ru', 'Руки полностью'),
      (v_zone_id, 'en', 'Full arms');
  ELSE
    UPDATE zones SET price = 450000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Руки половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 350000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar (yarım)'),
      (v_zone_id, 'ru', 'Руки половина'),
      (v_zone_id, 'en', 'Half arms');
  ELSE
    UPDATE zones SET price = 350000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Кисти рук' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Əl daraqları / barmaqlar'),
      (v_zone_id, 'ru', 'Кисти рук'),
      (v_zone_id, 'en', 'Hands / Fingers');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Подмышки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qoltuqaltı'),
      (v_zone_id, 'ru', 'Подмышки'),
      (v_zone_id, 'en', 'Underarms');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Спина целиком' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 650000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bütün kürək'),
      (v_zone_id, 'ru', 'Спина целиком'),
      (v_zone_id, 'en', 'Full back');
  ELSE
    UPDATE zones SET price = 650000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Лопатки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Kürək sümükləri'),
      (v_zone_id, 'ru', 'Лопатки'),
      (v_zone_id, 'en', 'Shoulder blades');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Плечи' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çiyinlər'),
      (v_zone_id, 'ru', 'Плечи'),
      (v_zone_id, 'en', 'Shoulders');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Поясница' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bel'),
      (v_zone_id, 'ru', 'Поясница'),
      (v_zone_id, 'en', 'Lower back');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Декольте' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Dekolte'),
      (v_zone_id, 'ru', 'Декольте'),
      (v_zone_id, 'en', 'Decollete');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Между грудей' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə arası'),
      (v_zone_id, 'ru', 'Между грудей'),
      (v_zone_id, 'en', 'Between breasts');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Вокруг сосков' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Gilə ətrafı'),
      (v_zone_id, 'ru', 'Вокруг сосков'),
      (v_zone_id, 'en', 'Areola');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Грудь с сосками' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə'),
      (v_zone_id, 'ru', 'Грудь с сосками'),
      (v_zone_id, 'en', 'Breasts');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Живот полностью' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 270000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam qarın'),
      (v_zone_id, 'ru', 'Живот полностью'),
      (v_zone_id, 'en', 'Full abdomen');
  ELSE
    UPDATE zones SET price = 270000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Живот низ' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 130000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Aşağı qarın'),
      (v_zone_id, 'ru', 'Живот низ'),
      (v_zone_id, 'en', 'Lower abdomen');
  ELSE
    UPDATE zones SET price = 130000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Живот верх' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 170000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yuxarı qarın'),
      (v_zone_id, 'ru', 'Живот верх'),
      (v_zone_id, 'en', 'Upper abdomen');
  ELSE
    UPDATE zones SET price = 170000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Ноги' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 650000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar (tam)'),
      (v_zone_id, 'ru', 'Ноги'),
      (v_zone_id, 'en', 'Full legs');
  ELSE
    UPDATE zones SET price = 650000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Ноги половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar (yarım)'),
      (v_zone_id, 'ru', 'Ноги половина'),
      (v_zone_id, 'en', 'Half legs');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Ягодицы' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sarğı / Yan'),
      (v_zone_id, 'ru', 'Ягодицы'),
      (v_zone_id, 'en', 'Buttocks');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Бикини' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bikini'),
      (v_zone_id, 'ru', 'Бикини'),
      (v_zone_id, 'en', 'Bikini');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Ноги полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 1000000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar tam (Kişi)'),
      (v_zone_id, 'ru', 'Ноги полностью (Муж.)'),
      (v_zone_id, 'en', 'Full legs (Men)');
  ELSE
    UPDATE zones SET price = 1000000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Ноги половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar yarım (Kişi)'),
      (v_zone_id, 'ru', 'Ноги половина (Муж.)'),
      (v_zone_id, 'en', 'Half legs (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Пальцы ног (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaq barmaqları (Kişi)'),
      (v_zone_id, 'ru', 'Пальцы ног (Муж.)'),
      (v_zone_id, 'en', 'Toes (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Руки полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar tam (Kişi)'),
      (v_zone_id, 'ru', 'Руки полностью (Муж.)'),
      (v_zone_id, 'en', 'Full arms (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Руки половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar yarım (Kişi)'),
      (v_zone_id, 'ru', 'Руки половина (Муж.)'),
      (v_zone_id, 'en', 'Half arms (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Пальцы рук (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Əl barmaqları (Kişi)'),
      (v_zone_id, 'ru', 'Пальцы рук (Муж.)'),
      (v_zone_id, 'en', 'Fingers (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Бикини (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bikini (Kişi)'),
      (v_zone_id, 'ru', 'Бикини (Муж.)'),
      (v_zone_id, 'en', 'Bikini (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Поясница (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bel (Kişi)'),
      (v_zone_id, 'ru', 'Поясница (Муж.)'),
      (v_zone_id, 'en', 'Lower back (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Ягодицы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sarğı (Kişi)'),
      (v_zone_id, 'ru', 'Ягодицы (Муж.)'),
      (v_zone_id, 'en', 'Buttocks (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Спина до поясницы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Beldən yuxarı kürək (Kişi)'),
      (v_zone_id, 'ru', 'Спина до поясницы (Муж.)'),
      (v_zone_id, 'en', 'Upper back (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Спина общая (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 750000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bütün kürək (Kişi)'),
      (v_zone_id, 'ru', 'Спина общая (Муж.)'),
      (v_zone_id, 'en', 'Full back (Men)');
  ELSE
    UPDATE zones SET price = 750000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Плечи (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 450000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çiyinlər (Kişi)'),
      (v_zone_id, 'ru', 'Плечи (Муж.)'),
      (v_zone_id, 'en', 'Shoulders (Men)');
  ELSE
    UPDATE zones SET price = 450000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Подмышки (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qoltuqaltı (Kişi)'),
      (v_zone_id, 'ru', 'Подмышки (Муж.)'),
      (v_zone_id, 'en', 'Underarms (Men)');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Шея полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam boyun (Kişi)'),
      (v_zone_id, 'ru', 'Шея полностью (Муж.)'),
      (v_zone_id, 'en', 'Full neck (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Шея половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yarım boyun (Kişi)'),
      (v_zone_id, 'ru', 'Шея половина (Муж.)'),
      (v_zone_id, 'en', 'Half neck (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Лицо (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Üz (Kişi)'),
      (v_zone_id, 'ru', 'Лицо (Муж.)'),
      (v_zone_id, 'en', 'Face (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Лоб (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Alın (Kişi)'),
      (v_zone_id, 'ru', 'Лоб (Муж.)'),
      (v_zone_id, 'en', 'Forehead (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Усики (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bığ (Kişi)'),
      (v_zone_id, 'ru', 'Усики (Муж.)'),
      (v_zone_id, 'en', 'Mustache (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Межбровье (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qaşarası (Kişi)'),
      (v_zone_id, 'ru', 'Межбровье (Муж.)'),
      (v_zone_id, 'en', 'Unibrow (Men)');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Подбородок (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çənə (Kişi)'),
      (v_zone_id, 'ru', 'Подбородок (Муж.)'),
      (v_zone_id, 'en', 'Chin (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Щёки (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yanaqlar (Kişi)'),
      (v_zone_id, 'ru', 'Щёки (Муж.)'),
      (v_zone_id, 'en', 'Cheeks (Men)');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Живот полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот полностью (Муж.)'),
      (v_zone_id, 'en', 'Full abdomen (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Живот от лобка до пупка (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Göbəyə qədər qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот от лобка до пупка (Муж.)'),
      (v_zone_id, 'en', 'Lower abdomen to navel (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Живот от лобка до груди (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Köksə qədər qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот от лобка до груди (Муж.)'),
      (v_zone_id, 'en', 'Abdomen to chest (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Между грудей (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə arası (Kişi)'),
      (v_zone_id, 'ru', 'Между грудей (Муж.)'),
      (v_zone_id, 'en', 'Between chest (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Грудь (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə (Kişi)'),
      (v_zone_id, 'ru', 'Грудь (Муж.)'),
      (v_zone_id, 'en', 'Chest (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_daskent_id AND zt.name = 'Ареолы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_daskent_id, 150000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Gilə ətrafı (Kişi)'),
      (v_zone_id, 'ru', 'Ареолы (Муж.)'),
      (v_zone_id, 'en', 'Areola (Men)');
  ELSE
    UPDATE zones SET price = 150000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Лицо' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Üz'),
      (v_zone_id, 'ru', 'Лицо'),
      (v_zone_id, 'en', 'Face');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Лоб' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Alın'),
      (v_zone_id, 'ru', 'Лоб'),
      (v_zone_id, 'en', 'Forehead');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Монобровь' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 60000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qaşarası'),
      (v_zone_id, 'ru', 'Монобровь'),
      (v_zone_id, 'en', 'Unibrow');
  ELSE
    UPDATE zones SET price = 60000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Баки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bakenbard'),
      (v_zone_id, 'ru', 'Баки'),
      (v_zone_id, 'en', 'Sideburns');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Усики' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 90000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bığ'),
      (v_zone_id, 'ru', 'Усики'),
      (v_zone_id, 'en', 'Upper lip');
  ELSE
    UPDATE zones SET price = 90000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Подбородок' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çənə'),
      (v_zone_id, 'ru', 'Подбородок'),
      (v_zone_id, 'en', 'Chin');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Шея' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Boyun'),
      (v_zone_id, 'ru', 'Шея'),
      (v_zone_id, 'en', 'Neck');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Шея половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yarım boyun'),
      (v_zone_id, 'ru', 'Шея половина'),
      (v_zone_id, 'en', 'Half neck');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Руки полностью' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 450000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar (tam)'),
      (v_zone_id, 'ru', 'Руки полностью'),
      (v_zone_id, 'en', 'Full arms');
  ELSE
    UPDATE zones SET price = 450000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Руки половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 350000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar (yarım)'),
      (v_zone_id, 'ru', 'Руки половина'),
      (v_zone_id, 'en', 'Half arms');
  ELSE
    UPDATE zones SET price = 350000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Кисти рук' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Əl daraqları / barmaqlar'),
      (v_zone_id, 'ru', 'Кисти рук'),
      (v_zone_id, 'en', 'Hands / Fingers');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Подмышки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qoltuqaltı'),
      (v_zone_id, 'ru', 'Подмышки'),
      (v_zone_id, 'en', 'Underarms');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Спина целиком' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 650000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bütün kürək'),
      (v_zone_id, 'ru', 'Спина целиком'),
      (v_zone_id, 'en', 'Full back');
  ELSE
    UPDATE zones SET price = 650000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Лопатки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Kürək sümükləri'),
      (v_zone_id, 'ru', 'Лопатки'),
      (v_zone_id, 'en', 'Shoulder blades');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Плечи' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çiyinlər'),
      (v_zone_id, 'ru', 'Плечи'),
      (v_zone_id, 'en', 'Shoulders');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Поясница' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bel'),
      (v_zone_id, 'ru', 'Поясница'),
      (v_zone_id, 'en', 'Lower back');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Декольте' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Dekolte'),
      (v_zone_id, 'ru', 'Декольте'),
      (v_zone_id, 'en', 'Decollete');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Между грудей' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə arası'),
      (v_zone_id, 'ru', 'Между грудей'),
      (v_zone_id, 'en', 'Between breasts');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Вокруг сосков' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Gilə ətrafı'),
      (v_zone_id, 'ru', 'Вокруг сосков'),
      (v_zone_id, 'en', 'Areola');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Грудь с сосками' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə'),
      (v_zone_id, 'ru', 'Грудь с сосками'),
      (v_zone_id, 'en', 'Breasts');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Живот полностью' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 270000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam qarın'),
      (v_zone_id, 'ru', 'Живот полностью'),
      (v_zone_id, 'en', 'Full abdomen');
  ELSE
    UPDATE zones SET price = 270000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Живот низ' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 130000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Aşağı qarın'),
      (v_zone_id, 'ru', 'Живот низ'),
      (v_zone_id, 'en', 'Lower abdomen');
  ELSE
    UPDATE zones SET price = 130000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Живот верх' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 170000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yuxarı qarın'),
      (v_zone_id, 'ru', 'Живот верх'),
      (v_zone_id, 'en', 'Upper abdomen');
  ELSE
    UPDATE zones SET price = 170000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Ноги' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 650000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar (tam)'),
      (v_zone_id, 'ru', 'Ноги'),
      (v_zone_id, 'en', 'Full legs');
  ELSE
    UPDATE zones SET price = 650000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Ноги половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar (yarım)'),
      (v_zone_id, 'ru', 'Ноги половина'),
      (v_zone_id, 'en', 'Half legs');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Ягодицы' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sarğı / Yan'),
      (v_zone_id, 'ru', 'Ягодицы'),
      (v_zone_id, 'en', 'Buttocks');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Бикини' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bikini'),
      (v_zone_id, 'ru', 'Бикини'),
      (v_zone_id, 'en', 'Bikini');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Ноги полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 1000000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar tam (Kişi)'),
      (v_zone_id, 'ru', 'Ноги полностью (Муж.)'),
      (v_zone_id, 'en', 'Full legs (Men)');
  ELSE
    UPDATE zones SET price = 1000000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Ноги половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar yarım (Kişi)'),
      (v_zone_id, 'ru', 'Ноги половина (Муж.)'),
      (v_zone_id, 'en', 'Half legs (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Пальцы ног (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaq barmaqları (Kişi)'),
      (v_zone_id, 'ru', 'Пальцы ног (Муж.)'),
      (v_zone_id, 'en', 'Toes (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Руки полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar tam (Kişi)'),
      (v_zone_id, 'ru', 'Руки полностью (Муж.)'),
      (v_zone_id, 'en', 'Full arms (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Руки половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar yarım (Kişi)'),
      (v_zone_id, 'ru', 'Руки половина (Муж.)'),
      (v_zone_id, 'en', 'Half arms (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Пальцы рук (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Əl barmaqları (Kişi)'),
      (v_zone_id, 'ru', 'Пальцы рук (Муж.)'),
      (v_zone_id, 'en', 'Fingers (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Бикини (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bikini (Kişi)'),
      (v_zone_id, 'ru', 'Бикини (Муж.)'),
      (v_zone_id, 'en', 'Bikini (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Поясница (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bel (Kişi)'),
      (v_zone_id, 'ru', 'Поясница (Муж.)'),
      (v_zone_id, 'en', 'Lower back (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Ягодицы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sarğı (Kişi)'),
      (v_zone_id, 'ru', 'Ягодицы (Муж.)'),
      (v_zone_id, 'en', 'Buttocks (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Спина до поясницы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Beldən yuxarı kürək (Kişi)'),
      (v_zone_id, 'ru', 'Спина до поясницы (Муж.)'),
      (v_zone_id, 'en', 'Upper back (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Спина общая (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 750000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bütün kürək (Kişi)'),
      (v_zone_id, 'ru', 'Спина общая (Муж.)'),
      (v_zone_id, 'en', 'Full back (Men)');
  ELSE
    UPDATE zones SET price = 750000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Плечи (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 450000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çiyinlər (Kişi)'),
      (v_zone_id, 'ru', 'Плечи (Муж.)'),
      (v_zone_id, 'en', 'Shoulders (Men)');
  ELSE
    UPDATE zones SET price = 450000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Подмышки (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qoltuqaltı (Kişi)'),
      (v_zone_id, 'ru', 'Подмышки (Муж.)'),
      (v_zone_id, 'en', 'Underarms (Men)');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Шея полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam boyun (Kişi)'),
      (v_zone_id, 'ru', 'Шея полностью (Муж.)'),
      (v_zone_id, 'en', 'Full neck (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Шея половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yarım boyun (Kişi)'),
      (v_zone_id, 'ru', 'Шея половина (Муж.)'),
      (v_zone_id, 'en', 'Half neck (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Лицо (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Üz (Kişi)'),
      (v_zone_id, 'ru', 'Лицо (Муж.)'),
      (v_zone_id, 'en', 'Face (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Лоб (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Alın (Kişi)'),
      (v_zone_id, 'ru', 'Лоб (Муж.)'),
      (v_zone_id, 'en', 'Forehead (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Усики (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bığ (Kişi)'),
      (v_zone_id, 'ru', 'Усики (Муж.)'),
      (v_zone_id, 'en', 'Mustache (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Межбровье (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qaşarası (Kişi)'),
      (v_zone_id, 'ru', 'Межбровье (Муж.)'),
      (v_zone_id, 'en', 'Unibrow (Men)');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Подбородок (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çənə (Kişi)'),
      (v_zone_id, 'ru', 'Подбородок (Муж.)'),
      (v_zone_id, 'en', 'Chin (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Щёки (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yanaqlar (Kişi)'),
      (v_zone_id, 'ru', 'Щёки (Муж.)'),
      (v_zone_id, 'en', 'Cheeks (Men)');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Живот полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот полностью (Муж.)'),
      (v_zone_id, 'en', 'Full abdomen (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Живот от лобка до пупка (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Göbəyə qədər qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот от лобка до пупка (Муж.)'),
      (v_zone_id, 'en', 'Lower abdomen to navel (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Живот от лобка до груди (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Köksə qədər qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот от лобка до груди (Муж.)'),
      (v_zone_id, 'en', 'Abdomen to chest (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Между грудей (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə arası (Kişi)'),
      (v_zone_id, 'ru', 'Между грудей (Муж.)'),
      (v_zone_id, 'en', 'Between chest (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Грудь (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə (Kişi)'),
      (v_zone_id, 'ru', 'Грудь (Муж.)'),
      (v_zone_id, 'en', 'Chest (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_deka_daskent_id AND zt.name = 'Ареолы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_deka_daskent_id, 150000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Gilə ətrafı (Kişi)'),
      (v_zone_id, 'ru', 'Ареолы (Муж.)'),
      (v_zone_id, 'en', 'Areola (Men)');
  ELSE
    UPDATE zones SET price = 150000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Лицо' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Üz'),
      (v_zone_id, 'ru', 'Лицо'),
      (v_zone_id, 'en', 'Face');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Лоб' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Alın'),
      (v_zone_id, 'ru', 'Лоб'),
      (v_zone_id, 'en', 'Forehead');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Монобровь' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 60000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qaşarası'),
      (v_zone_id, 'ru', 'Монобровь'),
      (v_zone_id, 'en', 'Unibrow');
  ELSE
    UPDATE zones SET price = 60000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Баки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bakenbard'),
      (v_zone_id, 'ru', 'Баки'),
      (v_zone_id, 'en', 'Sideburns');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Усики' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 90000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bığ'),
      (v_zone_id, 'ru', 'Усики'),
      (v_zone_id, 'en', 'Upper lip');
  ELSE
    UPDATE zones SET price = 90000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Подбородок' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çənə'),
      (v_zone_id, 'ru', 'Подбородок'),
      (v_zone_id, 'en', 'Chin');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Шея' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Boyun'),
      (v_zone_id, 'ru', 'Шея'),
      (v_zone_id, 'en', 'Neck');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Шея половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yarım boyun'),
      (v_zone_id, 'ru', 'Шея половина'),
      (v_zone_id, 'en', 'Half neck');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Руки полностью' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 450000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar (tam)'),
      (v_zone_id, 'ru', 'Руки полностью'),
      (v_zone_id, 'en', 'Full arms');
  ELSE
    UPDATE zones SET price = 450000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Руки половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 350000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar (yarım)'),
      (v_zone_id, 'ru', 'Руки половина'),
      (v_zone_id, 'en', 'Half arms');
  ELSE
    UPDATE zones SET price = 350000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Кисти рук' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Əl daraqları / barmaqlar'),
      (v_zone_id, 'ru', 'Кисти рук'),
      (v_zone_id, 'en', 'Hands / Fingers');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Подмышки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qoltuqaltı'),
      (v_zone_id, 'ru', 'Подмышки'),
      (v_zone_id, 'en', 'Underarms');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Спина целиком' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 650000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bütün kürək'),
      (v_zone_id, 'ru', 'Спина целиком'),
      (v_zone_id, 'en', 'Full back');
  ELSE
    UPDATE zones SET price = 650000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Лопатки' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Kürək sümükləri'),
      (v_zone_id, 'ru', 'Лопатки'),
      (v_zone_id, 'en', 'Shoulder blades');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Плечи' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çiyinlər'),
      (v_zone_id, 'ru', 'Плечи'),
      (v_zone_id, 'en', 'Shoulders');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Поясница' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bel'),
      (v_zone_id, 'ru', 'Поясница'),
      (v_zone_id, 'en', 'Lower back');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Декольте' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Dekolte'),
      (v_zone_id, 'ru', 'Декольте'),
      (v_zone_id, 'en', 'Decollete');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Между грудей' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə arası'),
      (v_zone_id, 'ru', 'Между грудей'),
      (v_zone_id, 'en', 'Between breasts');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Вокруг сосков' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 80000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Gilə ətrafı'),
      (v_zone_id, 'ru', 'Вокруг сосков'),
      (v_zone_id, 'en', 'Areola');
  ELSE
    UPDATE zones SET price = 80000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Грудь с сосками' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə'),
      (v_zone_id, 'ru', 'Грудь с сосками'),
      (v_zone_id, 'en', 'Breasts');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Живот полностью' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 270000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam qarın'),
      (v_zone_id, 'ru', 'Живот полностью'),
      (v_zone_id, 'en', 'Full abdomen');
  ELSE
    UPDATE zones SET price = 270000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Живот низ' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 130000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Aşağı qarın'),
      (v_zone_id, 'ru', 'Живот низ'),
      (v_zone_id, 'en', 'Lower abdomen');
  ELSE
    UPDATE zones SET price = 130000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Живот верх' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 170000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yuxarı qarın'),
      (v_zone_id, 'ru', 'Живот верх'),
      (v_zone_id, 'en', 'Upper abdomen');
  ELSE
    UPDATE zones SET price = 170000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Ноги' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 650000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar (tam)'),
      (v_zone_id, 'ru', 'Ноги'),
      (v_zone_id, 'en', 'Full legs');
  ELSE
    UPDATE zones SET price = 650000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Ноги половина' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar (yarım)'),
      (v_zone_id, 'ru', 'Ноги половина'),
      (v_zone_id, 'en', 'Half legs');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Ягодицы' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sarğı / Yan'),
      (v_zone_id, 'ru', 'Ягодицы'),
      (v_zone_id, 'en', 'Buttocks');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Бикини' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bikini'),
      (v_zone_id, 'ru', 'Бикини'),
      (v_zone_id, 'en', 'Bikini');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Ноги полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 1000000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar tam (Kişi)'),
      (v_zone_id, 'ru', 'Ноги полностью (Муж.)'),
      (v_zone_id, 'en', 'Full legs (Men)');
  ELSE
    UPDATE zones SET price = 1000000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Ноги половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaqlar yarım (Kişi)'),
      (v_zone_id, 'ru', 'Ноги половина (Муж.)'),
      (v_zone_id, 'en', 'Half legs (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Пальцы ног (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Ayaq barmaqları (Kişi)'),
      (v_zone_id, 'ru', 'Пальцы ног (Муж.)'),
      (v_zone_id, 'en', 'Toes (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Руки полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar tam (Kişi)'),
      (v_zone_id, 'ru', 'Руки полностью (Муж.)'),
      (v_zone_id, 'en', 'Full arms (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Руки половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qollar yarım (Kişi)'),
      (v_zone_id, 'ru', 'Руки половина (Муж.)'),
      (v_zone_id, 'en', 'Half arms (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Пальцы рук (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Əl barmaqları (Kişi)'),
      (v_zone_id, 'ru', 'Пальцы рук (Муж.)'),
      (v_zone_id, 'en', 'Fingers (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Бикини (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bikini (Kişi)'),
      (v_zone_id, 'ru', 'Бикини (Муж.)'),
      (v_zone_id, 'en', 'Bikini (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Поясница (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bel (Kişi)'),
      (v_zone_id, 'ru', 'Поясница (Муж.)'),
      (v_zone_id, 'en', 'Lower back (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Ягодицы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sarğı (Kişi)'),
      (v_zone_id, 'ru', 'Ягодицы (Муж.)'),
      (v_zone_id, 'en', 'Buttocks (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Спина до поясницы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Beldən yuxarı kürək (Kişi)'),
      (v_zone_id, 'ru', 'Спина до поясницы (Муж.)'),
      (v_zone_id, 'en', 'Upper back (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Спина общая (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 750000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bütün kürək (Kişi)'),
      (v_zone_id, 'ru', 'Спина общая (Муж.)'),
      (v_zone_id, 'en', 'Full back (Men)');
  ELSE
    UPDATE zones SET price = 750000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Плечи (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 450000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çiyinlər (Kişi)'),
      (v_zone_id, 'ru', 'Плечи (Муж.)'),
      (v_zone_id, 'en', 'Shoulders (Men)');
  ELSE
    UPDATE zones SET price = 450000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Подмышки (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qoltuqaltı (Kişi)'),
      (v_zone_id, 'ru', 'Подмышки (Муж.)'),
      (v_zone_id, 'en', 'Underarms (Men)');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Шея полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 400000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam boyun (Kişi)'),
      (v_zone_id, 'ru', 'Шея полностью (Муж.)'),
      (v_zone_id, 'en', 'Full neck (Men)');
  ELSE
    UPDATE zones SET price = 400000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Шея половина (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yarım boyun (Kişi)'),
      (v_zone_id, 'ru', 'Шея половина (Муж.)'),
      (v_zone_id, 'en', 'Half neck (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Лицо (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Üz (Kişi)'),
      (v_zone_id, 'ru', 'Лицо (Муж.)'),
      (v_zone_id, 'en', 'Face (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Лоб (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Alın (Kişi)'),
      (v_zone_id, 'ru', 'Лоб (Муж.)'),
      (v_zone_id, 'en', 'Forehead (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Усики (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Bığ (Kişi)'),
      (v_zone_id, 'ru', 'Усики (Муж.)'),
      (v_zone_id, 'en', 'Mustache (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Межбровье (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 100000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Qaşarası (Kişi)'),
      (v_zone_id, 'ru', 'Межбровье (Муж.)'),
      (v_zone_id, 'en', 'Unibrow (Men)');
  ELSE
    UPDATE zones SET price = 100000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Подбородок (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 200000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Çənə (Kişi)'),
      (v_zone_id, 'ru', 'Подбородок (Муж.)'),
      (v_zone_id, 'en', 'Chin (Men)');
  ELSE
    UPDATE zones SET price = 200000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Щёки (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 300000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Yanaqlar (Kişi)'),
      (v_zone_id, 'ru', 'Щёки (Муж.)'),
      (v_zone_id, 'en', 'Cheeks (Men)');
  ELSE
    UPDATE zones SET price = 300000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Живот полностью (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 500000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Tam qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот полностью (Муж.)'),
      (v_zone_id, 'en', 'Full abdomen (Men)');
  ELSE
    UPDATE zones SET price = 500000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Живот от лобка до пупка (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Göbəyə qədər qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот от лобка до пупка (Муж.)'),
      (v_zone_id, 'en', 'Lower abdomen to navel (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Живот от лобка до груди (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Köksə qədər qarın (Kişi)'),
      (v_zone_id, 'ru', 'Живот от лобка до груди (Муж.)'),
      (v_zone_id, 'en', 'Abdomen to chest (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Между грудей (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 250000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə arası (Kişi)'),
      (v_zone_id, 'ru', 'Между грудей (Муж.)'),
      (v_zone_id, 'en', 'Between chest (Men)');
  ELSE
    UPDATE zones SET price = 250000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Грудь (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 600000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Sinə (Kişi)'),
      (v_zone_id, 'ru', 'Грудь (Муж.)'),
      (v_zone_id, 'en', 'Chest (Men)');
  ELSE
    UPDATE zones SET price = 600000 WHERE id = v_zone_id;
  END IF;

  SELECT z.id INTO v_zone_id
  FROM zones z
  JOIN zone_translations zt ON zt.zone_id = z.id
  WHERE z.device_id = v_candela_semerqend_id AND zt.name = 'Ареолы (Муж.)' LIMIT 1;
  IF v_zone_id IS NULL THEN
    v_zone_id := gen_random_uuid();
    INSERT INTO zones (id, device_id, price, created_at) VALUES (v_zone_id, v_candela_semerqend_id, 150000, NOW());
    INSERT INTO zone_translations (zone_id, locale, name) VALUES
      (v_zone_id, 'az', 'Gilə ətrafı (Kişi)'),
      (v_zone_id, 'ru', 'Ареолы (Муж.)'),
      (v_zone_id, 'en', 'Areola (Men)');
  ELSE
    UPDATE zones SET price = 150000 WHERE id = v_zone_id;
  END IF;

END $$;
