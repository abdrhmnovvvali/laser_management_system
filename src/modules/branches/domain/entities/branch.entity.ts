import { BaseEntity } from '../../../../shared/kernel/base.entity';

export class Branch extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly address: string | null,
  ) {
    super(id, createdAt);
  }
}
