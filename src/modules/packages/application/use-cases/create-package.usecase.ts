import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { PACKAGE_REPOSITORY } from '../../domain/repositories/package.repository.interface';
import type {
  CreatePackageData,
  IPackageRepository,
} from '../../domain/repositories/package.repository.interface';
import { Package } from '../../domain/entities/package.entity';

@Injectable()
export class CreatePackageUseCase {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(data: CreatePackageData): Promise<Package> {
    const zones = await this.zoneFacade.getByIds(data.zoneIds);
    if (zones.length !== data.zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
      );
    }
    return this.packageRepository.create(data);
  }
}
