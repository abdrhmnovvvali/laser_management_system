import { Inject, Injectable } from '@nestjs/common';
import { uniqueIds } from '../../../shared/relations/relation-name.util';
import { Campaign } from '../domain/entities/campaign.entity';
import { CAMPAIGN_REPOSITORY } from '../domain/repositories/campaign.repository.interface';
import type { ICampaignRepository } from '../domain/repositories/campaign.repository.interface';
import { GetCampaignUseCase } from './use-cases/get-campaign.usecase';
import { ListActiveCampaignsUseCase } from './use-cases/list-active-campaigns.usecase';

/**
 * Public surface for other modules (Dashboard, Procedure) needing read access
 * to campaign data without depending on CampaignModule's internals.
 */
@Injectable()
export class CampaignFacade {
  constructor(
    private readonly getCampaignUseCase: GetCampaignUseCase,
    private readonly listActiveCampaignsUseCase: ListActiveCampaignsUseCase,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async getById(id: string): Promise<Campaign> {
    return this.getCampaignUseCase.execute(id);
  }

  async listActive(): Promise<Campaign[]> {
    const result = await this.listActiveCampaignsUseCase.execute(undefined, {
      skipPagination: true,
    });
    return result.items;
  }

  async resolveNames(
    campaignIds: Iterable<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const ids = uniqueIds(campaignIds);
    if (ids.length === 0) {
      return new Map();
    }

    const campaigns = await this.campaignRepository.findByIds(ids);
    return new Map(campaigns.map((campaign) => [campaign.id, campaign.name]));
  }
}
