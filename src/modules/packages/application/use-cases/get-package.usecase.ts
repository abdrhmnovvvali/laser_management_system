import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { PACKAGE_REPOSITORY } from '../../domain/repositories/package.repository.interface';
import type { IPackageRepository } from '../../domain/repositories/package.repository.interface';
import { Package } from '../../domain/entities/package.entity';

@Injectable()
export class GetPackageUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async execute(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findById(id);
    if (!pkg) {
      throw new EntityNotFoundException('Package', id);
    }
    return pkg;
  }
}
