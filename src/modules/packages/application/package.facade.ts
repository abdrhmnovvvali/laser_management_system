import { Injectable } from '@nestjs/common';
import { Package } from '../domain/entities/package.entity';
import { GetPackageUseCase } from './use-cases/get-package.usecase';

/**
 * Public surface for ProcedureModule to resolve package pricing without
 * depending on PackageModule's internals.
 */
@Injectable()
export class PackageFacade {
  constructor(private readonly getPackageUseCase: GetPackageUseCase) {}

  async getById(id: string): Promise<Package> {
    return this.getPackageUseCase.execute(id);
  }
}
