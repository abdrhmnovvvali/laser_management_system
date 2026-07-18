import { LocaleContext } from '../../../../shared/i18n/locale.context';
import { Locale } from '../../../../shared/i18n/locale.enum';
import {
  pickLocalizedField,
  pickLocalizedName,
} from '../../../../shared/i18n/translation.util';
import {
  Campaign,
  CampaignTranslation,
} from '../../domain/entities/campaign.entity';
import { DiscountType } from '../../domain/entities/discount-type.enum';

export interface CampaignTranslationRow {
  locale: Locale;
  name: string;
  description: string | null;
}

export interface CampaignRow {
  id: string;
  discount_type: DiscountType;
  discount_value: number;
  start_date: string;
  end_date: string;
  created_at: string;
  campaign_translations?: CampaignTranslationRow[] | null;
  campaign_zones?: { zone_id: string }[] | null;
}

export class CampaignPersistenceMapper {
  static toDomain(row: CampaignRow): Campaign {
    const translations: CampaignTranslation[] = (
      row.campaign_translations ?? []
    ).map((item) => ({
      locale: item.locale,
      name: item.name,
      description: item.description ?? null,
    }));

    const locale = LocaleContext.getLocale();

    return new Campaign(
      row.id,
      new Date(row.created_at),
      pickLocalizedName(translations, locale),
      pickLocalizedField(translations, locale, (item) => item.description),
      row.discount_type,
      Number(row.discount_value),
      new Date(row.start_date),
      new Date(row.end_date),
      (row.campaign_zones ?? []).map((cz) => cz.zone_id),
      translations,
    );
  }
}
