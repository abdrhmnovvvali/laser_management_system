import { Campaign } from '../entities/campaign.entity';
import { DiscountType } from '../entities/discount-type.enum';

export const CAMPAIGN_REPOSITORY = Symbol('ICampaignRepository');

export interface CreateCampaignData {
  name: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  endDate: Date;
}

export interface UpdateCampaignData {
  name?: string;
  description?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ICampaignRepository {
  findAll(): Promise<Campaign[]>;
  findActive(onDate: Date): Promise<Campaign[]>;
  findById(id: string): Promise<Campaign | null>;
  create(data: CreateCampaignData): Promise<Campaign>;
  update(id: string, data: UpdateCampaignData): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
