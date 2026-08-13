-- CreateSchema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'branch_staff');
CREATE TYPE "Gender" AS ENUM ('female', 'male', 'other');
CREATE TYPE "Locale" AS ENUM ('az', 'en', 'ru');
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed');
CREATE TYPE "NoteType" AS ENUM ('call', 'social', 'in_person');
CREATE TYPE "FollowUpStatus" AS ENUM ('pending', 'done', 'missed');
CREATE TYPE "NotificationType" AS ENUM ('birthday', 'fraud', 'follow_up');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "branch_id" UUID,
    "full_name" TEXT,
    "refresh_token_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_translations" (
    "branch_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    CONSTRAINT "branch_translations_pkey" PRIMARY KEY ("branch_id","locale")
);

CREATE TABLE "devices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "shot_counter" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "device_translations" (
    "device_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "device_translations_pkey" PRIMARY KEY ("device_id","locale")
);

CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "birth_date" DATE,
    "gender" "Gender",
    "branch_id" UUID NOT NULL,
    "registered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "device_id" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zone_translations" (
    "zone_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "zone_translations_pkey" PRIMARY KEY ("zone_id","locale")
);

CREATE TABLE "packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "package_translations" (
    "package_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "package_translations_pkey" PRIMARY KEY ("package_id","locale")
);

CREATE TABLE "package_zones" (
    "package_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    CONSTRAINT "package_zones_pkey" PRIMARY KEY ("package_id","zone_id")
);

CREATE TABLE "campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "chk_campaign_date_range" CHECK ("end_date" >= "start_date")
);

CREATE TABLE "campaign_translations" (
    "campaign_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "campaign_translations_pkey" PRIMARY KEY ("campaign_id","locale")
);

CREATE TABLE "campaign_zones" (
    "campaign_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    CONSTRAINT "campaign_zones_pkey" PRIMARY KEY ("campaign_id","zone_id")
);

CREATE TABLE "procedures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "package_id" UUID,
    "campaign_id" UUID,
    "date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "declared_shot_count" INTEGER NOT NULL,
    "actual_shot_count" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "free_zone_id" UUID,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "visit_number" INTEGER,
    "shot_count_difference" INTEGER GENERATED ALWAYS AS ("actual_shot_count" - "declared_shot_count") STORED,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "procedures_declared_shot_count_check" CHECK ("declared_shot_count" >= 0),
    CONSTRAINT "procedures_actual_shot_count_check" CHECK ("actual_shot_count" >= 0),
    CONSTRAINT "procedures_price_check" CHECK ("price" >= 0),
    CONSTRAINT "procedures_discount_amount_check" CHECK ("discount_amount" >= 0),
    CONSTRAINT "procedures_visit_number_check" CHECK ("visit_number" IS NULL OR "visit_number" > 0)
);

CREATE TABLE "procedure_zones" (
    "procedure_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    CONSTRAINT "procedure_zones_pkey" PRIMARY KEY ("procedure_id","zone_id")
);

CREATE TABLE "notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" UUID NOT NULL,
    "type" "NoteType" NOT NULL,
    "content" TEXT NOT NULL,
    "outcome" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "follow_ups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "customer_id" UUID NOT NULL,
    "planned_date" DATE NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "follow_up_zones" (
    "follow_up_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    CONSTRAINT "follow_up_zones_pkey" PRIMARY KEY ("follow_up_id","zone_id")
);

CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "NotificationType" NOT NULL,
    "customer_id" UUID,
    "procedure_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_translations" (
    "notification_id" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "message" TEXT NOT NULL,
    CONSTRAINT "notification_translations_pkey" PRIMARY KEY ("notification_id","locale")
);

-- Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_branch_id_idx" ON "users"("branch_id");
CREATE INDEX "branch_translations_locale_idx" ON "branch_translations"("locale");
CREATE INDEX "devices_branch_id_idx" ON "devices"("branch_id");
CREATE INDEX "device_translations_locale_idx" ON "device_translations"("locale");
CREATE INDEX "customers_branch_id_idx" ON "customers"("branch_id");
CREATE INDEX "customers_phone_idx" ON "customers"("phone");
CREATE INDEX "customers_birth_date_idx" ON "customers"("birth_date");
CREATE INDEX "zones_device_id_idx" ON "zones"("device_id");
CREATE INDEX "zone_translations_locale_idx" ON "zone_translations"("locale");
CREATE INDEX "zone_translations_name_idx" ON "zone_translations"("name");
CREATE INDEX "package_translations_locale_idx" ON "package_translations"("locale");
CREATE INDEX "package_zones_zone_id_idx" ON "package_zones"("zone_id");
CREATE INDEX "campaigns_start_date_end_date_idx" ON "campaigns"("start_date", "end_date");
CREATE INDEX "campaign_translations_locale_idx" ON "campaign_translations"("locale");
CREATE INDEX "campaign_zones_zone_id_idx" ON "campaign_zones"("zone_id");
CREATE INDEX "procedures_customer_id_idx" ON "procedures"("customer_id");
CREATE INDEX "procedures_device_id_idx" ON "procedures"("device_id");
CREATE INDEX "procedures_date_idx" ON "procedures"("date");
CREATE INDEX "procedures_shot_count_difference_idx" ON "procedures"("shot_count_difference");
CREATE INDEX "procedures_price_idx" ON "procedures"("price");
CREATE INDEX "procedures_package_id_idx" ON "procedures"("package_id");
CREATE INDEX "procedures_visit_number_idx" ON "procedures"("visit_number");
CREATE INDEX "procedures_campaign_id_idx" ON "procedures"("campaign_id");
CREATE INDEX "procedure_zones_zone_id_idx" ON "procedure_zones"("zone_id");
CREATE INDEX "notes_customer_id_idx" ON "notes"("customer_id");
CREATE INDEX "follow_ups_customer_id_idx" ON "follow_ups"("customer_id");
CREATE INDEX "follow_ups_planned_date_idx" ON "follow_ups"("planned_date");
CREATE INDEX "follow_ups_status_idx" ON "follow_ups"("status");
CREATE INDEX "follow_up_zones_zone_id_idx" ON "follow_up_zones"("zone_id");
CREATE INDEX "notifications_customer_id_idx" ON "notifications"("customer_id");
CREATE INDEX "notifications_type_idx" ON "notifications"("type");
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX "notifications_procedure_id_idx" ON "notifications"("procedure_id");
CREATE INDEX "notification_translations_locale_idx" ON "notification_translations"("locale");

