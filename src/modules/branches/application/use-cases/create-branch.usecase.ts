import { Inject, Injectable } from '@nestjs/common';
import { requireAllLocales } from '../../../../shared/i18n/translation.util';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type {
  CreateBranchData,
  IBranchRepository,
} from '../../domain/repositories/branch.repository.interface';
import { Branch } from '../../domain/entities/branch.entity';

@Injectable()
export class CreateBranchUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(data: CreateBranchData): Promise<Branch> {
    requireAllLocales(data.translations);
    return this.branchRepository.create(data);
  }
}
