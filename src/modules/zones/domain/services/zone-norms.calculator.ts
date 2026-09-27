import { ZoneNorms } from '../entities/zone.entity';

export interface ZoneNormsTotal {
  minShots: number;
  maxShots: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
}

/**
 * Seçilmiş nahiyələrin normalarını toplayır. Aralığın yalnız bir ucu verilibsə,
 * o biri də həmin dəyər sayılır; norması olmayan nahiyə cəmə 0 əlavə edir.
 */
export function sumZoneNorms(norms: ZoneNorms[]): ZoneNormsTotal {
  return norms.reduce<ZoneNormsTotal>(
    (total, item) => ({
      minShots: total.minShots + (item.minShots ?? item.maxShots ?? 0),
      maxShots: total.maxShots + (item.maxShots ?? item.minShots ?? 0),
      minDurationMinutes:
        total.minDurationMinutes +
        (item.minDurationMinutes ?? item.maxDurationMinutes ?? 0),
      maxDurationMinutes:
        total.maxDurationMinutes +
        (item.maxDurationMinutes ?? item.minDurationMinutes ?? 0),
    }),
    { minShots: 0, maxShots: 0, minDurationMinutes: 0, maxDurationMinutes: 0 },
  );
}

/** min > max olarsa xəta mesajı qaytarır (hər iki uc verildikdə). */
export function findZoneNormsRangeError(norms: Partial<ZoneNorms>): string | null {
  if (
    norms.minShots != null &&
    norms.maxShots != null &&
    norms.minShots > norms.maxShots
  ) {
    return 'Minimum atış sayı maksimumdan çox ola bilməz';
  }
  if (
    norms.minDurationMinutes != null &&
    norms.maxDurationMinutes != null &&
    norms.minDurationMinutes > norms.maxDurationMinutes
  ) {
    return 'Minimum müddət maksimumdan çox ola bilməz';
  }
  return null;
}
