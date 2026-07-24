import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { BRANCH_REPOSITORY } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';

@Injectable()
export class ListBranchesUseCase {
  constructor(
    @Inject(BRANCH_REPOSITORY)
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(query?: PaginationQueryDto) {
    return this.branchRepository.findAll({
      pagination: query ? resolvePagination(query) : undefined,
    });
  }
}
