import { DiscountType } from '../../../campaigns/domain/entities/discount-type.enum';
import type { Campaign } from '../../../campaigns/domain/entities/campaign.entity';

export function calculateCampaignDiscount(
  basePrice: number,
  campaign: Campaign,
): number {
  if (basePrice <= 0) {
    return 0;
  }

  if (campaign.discountType === DiscountType.PERCENTAGE) {
    return Math.min(
      basePrice,
      Number(((basePrice * campaign.discountValue) / 100).toFixed(2)),
    );
  }

  return Math.min(basePrice, campaign.discountValue);
}
