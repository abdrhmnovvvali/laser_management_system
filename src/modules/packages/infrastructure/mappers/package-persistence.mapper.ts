import { LocaleContext } from '../../../../shared/i18n/locale.context';
import { Locale } from '../../../../shared/i18n/locale.enum';
import { pickLocalizedName } from '../../../../shared/i18n/translation.util';
import {
  Package,
  PackageTranslation,
} from '../../domain/entities/package.entity';

export interface PackageTranslationRow {
  locale: Locale;
  name: string;
}

export interface PackageRow {
  id: string;
  price: number;
  created_at: string;
  package_translations?: PackageTranslationRow[] | null;
  package_zones: { zone_id: string }[] | null;
}

export class PackagePersistenceMapper {
  static toDomain(row: PackageRow): Package {
    const translations: PackageTranslation[] = (
      row.package_translations ?? []
    ).map((item) => ({
      locale: item.locale,
      name: item.name,
    }));

    return new Package(
      row.id,
      new Date(row.created_at),
      pickLocalizedName(translations, LocaleContext.getLocale()),
      Number(row.price),
      (row.package_zones ?? []).map((pz) => pz.zone_id),
      translations,
    );
  }
}
