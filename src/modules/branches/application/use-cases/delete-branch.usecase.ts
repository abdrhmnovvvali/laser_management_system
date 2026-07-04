import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';

@Injectable()
export class DeleteBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.branchRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Branch', id);
    }
    await this.branchRepository.delete(id);
  }
}
