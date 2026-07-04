import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type {
  IFollowUpRepository,
  UpdateFollowUpData,
} from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';

@Injectable()
export class UpdateFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(id: string, data: UpdateFollowUpData): Promise<FollowUp> {
    const existing = await this.followUpRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('FollowUp', id);
    }
    return this.followUpRepository.update(id, data);
  }
}
