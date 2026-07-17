import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { Locale } from '../../../../shared/i18n/locale.enum';
import { DiscountType } from './discount-type.enum';

export interface CampaignTranslation {
  locale: Locale;
  name: string;
  description: string | null;
}

export class Campaign extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly description: string | null,
    public readonly discountType: DiscountType,
    public readonly discountValue: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly zoneIds: string[],
    public readonly translations: CampaignTranslation[] = [],
  ) {
    super(id, createdAt);
  }

  isActiveOn(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}
