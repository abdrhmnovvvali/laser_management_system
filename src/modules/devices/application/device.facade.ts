import { Inject, Injectable } from '@nestjs/common';
import { uniqueIds } from '../../../shared/relations/relation-name.util';
import { Device } from '../domain/entities/device.entity';
import { DEVICE_REPOSITORY } from '../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../domain/repositories/device.repository.interface';
import { GetDeviceUseCase } from './use-cases/get-device.usecase';

/**
 * Public surface for other modules (e.g. ProcedureModule) that need device
 * data or need to bump the shot counter after a procedure is recorded,
 * without depending on DeviceModule's internals directly.
 */
@Injectable()
export class DeviceFacade {
  constructor(
    private readonly getDeviceUseCase: GetDeviceUseCase,
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
  ) {}

  async getById(id: string): Promise<Device> {
    return this.getDeviceUseCase.execute(id);
  }

  async incrementShotCounter(id: string, byAmount: number): Promise<Device> {
    return this.deviceRepository.incrementShotCounter(id, byAmount);
  }

  async resolveNames(
    deviceIds: Iterable<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const ids = uniqueIds(deviceIds);
    if (ids.length === 0) {
      return new Map();
    }

    const devices = await this.deviceRepository.findByIds(ids);
    return new Map(devices.map((device) => [device.id, device.type]));
  }
}
