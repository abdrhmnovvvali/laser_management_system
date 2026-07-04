import { Inject, Injectable } from '@nestjs/common';
import { PACKAGE_REPOSITORY } from '../../domain/repositories/package.repository.interface';
import type { IPackageRepository } from '../../domain/repositories/package.repository.interface';
import { Package } from '../../domain/entities/package.entity';

@Injectable()
export class ListPackagesUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async execute(): Promise<Package[]> {
    return this.packageRepository.findAll();
  }
}
