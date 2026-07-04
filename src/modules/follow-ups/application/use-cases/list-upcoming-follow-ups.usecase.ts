import { Inject, Injectable } from '@nestjs/common';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';

@Injectable()
export class ListUpcomingFollowUpsUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(days: number): Promise<FollowUp[]> {
    return this.followUpRepository.findUpcoming(days);
  }
}
