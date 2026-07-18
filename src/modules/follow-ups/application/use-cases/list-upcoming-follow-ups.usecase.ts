import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';
import { UpcomingFollowUpsQueryDto } from '../dto/upcoming-follow-ups-query.dto';

@Injectable()
export class ListUpcomingFollowUpsUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(
    query: UpcomingFollowUpsQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.followUpRepository.findUpcoming({
      days: query.days ?? 7,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
