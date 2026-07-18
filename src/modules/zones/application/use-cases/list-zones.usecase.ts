import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { ZONE_REPOSITORY } from '../../domain/repositories/zone.repository.interface';
import type { IZoneRepository } from '../../domain/repositories/zone.repository.interface';
import { ListZonesQueryDto } from '../dto/list-zones-query.dto';

@Injectable()
export class ListZonesUseCase {
  constructor(
    @Inject(ZONE_REPOSITORY)
    private readonly zoneRepository: IZoneRepository,
  ) {}

  async execute(
    query: ListZonesQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.zoneRepository.findAll({
      deviceId: query.deviceId,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
