import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type { ICampaignRepository } from '../../domain/repositories/campaign.repository.interface';
import { Campaign } from '../../domain/entities/campaign.entity';

@Injectable()
export class ListCampaignsUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(): Promise<Campaign[]> {
    return this.campaignRepository.findAll();
  }
}
