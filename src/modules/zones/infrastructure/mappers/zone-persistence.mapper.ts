import { LocaleContext } from '../../../../shared/i18n/locale.context';
import { Locale } from '../../../../shared/i18n/locale.enum';
import { pickLocalizedName } from '../../../../shared/i18n/translation.util';
import { Zone, ZoneTranslation } from '../../domain/entities/zone.entity';

export interface ZoneTranslationRow {
  locale: Locale;
  name: string;
}

export interface ZoneRow {
  id: string;
  device_id: string;
  price: number;
  created_at: string;
  zone_translations?: ZoneTranslationRow[] | null;
}

export class ZonePersistenceMapper {
  static toDomain(row: ZoneRow): Zone {
    const translations: ZoneTranslation[] = (row.zone_translations ?? []).map(
      (item) => ({
        locale: item.locale,
        name: item.name,
      }),
    );

    return new Zone(
      row.id,
      new Date(row.created_at),
      pickLocalizedName(translations, LocaleContext.getLocale()),
      row.device_id,
      Number(row.price),
      translations,
    );
  }
}
