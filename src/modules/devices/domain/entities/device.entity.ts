import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { Locale } from '../../../../shared/i18n/locale.enum';

export interface DeviceTranslation {
  locale: Locale;
  type: string;
}

export class Device extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly branchId: string,
    public readonly type: string,
    public readonly shotCounter: number,
    public readonly translations: DeviceTranslation[] = [],
  ) {
    super(id, createdAt);
  }
}
