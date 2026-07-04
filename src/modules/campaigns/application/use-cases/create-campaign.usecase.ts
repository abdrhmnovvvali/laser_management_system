import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type {
  CreateCampaignData,
  ICampaignRepository,
} from '../../domain/repositories/campaign.repository.interface';
import { Campaign } from '../../domain/entities/campaign.entity';

@Injectable()
export class CreateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(data: CreateCampaignData): Promise<Campaign> {
    if (data.endDate < data.startDate) {
      throw new BusinessRuleViolationException(
        'endDate startDate-dan əvvəl ola bilməz',
      );
    }
    return this.campaignRepository.create(data);
  }
}
