import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';

@Injectable()
export class GetFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(id: string): Promise<FollowUp> {
    const followUp = await this.followUpRepository.findById(id);
    if (!followUp) {
      throw new EntityNotFoundException('FollowUp', id);
    }
    return followUp;
  }
}
