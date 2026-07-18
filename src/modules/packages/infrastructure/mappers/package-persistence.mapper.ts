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
<<<<<<< HEAD
  package_zones?: { zone_id: string }[] | null;
}

export class PackagePersistenceMapper {
  static toDomain(row: PackageRow, zoneIds?: string[]): Package {
=======
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

>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
    return new Package(
      row.id,
      new Date(row.created_at),
      pickLocalizedName(translations, LocaleContext.getLocale()),
      Number(row.price),
<<<<<<< HEAD
      zoneIds ?? (row.package_zones ?? []).map((pz) => pz.zone_id),
=======
      (row.package_zones ?? []).map((pz) => pz.zone_id),
      translations,
>>>>>>> 80ddb3102ee20dc76ff001d21e3d31a4df66d599
    );
  }
}
