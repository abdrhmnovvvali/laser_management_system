import { Inject, Injectable } from '@nestjs/common';
import { uniqueIds } from '../../../shared/relations/relation-name.util';
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

  async findIdsByNames(names: string[]): Promise<string[]> {
    const zones = await this.zoneRepository.findByNames(names);
    return zones.map((zone) => zone.id);
  }

  async resolveNames(
    zoneIds: Iterable<string | null | undefined>,
  ): Promise<Map<string, string>> {
    const ids = uniqueIds(zoneIds);
    if (ids.length === 0) {
      return new Map();
    }

    const zones = await this.zoneRepository.findByIds(ids);
    return new Map(zones.map((zone) => [zone.id, zone.name]));
  }
}
