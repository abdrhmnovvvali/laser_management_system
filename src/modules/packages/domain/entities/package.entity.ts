import { BaseEntity } from '../../../../shared/kernel/base.entity';

export class Package extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly name: string,
    public readonly price: number,
    public readonly zoneIds: string[],
  ) {
    super(id, createdAt);
  }
}
