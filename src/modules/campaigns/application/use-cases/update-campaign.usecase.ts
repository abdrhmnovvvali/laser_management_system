import { Inject, Injectable } from '@nestjs/common';
import {
  BusinessRuleViolationException,
  EntityNotFoundException,
} from '../../../../shared/kernel/domain.exception';
import { requireAllLocales } from '../../../../shared/i18n/translation.util';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type {
  ICampaignRepository,
  UpdateCampaignData,
} from '../../domain/repositories/campaign.repository.interface';
import { Campaign } from '../../domain/entities/campaign.entity';

@Injectable()
export class UpdateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(id: string, data: UpdateCampaignData): Promise<Campaign> {
    const existing = await this.campaignRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Campaign', id);
    }

    if (data.translations) {
      requireAllLocales(data.translations);
    }

    const startDate = data.startDate ?? existing.startDate;
    const endDate = data.endDate ?? existing.endDate;
    if (endDate < startDate) {
      throw new BusinessRuleViolationException(
        'endDate startDate-dan əvvəl ola bilməz',
      );
    }

    if (data.zoneIds) {
      const zones = await this.zoneFacade.getByIds(data.zoneIds);
      if (zones.length !== data.zoneIds.length) {
        throw new BusinessRuleViolationException(
          'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
        );
      }
    }

    return this.campaignRepository.update(id, data);
  }
}
