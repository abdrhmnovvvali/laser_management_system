import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { PACKAGE_REPOSITORY } from '../../domain/repositories/package.repository.interface';
import type { IPackageRepository } from '../../domain/repositories/package.repository.interface';

@Injectable()
export class DeletePackageUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.packageRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Package', id);
    }
    await this.packageRepository.delete(id);
  }
}
