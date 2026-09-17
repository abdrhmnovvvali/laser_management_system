-- ===========================================================================
-- Telefon nömrəsi olmayan müştəriləri silir.
--
-- DİQQƏT — bu əməliyyat geri qaytarıla bilməz. Müştəri ilə birlikdə onun
-- bütün əlaqəli qeydləri də silinir (ON DELETE CASCADE):
--   • procedures      (vizit tarixçəsi) → procedure_zones
--   • notes           (qeydlər)
--   • follow_ups      (izləmələr)       → follow_up_zones
--   • notifications   (bildirişlər)
-- İşə salmazdan əvvəl mütləq backup al:
--   pg_dump "<DATABASE_URL>" > ~/lazer-backup-$(date +%F).sql
--
-- İstifadə:
--   psql "<DATABASE_URL>" -f scripts/delete-customers-without-phone.sql
--
-- "Nömrəsi yoxdur" sayılan hallar: NULL, boş sətir, yalnız boşluq, "-" və "+".
-- ===========================================================================

\set ON_ERROR_STOP on

BEGIN;

-- Silinəcək müştərilər bir dəfə seçilir ki, hesabat və silmə eyni siyahı üzrə getsin.
CREATE TEMP TABLE doomed_customers ON COMMIT DROP AS
SELECT id
FROM customers
WHERE phone IS NULL
   OR btrim(phone) IN ('', '-', '+');

-- Silinmədən əvvəl nəyin gedəcəyini göstərir.
SELECT
  (SELECT count(*) FROM doomed_customers) AS silinecek_musteri,
  (SELECT count(*) FROM procedures p
     JOIN doomed_customers d ON d.id = p.customer_id) AS silinecek_prosedur,
  (SELECT count(*) FROM notes n
     JOIN doomed_customers d ON d.id = n.customer_id) AS silinecek_qeyd,
  (SELECT count(*) FROM follow_ups f
     JOIN doomed_customers d ON d.id = f.customer_id) AS silinecek_izleme,
  (SELECT count(*) FROM notifications nt
     JOIN doomed_customers d ON d.id = nt.customer_id) AS silinecek_bildiris;

DELETE FROM customers c
USING doomed_customers d
WHERE c.id = d.id;

-- Silmədən sonra qalan vəziyyət.
SELECT
  count(*) AS qalan_musteri,
  count(*) FILTER (
    WHERE phone IS NULL OR btrim(phone) IN ('', '-', '+')
  ) AS qalan_nomresiz
FROM customers;

COMMIT;
