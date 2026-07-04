import { Inject, Injectable } from '@nestjs/common';
import { Zone } from '../domain/entities/zone.entity';
import { ZONE_REPOSITORY } from '../domain/repositories/zone.repository.interface';
import type { IZoneRepository } from '../domain/repositories/zone.repository.interface';
import { GetZoneUseCase } from './use-cases/get-zone.usecase';

/**
 * Public surface for other modules (Package, Procedure) that need zone
 * pricing information without depending on ZoneModule's internals.
 */
@Injectable()
export class ZoneFacade {
  constructor(
    private readonly getZoneUseCase: GetZoneUseCase,
    @Inject(ZONE_REPOSITORY)
    private readonly zoneRepository: IZoneRepository,
  ) {}

  async getById(id: string): Promise<Zone> {
    return this.getZoneUseCase.execute(id);
  }

  async getByIds(ids: string[]): Promise<Zone[]> {
    return this.zoneRepository.findByIds(ids);
  }
}
