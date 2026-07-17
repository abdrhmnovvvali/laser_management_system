import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { requireAllLocales } from '../../../../shared/i18n/translation.util';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type {
  IDeviceRepository,
  UpdateDeviceData,
} from '../../domain/repositories/device.repository.interface';
import { Device } from '../../domain/entities/device.entity';

@Injectable()
export class UpdateDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(id: string, data: UpdateDeviceData): Promise<Device> {
    const existing = await this.deviceRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Device', id);
    }
    if (data.translations) {
      requireAllLocales(data.translations);
    }
    return this.deviceRepository.update(id, data);
  }
}
