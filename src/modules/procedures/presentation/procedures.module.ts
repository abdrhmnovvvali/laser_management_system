import { Module } from '@nestjs/common';
import { CampaignsModule } from '../../campaigns/presentation/campaigns.module';
import { CustomersModule } from '../../customers/presentation/customers.module';
import { DevicesModule } from '../../devices/presentation/devices.module';
import { PackagesModule } from '../../packages/presentation/packages.module';
import { ZonesModule } from '../../zones/presentation/zones.module';
import { PROCEDURE_REPOSITORY } from '../domain/repositories/procedure.repository.interface';
import { SupabaseProcedureRepository } from '../infrastructure/persistence/supabase/supabase-procedure.repository';
import { ProcedureFacade } from '../application/procedure.facade';
import { CreateProcedureUseCase } from '../application/use-cases/create-procedure.usecase';
import { DeleteProcedureUseCase } from '../application/use-cases/delete-procedure.usecase';
import { GetProcedureUseCase } from '../application/use-cases/get-procedure.usecase';
import { ListProceduresUseCase } from '../application/use-cases/list-procedures.usecase';
import { UpdateProcedureUseCase } from '../application/use-cases/update-procedure.usecase';
import { ProceduresController } from './controllers/procedures.controller';

@Module({
  imports: [
    CustomersModule,
    DevicesModule,
    PackagesModule,
    ZonesModule,
    CampaignsModule,
  ],
  controllers: [ProceduresController],
  providers: [
    ListProceduresUseCase,
    GetProcedureUseCase,
    CreateProcedureUseCase,
    UpdateProcedureUseCase,
    DeleteProcedureUseCase,
    ProcedureFacade,
    { provide: PROCEDURE_REPOSITORY, useClass: SupabaseProcedureRepository },
  ],
  exports: [ProcedureFacade],
})
export class ProceduresModule {}
