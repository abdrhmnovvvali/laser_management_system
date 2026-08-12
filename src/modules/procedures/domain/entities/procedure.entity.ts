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
    public readonly freeZoneId: string | null = null,
    public readonly discountAmount: number = 0,
    public readonly visitNumber: number | null = null,
    public readonly campaignId: string | null = null,
  ) {
    super(id, createdAt);
  }

  get shotCountDifference(): number {
    return this.actualShotCount - this.declaredShotCount;
  }

  get loyaltyRewardApplied(): boolean {
    return this.freeZoneId !== null && this.discountAmount > 0;
  }

  get originalPrice(): number {
    return this.price + this.discountAmount;
  }
}
