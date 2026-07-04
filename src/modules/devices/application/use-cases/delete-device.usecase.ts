import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';

@Injectable()
export class DeleteDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.deviceRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Device', id);
    }
    await this.deviceRepository.delete(id);
  }
}
