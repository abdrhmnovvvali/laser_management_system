import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { requireAllLocales } from '../../../../shared/i18n/translation.util';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type {
  IBranchRepository,
  UpdateBranchData,
} from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/entities/branch.entity';

@Injectable()
export class UpdateBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(id: string, data: UpdateBranchData): Promise<Branch> {
    const existing = await this.branchRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Branch', id);
    }
    if (data.translations) {
      requireAllLocales(data.translations);
    }
    return this.branchRepository.update(id, data);
  }
}
