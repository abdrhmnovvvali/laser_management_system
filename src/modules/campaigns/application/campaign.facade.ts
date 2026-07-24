import { Injectable } from '@nestjs/common';
import { Campaign } from '../domain/entities/campaign.entity';
import { ListActiveCampaignsUseCase } from './use-cases/list-active-campaigns.usecase';

/**
 * Public surface for other modules (Dashboard) needing read access to
 * campaign data without depending on CampaignModule's internals.
 */
@Injectable()
export class CampaignFacade {
  constructor(
    private readonly listActiveCampaignsUseCase: ListActiveCampaignsUseCase,
  ) {}

  async listActive(): Promise<Campaign[]> {
    const result = await this.listActiveCampaignsUseCase.execute(undefined, {
      skipPagination: true,
    });
    return result.items;
  }
}
