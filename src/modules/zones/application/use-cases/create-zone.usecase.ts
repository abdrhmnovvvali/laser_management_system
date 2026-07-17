import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { requireAllLocales } from '../../../../shared/i18n/translation.util';
import { DeviceFacade } from '../../../devices/application/device.facade';
import { ZONE_REPOSITORY } from '../../domain/repositories/zone.repository.interface';
import type {
  CreateZoneData,
  IZoneRepository,
} from '../../domain/repositories/zone.repository.interface';
import { Zone } from '../../domain/entities/zone.entity';

@Injectable()
export class CreateZoneUseCase {
  constructor(
    @Inject(ZONE_REPOSITORY)
    private readonly zoneRepository: IZoneRepository,
    private readonly deviceFacade: DeviceFacade,
  ) {}

  async execute(data: CreateZoneData): Promise<Zone> {
    requireAllLocales(data.translations);
    try {
      await this.deviceFacade.getById(data.deviceId);
    } catch {
      throw new BusinessRuleViolationException(
        `Cihaz tapılmadı (id: ${data.deviceId})`,
      );
    }
    return this.zoneRepository.create(data);
  }
}
