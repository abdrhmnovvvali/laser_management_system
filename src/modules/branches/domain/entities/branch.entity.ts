import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { Locale } from '../../../../shared/i18n/locale.enum';

export interface BranchTranslation {
  locale: Locale;
  name: string;
  address: string | null;
}

export class Branch extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly address: string | null,
    public readonly translations: BranchTranslation[] = [],
  ) {
    super(id, createdAt);
  }
}
