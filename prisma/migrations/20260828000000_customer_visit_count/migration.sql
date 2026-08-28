-- Add visit_count to customers
ALTER TABLE "customers" ADD COLUMN "visit_count" INTEGER NOT NULL DEFAULT 0;
