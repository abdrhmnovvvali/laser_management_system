import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { Locale } from '../../../../shared/i18n/locale.enum';

export interface ZoneTranslation {
  locale: Locale;
  name: string;
}

export class Zone extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly deviceId: string,
    public readonly price: number,
    public readonly translations: ZoneTranslation[] = [],
  ) {
    super(id, createdAt);
  }
}
