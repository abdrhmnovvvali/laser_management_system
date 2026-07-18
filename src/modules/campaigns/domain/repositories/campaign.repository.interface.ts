import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
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
  zoneIds: string[];
}

export interface UpdateCampaignData {
  name?: string;
  description?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
  zoneIds?: string[];
}

export interface CampaignListOptions {
  pagination?: PaginationParams;
}

export interface ICampaignRepository {
  findAll(options?: CampaignListOptions): Promise<PaginatedResult<Campaign>>;
  findActive(
    onDate: Date,
    options?: CampaignListOptions,
  ): Promise<PaginatedResult<Campaign>>;
  findById(id: string): Promise<Campaign | null>;
  create(data: CreateCampaignData): Promise<Campaign>;
  update(id: string, data: UpdateCampaignData): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
