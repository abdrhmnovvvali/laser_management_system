import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../shared/kernel/domain.exception';
import { ZoneFacade } from '../../../zones/application/zone.facade';
import { CAMPAIGN_REPOSITORY } from '../../domain/repositories/campaign.repository.interface';
import type {
  CreateCampaignData,
  ICampaignRepository,
} from '../../domain/repositories/campaign.repository.interface';
import { Campaign } from '../../domain/entities/campaign.entity';

@Injectable()
export class CreateCampaignUseCase {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    private readonly zoneFacade: ZoneFacade,
  ) {}

  async execute(data: CreateCampaignData): Promise<Campaign> {
    if (data.endDate < data.startDate) {
      throw new BusinessRuleViolationException(
        'endDate startDate-dan əvvəl ola bilməz',
      );
    }

    await this.validateZoneIds(data.zoneIds);

    return this.campaignRepository.create(data);
  }

  private async validateZoneIds(zoneIds: string[]): Promise<void> {
    const zones = await this.zoneFacade.getByIds(zoneIds);
    if (zones.length !== zoneIds.length) {
      throw new BusinessRuleViolationException(
        'Seçilən nahiyələrdən biri və ya bir neçəsi tapılmadı',
      );
    }
  }
}
