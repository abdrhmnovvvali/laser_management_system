export interface LoyaltyConfig {
  /** 6 o deməkdir ki, 7-ci, 14-cü, 21-ci vizitlərdə bir nahiyə pulsuzdur. */
  visitsBeforeFreeZone: number;
}

export interface ZonePrice {
  id: string;
  price: number;
}

export interface LoyaltyRewardResult {
  applies: boolean;
  visitNumber: number;
  freeZoneId: string | null;
  discountAmount: number;
  finalPrice: number;
}

export class LoyaltyRewardCalculator {
  static isRewardVisit(
    completedVisitCount: number,
    config: LoyaltyConfig,
  ): boolean {
    if (config.visitsBeforeFreeZone <= 0) {
      return false;
    }

    const nextVisitNumber = completedVisitCount + 1;
    const interval = config.visitsBeforeFreeZone + 1;
    return nextVisitNumber % interval === 0;
  }

  static apply(
    basePrice: number,
    zones: ZonePrice[],
    completedVisitCount: number,
    config: LoyaltyConfig,
    explicitFreeZoneId?: string | null,
  ): LoyaltyRewardResult {
    const visitNumber = completedVisitCount + 1;
    const isReward = this.isRewardVisit(completedVisitCount, config);

    if (!isReward || zones.length === 0) {
      return {
        applies: false,
        visitNumber,
        freeZoneId: null,
        discountAmount: 0,
        finalPrice: basePrice,
      };
    }

    let freeZone: ZonePrice | undefined;
    if (explicitFreeZoneId) {
      freeZone = zones.find((z) => z.id === explicitFreeZoneId);
    }

    if (!freeZone && zones.length >= 2) {
      freeZone = zones.reduce((cheapest, zone) =>
        zone.price < cheapest.price ? zone : cheapest,
      );
    }

    if (!freeZone) {
      return {
        applies: false,
        visitNumber,
        freeZoneId: null,
        discountAmount: 0,
        finalPrice: basePrice,
      };
    }

    const discountAmount = Math.min(freeZone.price, basePrice);

    return {
      applies: true,
      visitNumber,
      freeZoneId: freeZone.id,
      discountAmount,
      finalPrice: Math.max(0, basePrice - discountAmount),
    };
  }
}
