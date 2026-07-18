import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { Locale } from '../../../../shared/i18n/locale.enum';

export interface PackageTranslation {
  locale: Locale;
  name: string;
}

export class Package extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly price: number,
    public readonly zoneIds: string[],
    public readonly translations: PackageTranslation[] = [],
  ) {
    super(id, createdAt);
  }
}
