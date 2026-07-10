import { Injectable } from '@nestjs/common';
import { uniqueIds } from '../../../shared/relations/relation-name.util';
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

  async listAll(): Promise<Branch[]> {
    return this.listBranchesUseCase.execute();
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
    const uniqueIdsList = uniqueIds(branchIds);

    if (uniqueIdsList.length === 0) {
      return new Map();
    }

    const branches = await this.listBranchesUseCase.execute();
    const names = new Map<string, string>();
    for (const branch of branches) {
      if (uniqueIdsList.includes(branch.id)) {
        names.set(branch.id, branch.name);
      }
    }

    return names;
  }
}
