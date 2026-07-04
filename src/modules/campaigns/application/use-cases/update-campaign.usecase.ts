import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '../../../../shared/kernel/domain.exception';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type {
  ICampaignRepository,
  UpdateCampaignData,
} from '../../domain/repositories/campaign.repository.interface';
import { Campaign } from '../../domain/entities/campaign.entity';

@Injectable()
export class UpdateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const existing = await this.campaignRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Campaign', id);
    }

    const startDate = data.startDate ?? existing.startDate;
    const endDate = data.endDate ?? existing.endDate;
    if (endDate < startDate) {
      throw new BusinessRuleViolationException(
        'endDate startDate-dan əvvəl ola bilməz',
      );
    }

    return this.campaignRepository.update(id, data);
  }
}
