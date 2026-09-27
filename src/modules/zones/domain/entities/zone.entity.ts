import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { Locale } from '../../../../shared/i18n/locale.enum';

export interface ZoneTranslation {
  locale: Locale;
  name: string;
}

/** Bir seans üçün atış sayı və müddət normaları (hamısı istəyə bağlı). */
export interface ZoneNorms {
  minShots: number | null;
  maxShots: number | null;
  minDurationMinutes: number | null;
  maxDurationMinutes: number | null;
}

export const EMPTY_ZONE_NORMS: ZoneNorms = {
  minShots: null,
  maxShots: null,
  minDurationMinutes: null,
  maxDurationMinutes: null,
};

export class Zone extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly deviceId: string,
    public readonly price: number,
    public readonly translations: ZoneTranslation[] = [],
    public readonly norms: ZoneNorms = EMPTY_ZONE_NORMS,
  ) {
    super(id, createdAt);
  }
}