-- ForeignKeys
ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "branch_translations" ADD CONSTRAINT "branch_translations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "device_translations" ADD CONSTRAINT "device_translations_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "zones" ADD CONSTRAINT "zones_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "zone_translations" ADD CONSTRAINT "zone_translations_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "package_translations" ADD CONSTRAINT "package_translations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "package_zones" ADD CONSTRAINT "package_zones_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "package_zones" ADD CONSTRAINT "package_zones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_translations" ADD CONSTRAINT "campaign_translations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_zones" ADD CONSTRAINT "campaign_zones_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campaign_zones" ADD CONSTRAINT "campaign_zones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_free_zone_id_fkey" FOREIGN KEY ("free_zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "procedure_zones" ADD CONSTRAINT "procedure_zones_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "procedure_zones" ADD CONSTRAINT "procedure_zones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follow_up_zones" ADD CONSTRAINT "follow_up_zones_follow_up_id_fkey" FOREIGN KEY ("follow_up_id") REFERENCES "follow_ups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follow_up_zones" ADD CONSTRAINT "follow_up_zones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notification_translations" ADD CONSTRAINT "notification_translations_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Views
CREATE OR REPLACE VIEW "todays_birthdays_view" AS
SELECT
  id,
  first_name,
  last_name,
  branch_id,
  birth_date
FROM "customers"
WHERE
  birth_date IS NOT NULL
  AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM timezone('Asia/Baku', now())::date)
  AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM timezone('Asia/Baku', now())::date);

CREATE OR REPLACE VIEW "fraud_report_view" AS
SELECT
  p.id,
  p.device_id,
  p.declared_shot_count,
  p.actual_shot_count,
  p.date,
  c.id AS customer_id,
  c.branch_id
FROM "procedures" p
JOIN "customers" c ON c.id = p.customer_id
WHERE p.actual_shot_count <> p.declared_shot_count;

-- Functions
CREATE OR REPLACE FUNCTION public.increment_device_shot_counter(
  p_device_id uuid,
  p_amount integer
)
RETURNS public.devices
LANGUAGE plpgsql
AS $$
DECLARE
  updated_device public.devices;
BEGIN
  UPDATE public.devices
  SET shot_counter = shot_counter + p_amount
  WHERE id = p_device_id
  RETURNING * INTO updated_device;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Device % not found', p_device_id;
  END IF;

  RETURN updated_device;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_type text,
  p_customer_id uuid,
  p_procedure_id uuid,
  p_messages jsonb
)
RETURNS public.notifications
LANGUAGE plpgsql
AS $$
DECLARE
  created_notification public.notifications;
  locale_key text;
  locale_message text;
BEGIN
  IF p_type NOT IN ('birthday', 'fraud', 'follow_up') THEN
    RAISE EXCEPTION 'Invalid notification type: %', p_type;
  END IF;

  IF p_messages IS NULL OR jsonb_typeof(p_messages) <> 'object' THEN
    RAISE EXCEPTION 'p_messages must be a JSON object of locale -> message';
  END IF;

  IF NOT (p_messages ? 'az' AND p_messages ? 'en' AND p_messages ? 'ru') THEN
    RAISE EXCEPTION 'p_messages must include az, en and ru';
  END IF;

  INSERT INTO public.notifications (type, customer_id, procedure_id, is_read)
  VALUES (p_type::"NotificationType", p_customer_id, p_procedure_id, false)
  RETURNING * INTO created_notification;

  FOR locale_key, locale_message IN
    SELECT key, value FROM jsonb_each_text(p_messages)
  LOOP
    IF locale_key NOT IN ('az', 'en', 'ru') THEN
      RAISE EXCEPTION 'Invalid notification locale: %', locale_key;
    END IF;

    IF locale_message IS NULL OR btrim(locale_message) = '' THEN
      RAISE EXCEPTION 'Empty notification message for locale: %', locale_key;
    END IF;

    INSERT INTO public.notification_translations (notification_id, locale, message)
    VALUES (created_notification.id, locale_key::"Locale", locale_message);
  END LOOP;

  RETURN created_notification;
END;
$$;
