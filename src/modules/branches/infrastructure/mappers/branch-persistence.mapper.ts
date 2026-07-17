import { LocaleContext } from '../../../../shared/i18n/locale.context';
import { Locale } from '../../../../shared/i18n/locale.enum';
import {
  pickLocalizedField,
  pickLocalizedName,
} from '../../../../shared/i18n/translation.util';
import { Branch, BranchTranslation } from '../../domain/entities/branch.entity';

export interface BranchTranslationRow {
  locale: Locale;
  name: string;
  address: string | null;
}

export interface BranchRow {
  id: string;
  created_at: string;
  branch_translations?: BranchTranslationRow[] | null;
}

export class BranchPersistenceMapper {
  static toDomain(row: BranchRow): Branch {
    const translations: BranchTranslation[] = (
      row.branch_translations ?? []
    ).map((item) => ({
      locale: item.locale,
      name: item.name,
      address: item.address ?? null,
    }));

    const locale = LocaleContext.getLocale();

    return new Branch(
      row.id,
      new Date(row.created_at),
      pickLocalizedName(translations, locale),
      pickLocalizedField(translations, locale, (item) => item.address),
      translations,
    );
  }
}
