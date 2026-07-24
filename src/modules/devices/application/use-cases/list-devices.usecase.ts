import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { DEVICE_REPOSITORY } from '../../domain/repositories/device.repository.interface';
import type { IDeviceRepository } from '../../domain/repositories/device.repository.interface';
import { ListDevicesQueryDto } from '../dto/list-devices-query.dto';

@Injectable()
export class ListDevicesUseCase {
  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: IDeviceRepository,
  ) {}

  async execute(
    query: ListDevicesQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.deviceRepository.findAll({
      branchId: query.branchId,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
