import { Module } from '@nestjs/common';
import { BranchesModule } from '../../branches/presentation/branches.module';
import { DEVICE_REPOSITORY } from '../domain/repositories/device.repository.interface';
import { SupabaseDeviceRepository } from '../infrastructure/persistence/supabase/supabase-device.repository';
import { DeviceFacade } from '../application/device.facade';
import { CreateDeviceUseCase } from '../application/use-cases/create-device.usecase';
import { DeleteDeviceUseCase } from '../application/use-cases/delete-device.usecase';
import { GetDeviceUseCase } from '../application/use-cases/get-device.usecase';
import { ListDevicesUseCase } from '../application/use-cases/list-devices.usecase';
import { UpdateDeviceUseCase } from '../application/use-cases/update-device.usecase';
import { DevicesController } from './controllers/devices.controller';

@Module({
  imports: [BranchesModule],
  controllers: [DevicesController],
  providers: [
    ListDevicesUseCase,
    GetDeviceUseCase,
    CreateDeviceUseCase,
    UpdateDeviceUseCase,
    DeleteDeviceUseCase,
    DeviceFacade,
    { provide: DEVICE_REPOSITORY, useClass: SupabaseDeviceRepository },
  ],
  exports: [DeviceFacade],
})
export class DevicesModule {}
