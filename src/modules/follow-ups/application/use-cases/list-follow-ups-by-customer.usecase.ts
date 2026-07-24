import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';
import { ListFollowUpsQueryDto } from '../dto/list-follow-ups-query.dto';

@Injectable()
export class ListFollowUpsByCustomerUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(
    query: ListFollowUpsQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.followUpRepository.findAllByCustomer({
      customerId: query.customerId,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
