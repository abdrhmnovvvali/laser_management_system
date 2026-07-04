import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type { IFollowUpRepository } from '../../domain/repositories/follow-up.repository.interface';

@Injectable()
export class DeleteFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.followUpRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('FollowUp', id);
    }
    await this.followUpRepository.delete(id);
  }
}
