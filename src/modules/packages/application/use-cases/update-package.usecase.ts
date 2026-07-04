import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '../../../../shared/kernel/domain.exception';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { PACKAGE_REPOSITORY } from '../../domain/repositories/package.repository.interface';
import type {
  IPackageRepository,
  UpdatePackageData,
} from '../../domain/repositories/package.repository.interface';
import { Package } from '../../domain/entities/package.entity';

@Injectable()
export class UpdatePackageUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(id: string, data: UpdatePackageData): Promise<Package> {
    const existing = await this.packageRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Package', id);
    }

    if (data.zoneIds) {
      const zones = await this.zoneFacade.getByIds(data.zoneIds);
      if (zones.length !== data.zoneIds.length) {
        throw new BusinessRuleViolationException(
          'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
        );
      }
    }

    return this.packageRepository.update(id, data);
  }
}
