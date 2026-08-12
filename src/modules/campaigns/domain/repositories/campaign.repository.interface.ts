import { Locale } from '../../../../shared/i18n/locale.enum';
import {
  PaginatedResult,
  PaginationParams,
} from '../../../../shared/pagination/pagination.types';
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
  findByIds(ids: string[]): Promise<Campaign[]>;
  create(data: CreateCampaignData): Promise<Campaign>;
  update(id: string, data: UpdateCampaignData): Promise<Campaign>;
  delete(id: string): Promise<void>;
}
