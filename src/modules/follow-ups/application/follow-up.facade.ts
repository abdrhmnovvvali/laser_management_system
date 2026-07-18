import { Injectable } from '@nestjs/common';
import { FollowUp } from '../domain/entities/follow-up.entity';
import { ListUpcomingFollowUpsUseCase } from './use-cases/list-upcoming-follow-ups.usecase';

/**
 * Public surface for other modules (Dashboard) needing read access to
 * follow-up data without depending on FollowUpModule's internals.
 */
@Injectable()
export class FollowUpFacade {
  constructor(
    private readonly listUpcomingFollowUpsUseCase: ListUpcomingFollowUpsUseCase,
  ) {}

  async listUpcoming(days: number): Promise<FollowUp[]> {
    const result = await this.listUpcomingFollowUpsUseCase.execute(
      { days },
      { skipPagination: true },
    );
    return result.items;
  }
}
