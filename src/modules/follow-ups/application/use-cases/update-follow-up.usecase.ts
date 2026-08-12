import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '../../../../shared/kernel/domain.exception';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { FOLLOW_UP_REPOSITORY } from '../../domain/repositories/follow-up.repository.interface';
import type {
  IFollowUpRepository,
  UpdateFollowUpData,
} from '../../domain/repositories/follow-up.repository.interface';
import { FollowUp } from '../../domain/entities/follow-up.entity';

@Injectable()
export class UpdateFollowUpUseCase {
  constructor(
    @Inject(FOLLOW_UP_REPOSITORY)
    private readonly followUpRepository: IFollowUpRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(id: string, data: UpdateFollowUpData): Promise<FollowUp> {
    const existing = await this.followUpRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('FollowUp', id);
    }

    if (data.zoneIds !== undefined) {
      await this.assertZonesExist(data.zoneIds);
    }

    return this.followUpRepository.update(id, data);
  }

  private async assertZonesExist(zoneIds: string[]): Promise<void> {
    if (zoneIds.length === 0) {
      return;
    }

    const zones = await this.zoneFacade.getByIds(zoneIds);
    if (zones.length !== zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
      );
    }
  }
}
