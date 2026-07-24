import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type { ICampaignRepository } from '../../domain/repositories/campaign.repository.interface';

@Injectable()
export class ListActiveCampaignsUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(
    query?: PaginationQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.campaignRepository.findActive(new Date(), {
      pagination:
        options?.skipPagination || !query
          ? undefined
          : resolvePagination(query),
    });
  }
}
