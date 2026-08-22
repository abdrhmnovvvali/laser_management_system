-- Follow-up → rezervasiya: cihaz, saat, slot unikallığı
ALTER TABLE "follow_ups" ADD COLUMN "device_id" UUID;
ALTER TABLE "follow_ups" ADD COLUMN "planned_time" VARCHAR(5);

-- Mövcud qeydlər: nahiyədən və ya müştərinin filialındakı ilk cihazdan device_id
UPDATE "follow_ups" fu
SET "device_id" = COALESCE(
  (
    SELECT z."device_id"
    FROM "follow_up_zones" fuz
    JOIN "zones" z ON z."id" = fuz."zone_id"
    WHERE fuz."follow_up_id" = fu."id"
    LIMIT 1
  ),
  (
    SELECT d."id"
    FROM "customers" c
    JOIN "devices" d ON d."branch_id" = c."branch_id"
    WHERE c."id" = fu."customer_id"
    ORDER BY d."created_at"
    LIMIT 1
  )
);

UPDATE "follow_ups"
SET "planned_time" = '09:00'
WHERE "planned_time" IS NULL;

ALTER TABLE "follow_ups" ALTER COLUMN "device_id" SET NOT NULL;
ALTER TABLE "follow_ups" ALTER COLUMN "planned_time" SET NOT NULL;

ALTER TABLE "follow_ups"
  ADD CONSTRAINT "follow_ups_device_id_fkey"
  FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "follow_ups_device_id_idx" ON "follow_ups"("device_id");
CREATE INDEX "follow_ups_planned_date_planned_time_idx" ON "follow_ups"("planned_date", "planned_time");

-- Eyni cihaz + gün + saat üçün yalnız bir pending rezervasiya
CREATE UNIQUE INDEX "follow_ups_pending_slot_unique"
  ON "follow_ups" ("device_id", "planned_date", "planned_time")
  WHERE "status" = 'pending';
