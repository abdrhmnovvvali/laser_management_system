import { Module } from '@nestjs/common';
import { ZonesModule } from '../../zones/presentation/zones.module';
import { CAMPAIGN_REPOSITORY } from '../domain/repositories/campaign.repository.interface';
import { PrismaCampaignRepository } from '../infrastructure/persistence/prisma/prisma-campaign.repository';
import { CampaignFacade } from '../application/campaign.facade';
import { CreateCampaignUseCase } from '../application/use-cases/create-campaign.usecase';
import { DeleteCampaignUseCase } from '../application/use-cases/delete-campaign.usecase';
import { GetCampaignUseCase } from '../application/use-cases/get-campaign.usecase';
import { ListActiveCampaignsUseCase } from '../application/use-cases/list-active-campaigns.usecase';
import { ListCampaignsUseCase } from '../application/use-cases/list-campaigns.usecase';
import { UpdateCampaignUseCase } from '../application/use-cases/update-campaign.usecase';
import { CampaignsController } from './controllers/campaigns.controller';

@Module({
  imports: [ZonesModule],
  controllers: [CampaignsController],
  providers: [
    ListCampaignsUseCase,
    ListActiveCampaignsUseCase,
    GetCampaignUseCase,
    CreateCampaignUseCase,
    UpdateCampaignUseCase,
    DeleteCampaignUseCase,
    CampaignFacade,
    { provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
  ],
  exports: [CampaignFacade],
})
export class CampaignsModule {}
