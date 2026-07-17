import { Locale } from '../../../../shared/i18n/locale.enum';
import { Campaign } from '../entities/campaign.entity';
import { DiscountType } from '../entities/discount-type.enum';

export const CAMPAIGN_REPOSITORY = Symbol('ICampaignRepository');

export interface CampaignTranslationInput {
  locale: Locale;
  name: string;
  description?: string | null;
}

export interface CreateCampaignData {
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
  zoneIds: string[];
  translations: CampaignTranslationInput[];
}

export interface UpdateCampaignData {
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
  zoneIds?: string[];
  translations?: CampaignTranslationInput[];
}

export interface ICampaignRepository {
  findAll(): Promise<Campaign[]>;
  findActive(onDate: Date): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign | null>;
  create(data: CreateCampaignData): Promise<Campaign>;
  update(id: string, data: UpdateCampaignData): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
