import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type { ICampaignRepository } from '../../domain/repositories/campaign.repository.interface';

@Injectable()
export class DeleteCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.campaignRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Campaign', id);
    }
    await this.campaignRepository.delete(id);
  }
}
