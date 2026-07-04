import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { ZONE_REPOSITORY } from '../../domain/repositories/zone.repository.interface';
import type {
  IZoneRepository,
  UpdateZoneData,
} from '../../domain/repositories/zone.repository.interface';
import { Zone } from '../../domain/entities/zone.entity';

@Injectable()
export class UpdateZoneUseCase {
  constructor(
    @Inject(ZONE_REPOSITORY)
    private readonly zoneRepository: IZoneRepository,
  ) {}

  async execute(id: string, data: UpdateZoneData): Promise<Zone> {
    const existing = await this.zoneRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Zone', id);
    }
    return this.zoneRepository.update(id, data);
  }
}
