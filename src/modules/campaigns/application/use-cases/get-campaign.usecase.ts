import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type { ICampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { Campaign } from '../../domain/entities/campaign.entity';

@Injectable()
export class GetCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      throw new EntityNotFoundException('Campaign', id);
    }
    return campaign;
  }
}
