import { Module } from '@nestjs/common';
import { DevicesModule } from '../../devices/presentation/devices.module';
import { ZONE_REPOSITORY } from '../domain/repositories/zone.repository.interface';
import { SupabaseZoneRepository } from '../infrastructure/persistence/supabase/supabase-zone.repository';
import { ZoneFacade } from '../application/zone.facade';
import { CreateZoneUseCase } from '../application/use-cases/create-zone.usecase';
import { DeleteZoneUseCase } from '../application/use-cases/delete-zone.usecase';
import { GetZoneUseCase } from '../application/use-cases/get-zone.usecase';
import { ListZonesUseCase } from '../application/use-cases/list-zones.usecase';
import { UpdateZoneUseCase } from '../application/use-cases/update-zone.usecase';
import { ZonesController } from './controllers/zones.controller';

@Module({
  imports: [DevicesModule],
  controllers: [ZonesController],
  providers: [
    ListZonesUseCase,
    GetZoneUseCase,
    CreateZoneUseCase,
    UpdateZoneUseCase,
    DeleteZoneUseCase,
    ZoneFacade,
    { provide: ZONE_REPOSITORY, useClass: SupabaseZoneRepository },
  ],
  exports: [ZoneFacade],
})
export class ZonesModule {}
