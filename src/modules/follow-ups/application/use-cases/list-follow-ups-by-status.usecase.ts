import { Inject, Injectable } from '@nestjs/common';
import { FollowUp } from '../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';

@Injectable()
export class ListFollowUpsByStatusUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(status: FollowUpStatus): Promise<FollowUp[]> {
    return this.followUpRepository.findByStatus(status);
  }
}
