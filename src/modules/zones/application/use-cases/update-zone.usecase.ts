import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '../../../../shared/kernel/domain.exception';
import { requireAllLocales } from '../../../../shared/i18n/translation.util';
import { ZONE_REPOSITORY } from '../../domain/repositories/zone.repository.interface';
import type {
  IZoneRepository,
  UpdateZoneData,
} from '../../domain/repositories/zone.repository.interface';
import { Zone } from '../../domain/entities/zone.entity';
import { findZoneNormsRangeError } from '../../domain/services/zone-norms.calculator';

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
    if (data.translations) {
      requireAllLocales(data.translations);
    }
    // Yoxlama yekun vəziyyətə görə: göndərilməyən uc mövcud dəyərdən götürülür.
    const normsError = findZoneNormsRangeError({
      minShots: data.minShots !== undefined ? data.minShots : existing.norms.minShots,
      maxShots: data.maxShots !== undefined ? data.maxShots : existing.norms.maxShots,
      minDurationMinutes:
        data.minDurationMinutes !== undefined
          ? data.minDurationMinutes
          : existing.norms.minDurationMinutes,
      maxDurationMinutes:
        data.maxDurationMinutes !== undefined
          ? data.maxDurationMinutes
          : existing.norms.maxDurationMinutes,
    });
    if (normsError) {
      throw new BusinessRuleViolationException(normsError);
    }
    return this.zoneRepository.update(id, data);
  }
}
