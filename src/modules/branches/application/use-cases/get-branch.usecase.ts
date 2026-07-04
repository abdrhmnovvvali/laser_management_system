import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/entities/branch.entity';

@Injectable()
export class GetBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new EntityNotFoundException('Branch', id);
    }
    return branch;
  }
}
