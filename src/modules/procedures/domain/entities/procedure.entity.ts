import { BaseEntity } from '../../../../shared/kernel/base.entity';

export class Procedure extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly customerId: string,
    public readonly deviceId: string,
    public readonly packageId: string | null,
    public readonly date: Date,
    public readonly declaredShotCount: number,
    public readonly actualShotCount: number,
    public readonly price: number,
    public readonly zoneIds: string[],
  ) {
    super(id, createdAt);
  }

  get shotCountDifference(): number {
    return this.actualShotCount - this.declaredShotCount;
  }
}
