import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { ZONE_REPOSITORY } from '../../domain/repositories/zone.repository.interface';
import type { IZoneRepository } from '../../domain/repositories/zone.repository.interface';

@Injectable()
export class DeleteZoneUseCase {
  constructor(
    @Inject(ZONE_REPOSITORY)
    private readonly zoneRepository: IZoneRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.zoneRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Zone', id);
    }
    await this.zoneRepository.delete(id);
  }
}
