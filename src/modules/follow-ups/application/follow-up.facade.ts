import { Injectable } from '@nestjs/common';
import { FollowUp } from '../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../domain/entities/follow-up-status.enum';
import { ListFollowUpsByStatusUseCase } from './use-cases/list-follow-ups-by-status.usecase';
import { ListUpcomingFollowUpsUseCase } from './use-cases/list-upcoming-follow-ups.usecase';

/**
 * Public surface for other modules (Dashboard) needing read access to
 * follow-up data without depending on FollowUpModule's internals.
 */
@Injectable()
export class FollowUpFacade {
  constructor(
    private readonly listUpcomingFollowUpsUseCase: ListUpcomingFollowUpsUseCase,
    private readonly listFollowUpsByStatusUseCase: ListFollowUpsByStatusUseCase,
  ) {}

  async listUpcoming(days: number): Promise<FollowUp[]> {
    return this.listUpcomingFollowUpsUseCase.execute(days);
  }

  async listByStatus(status: FollowUpStatus): Promise<FollowUp[]> {
    return this.listFollowUpsByStatusUseCase.execute(status);
  }
}
