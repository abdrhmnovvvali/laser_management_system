-- İşçi hesablarını silmədən deaktiv etmək üçün
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
