import { Inject, Injectable } from '@nestjs/common';
import { ZONE_REPOSITORY } from '../../domain/repositories/zone.repository.interface';
import type { IZoneRepository } from '../../domain/repositories/zone.repository.interface';
import { Zone } from '../../domain/entities/zone.entity';

@Injectable()
export class ListZonesUseCase {
  constructor(
    @Inject(ZONE_REPOSITORY)
    private readonly zoneRepository: IZoneRepository,
  ) {}

  async execute(deviceId?: string): Promise<Zone[]> {
    return this.zoneRepository.findAll(deviceId);
  }
}
