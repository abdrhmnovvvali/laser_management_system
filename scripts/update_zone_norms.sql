-- ==========================================================
-- Nahiyələrə atış sayı və müddət normalarını əlavə et
-- Təkrar işlətmək təhlükəsizdir (idempotent).
-- Supabase SQL Editor və ya psql ilə işə salın.
-- ==========================================================

BEGIN;

-- 1. Sütunlar (yoxdursa yaradılır)
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "min_shots" INTEGER;
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "max_shots" INTEGER;
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "min_duration_minutes" INTEGER;
ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "max_duration_minutes" INTEGER;

ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "duration_min_minutes" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "follow_ups" ADD COLUMN IF NOT EXISTS "duration_max_minutes" INTEGER NOT NULL DEFAULT 30;

-- 2. Normalar (rus adına görə, bütün cihazlarda)
CREATE TEMP TABLE zone_norms_input (
  name TEXT PRIMARY KEY,
  min_shots INTEGER,
  max_shots INTEGER,
  min_duration INTEGER,
  max_duration INTEGER
) ON COMMIT DROP;

INSERT INTO zone_norms_input (name, min_shots, max_shots, min_duration, max_duration) VALUES
  -- Qadın
  ('Ноги',                              1800, 2200, 25, 35),
  ('Ноги половина',                     1000, 1500, 15, 20),
  ('Руки полностью',                     900, 1500, 15, 25),
  ('Руки половина',                      400,  900, 10, 20),
  ('Бикини',                             250,  350, 10, 15),
  ('Подмышки',                            70,  170,  5,  7),
  ('Лицо',                               170,  250,  5, 10),
  ('Лоб',                                 70,  120,  3,  5),
  ('Монобровь',                            8,   12,  3,  5),
  ('Баки',                                70,  130,  3,  7),
  ('Усики',                               10,   25,  3,  5),
  ('Подбородок',                          30,   60,  5,  7),
  ('Шея',                                150,  300,  7, 10),
  ('Шея половина',                        70,  150,  5,  7),
  ('Кисти рук',                          180,  230, 10, 10),
  ('Спина целиком',                     1000, 1800, 20, 25),
  ('Грудь с сосками',                    350,  600, 15, 20),
  ('Живот полностью',                    300,  550, 15, 15),
  ('Живот низ',                          150,  270,  5, 10),
  ('Живот верх',                         130,  250, 10, 10),
  ('Ягодицы',                            300,  600, 15, 15),
  -- Kişi
  ('Ноги полностью (Муж.)',             2200, 3000, 40, 60),
  ('Ноги половина (Муж.)',              1500, 2000, 20, 35),
  ('Пальцы ног (Муж.)',                   35,   70, 10, 10),
  ('Руки полностью (Муж.)',             1400, 2000, 25, 35),
  ('Руки половина (Муж.)',              1000, 1600, 20, 30),
  ('Пальцы рук (Муж.)',                   25,   50,  5, 10),
  ('Бикини (Муж.)',                      300,  400, 15, 15),
  ('Поясница (Муж.)',                    450,  700, 15, 20),
  ('Ягодицы (Муж.)',                     500,  750, 15, 15),
  ('Спина до поясницы (Муж.)',          1500, 1800, 25, 25),
  ('Спина общая (Муж.)',                1600, 2200, 30, 40),
  ('Плечи (Муж.)',                       350,  500, 15, 15),
  ('Подмышки (Муж.)',                    100,  200,  5,  5),
  ('Шея полностью (Муж.)',               350,  500, 10, 10),
  ('Шея половина (Муж.)',                250,  300,  5,  5),
  ('Лицо (Муж.)',                        300,  500, 10, 10),
  ('Лоб (Муж.)',                         100,  150,  5,  5),
  ('Усики (Муж.)',                        50,   80,  5,  5),
  ('Межбровье (Муж.)',                    15,   25,  3,  3),
  ('Межбrovье (Муж.)',                    15,   25,  3,  3), -- seed-dəki yazılış
  ('Подбородок (Муж.)',                  130,  200,  5,  5),
  ('Щёки (Муж.)',                        150,  200, 10, 10),
  ('Живот полностью (Муж.)',             450,  600, 15, 15),
  ('Живот от лобка до пупка (Муж.)',     350,  500, 10, 13),
  ('Живот от лобка до груди (Муж.)',     350,  500, 10, 13),
  ('Между грудей (Муж.)',                200,  350, 10, 10),
  ('Грудь (Муж.)',                       600, 1100, 15, 20),
  ('Ареолы (Муж.)',                      100,  130,  5,  5);

UPDATE "zones" z
SET "min_shots"            = v.min_shots,
    "max_shots"            = v.max_shots,
    "min_duration_minutes" = v.min_duration,
    "max_duration_minutes" = v.max_duration
FROM zone_norms_input v
JOIN "zone_translations" zt
  ON zt."locale" = 'ru' AND lower(trim(zt."name")) = lower(trim(v.name))
WHERE z."id" = zt."zone_id";

-- 3. Mövcud gözləmədə olan rezervasiyaların müddətini nahiyələrə görə yenilə
UPDATE "follow_ups" fu
SET "duration_min_minutes" = s.min_total,
    "duration_max_minutes" = GREATEST(s.min_total, s.max_total)
FROM (
  SELECT fuz."follow_up_id",
         SUM(COALESCE(z."min_duration_minutes", z."max_duration_minutes", 0)) AS min_total,
         SUM(COALESCE(z."max_duration_minutes", z."min_duration_minutes", 0)) AS max_total
  FROM "follow_up_zones" fuz
  JOIN "zones" z ON z."id" = fuz."zone_id"
  GROUP BY fuz."follow_up_id"
) s
WHERE fu."id" = s."follow_up_id" AND s.min_total > 0;

-- 4. Hesabat: bazada tapılmayan adlar
SELECT v.name AS "tapılmayan nahiyə"
FROM zone_norms_input v
WHERE NOT EXISTS (
  SELECT 1 FROM "zone_translations" zt
  WHERE zt."locale" = 'ru' AND lower(trim(zt."name")) = lower(trim(v.name))
);

COMMIT;

-- Yoxlama:
-- SELECT zt.name, z.min_shots, z.max_shots, z.min_duration_minutes, z.max_duration_minutes
-- FROM zones z JOIN zone_translations zt ON zt.zone_id = z.id AND zt.locale = 'ru'
-- ORDER BY zt.name;
