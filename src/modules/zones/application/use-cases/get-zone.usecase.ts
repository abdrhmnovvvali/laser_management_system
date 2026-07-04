import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { ZONE_REPOSITORY } from '../../domain/repositories/zone.repository.interface';
import type { IZoneRepository } from '../../domain/repositories/zone.repository.interface';
import { Zone } from '../../domain/entities/zone.entity';

@Injectable()
export class GetZoneUseCase {
  constructor(
    @Inject(ZONE_REPOSITORY)
    private readonly zoneRepository: IZoneRepository,
  ) {}

  async execute(id: string): Promise<Zone> {
    const zone = await this.zoneRepository.findById(id);
    if (!zone) {
      throw new EntityNotFoundException('Zone', id);
    }
    return zone;
  }
}
