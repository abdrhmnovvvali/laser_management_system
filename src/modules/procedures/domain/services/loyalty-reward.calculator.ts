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

  /**
   * Loyallıq endirimi yalnız explicit `freeZoneId` ilə tətbiq olunur.
   * Avtomatik zona seçimi yoxdur — frontend hansı nahiyənin pulsuz olduğunu göndərməlidir.
   */
  static apply(
    basePrice: number,
    zones: ZonePrice[],
    completedVisitCount: number,
    config: LoyaltyConfig,
    explicitFreeZoneId?: string | null,
  ): LoyaltyRewardResult {
    const visitNumber = completedVisitCount + 1;
    const isReward = this.isRewardVisit(completedVisitCount, config);

    if (!isReward || zones.length === 0 || !explicitFreeZoneId) {
      return {
        applies: false,
        visitNumber,
        freeZoneId: null,
        discountAmount: 0,
        finalPrice: basePrice,
      };
    }

    const freeZone = zones.find((z) => z.id === explicitFreeZoneId);
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
