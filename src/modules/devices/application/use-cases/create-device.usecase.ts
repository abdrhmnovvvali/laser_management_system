import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { BranchFacade } from '../../../branches/application/branch.facade';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type {
  CreateDeviceData,
  IDeviceRepository,
} from '../../domain/repositories/device.repository.interface';
import { Device } from '../../domain/entities/device.entity';

@Injectable()
export class CreateDeviceUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
    private readonly branchFacade: BranchFacade,
  ) {}

  async execute(data: CreateDeviceData): Promise<Device> {
    const branchExists = await this.branchFacade.exists(data.branchId);
    if (!branchExists) {
      throw new BusinessRuleViolationException(
        `Filial tapılmadı (id: ${data.branchId})`,
      );
    }
    return this.deviceRepository.create(data);
  }
}
