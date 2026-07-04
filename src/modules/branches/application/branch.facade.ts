import { Injectable } from '@nestjs/common';
import { GetBranchUseCase } from './use-cases/get-branch.usecase';

/**
 * Public surface other modules may depend on (e.g. DeviceModule, CustomerModule)
 * instead of reaching into BranchModule's repository directly.
 */
@Injectable()
export class BranchFacade {
  constructor(private readonly getBranchUseCase: GetBranchUseCase) {}

  async exists(branchId: string): Promise<boolean> {
    try {
      await this.getBranchUseCase.execute(branchId);
      return true;
    } catch {
      return false;
    }
  }
}
