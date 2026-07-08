import { Inject, Injectable } from '@nestjs/common';
import { uniqueIds } from '../../../shared/relations/relation-name.util';
import { Package } from '../domain/entities/package.entity';
import { PACKAGE_REPOSITORY } from '../domain/repositories/package.repository.interface';
import type { IPackageRepository } from '../domain/repositories/package.repository.interface';
import { GetPackageUseCase } from './use-cases/get-package.usecase';

/**
 * Public surface for ProcedureModule to resolve package pricing without
 * depending on PackageModule's internals.
 */
@Injectable()
export class PackageFacade {
  constructor(
    private readonly getPackageUseCase: GetPackageUseCase,
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async getById(id: string): Promise<Package> {
    return this.getPackageUseCase.execute(id);
  }

  async resolveNames(
    packageIds: Iterable<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const ids = uniqueIds(packageIds);
    if (ids.length === 0) {
      return new Map();
    }

    const packages = await this.packageRepository.findByIds(ids);
    return new Map(packages.map((pkg) => [pkg.id, pkg.name]));
  }
}
