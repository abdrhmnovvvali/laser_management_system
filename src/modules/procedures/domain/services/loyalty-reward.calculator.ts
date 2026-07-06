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
  ): LoyaltyRewardResult {
    const visitNumber = completedVisitCount + 1;
    const noReward: LoyaltyRewardResult = {
      applies: false,
      visitNumber,
      freeZoneId: null,
      discountAmount: 0,
      finalPrice: basePrice,
    };

    if (
      !this.isRewardVisit(completedVisitCount, config) ||
      zones.length === 0 ||
      basePrice <= 0
    ) {
      return noReward;
    }

    const freeZone = zones.reduce((cheapest, zone) =>
      zone.price < cheapest.price ? zone : cheapest,
    );
    const discountAmount = Math.min(freeZone.price, basePrice);

    return {
      applies: true,
      visitNumber,
      freeZoneId: freeZone.id,
      discountAmount,
      finalPrice: basePrice - discountAmount,
    };
  }
}
