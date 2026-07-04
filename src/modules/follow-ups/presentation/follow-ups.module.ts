import { Module } from '@nestjs/common';
import { CustomersModule } from '../../customers/presentation/customers.module';
import { FOLLOW_UP_ADMIN_READER } from '../domain/repositories/follow-up-admin-reader.interface';
import { FOLLOW_UP_REPOSITORY } from '../domain/repositories/follow-up.repository.interface';
import { SupabaseFollowUpAdminReader } from '../infrastructure/persistence/supabase/supabase-follow-up-admin-reader';
import { SupabaseFollowUpRepository } from '../infrastructure/persistence/supabase/supabase-follow-up.repository';
import { FollowUpDueCron } from '../application/cron/follow-up-due.cron';
import { FollowUpFacade } from '../application/follow-up.facade';
import { CreateFollowUpUseCase } from '../application/use-cases/create-follow-up.usecase';
import { DeleteFollowUpUseCase } from '../application/use-cases/delete-follow-up.usecase';
import { GetFollowUpUseCase } from '../application/use-cases/get-follow-up.usecase';
import { ListFollowUpsByCustomerUseCase } from '../application/use-cases/list-follow-ups-by-customer.usecase';
import { ListUpcomingFollowUpsUseCase } from '../application/use-cases/list-upcoming-follow-ups.usecase';
import { NotifyDueFollowUpsUseCase } from '../application/use-cases/notify-due-follow-ups.usecase';
import { UpdateFollowUpUseCase } from '../application/use-cases/update-follow-up.usecase';
import { FollowUpsController } from './controllers/follow-ups.controller';

@Module({
  imports: [CustomersModule],
  controllers: [FollowUpsController],
  providers: [
    ListFollowUpsByCustomerUseCase,
    ListUpcomingFollowUpsUseCase,
    GetFollowUpUseCase,
    CreateFollowUpUseCase,
    UpdateFollowUpUseCase,
    DeleteFollowUpUseCase,
    NotifyDueFollowUpsUseCase,
    FollowUpDueCron,
    FollowUpFacade,
    { provide: FOLLOW_UP_REPOSITORY, useClass: SupabaseFollowUpRepository },
    {
      provide: FOLLOW_UP_ADMIN_READER,
      useClass: SupabaseFollowUpAdminReader,
    },
  ],
  exports: [FollowUpFacade],
})
export class FollowUpsModule {}
