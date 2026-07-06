import { Injectable } from '@nestjs/common';
import { Branch } from '../domain/entities/branch.entity';
import { GetBranchUseCase } from './use-cases/get-branch.usecase';
import { ListBranchesUseCase } from './use-cases/list-branches.usecase';

/**
 * Public surface other modules may depend on (e.g. DeviceModule, CustomerModule)
 * instead of reaching into BranchModule's repository directly.
 */
@Injectable()
export class BranchFacade {
  constructor(
    private readonly getBranchUseCase: GetBranchUseCase,
    private readonly listBranchesUseCase: ListBranchesUseCase,
  ) {}

  async getById(id: string): Promise<Branch> {
    return this.getBranchUseCase.execute(id);
  }

  async exists(branchId: string): Promise<boolean> {
    try {
      await this.getBranchUseCase.execute(branchId);
      return true;
    } catch {
      return false;
    }
  }

  async resolveNames(
    branchIds: Iterable<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const uniqueIds = new Set<string>();
    for (const id of branchIds) {
      if (id) {
        uniqueIds.add(id);
      }
    }

    if (uniqueIds.size === 0) {
      return new Map();
    }

    const branches = await this.listBranchesUseCase.execute();
    const names = new Map<string, string>();
    for (const branch of branches) {
      if (uniqueIds.has(branch.id)) {
        names.set(branch.id, branch.name);
      }
    }

    return names;
  }
}
