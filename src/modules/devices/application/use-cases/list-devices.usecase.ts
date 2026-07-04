import { Inject, Injectable } from '@nestjs/common';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { Device } from '../../domain/entities/device.entity';

@Injectable()
export class ListDevicesUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(branchId?: string): Promise<Device[]> {
    return this.deviceRepository.findAll(branchId);
  }
}
