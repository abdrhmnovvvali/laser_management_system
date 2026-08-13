import { Module } from '@nestjs/common';
import { CustomersModule } from '../../customers/presentation/customers.module';
import { ZonesModule } from '../../zones/presentation/zones.module';
import { FOLLOW_UP_ADMIN_READER } from '../domain/repositories/follow-up-admin-reader.interface';
import { FOLLOW_UP_REPOSITORY } from '../domain/repositories/follow-up.repository.interface';
import { PrismaFollowUpAdminReader } from '../infrastructure/persistence/prisma/prisma-follow-up-admin-reader';
import { PrismaFollowUpRepository } from '../infrastructure/persistence/prisma/prisma-follow-up.repository';
import { FollowUpDueCron } from '../application/cron/follow-up-due.cron';
import { FollowUpFacade } from '../application/follow-up.facade';
import { CreateFollowUpUseCase } from '../application/use-cases/create-follow-up.usecase';
import { DeleteFollowUpUseCase } from '../application/use-cases/delete-follow-up.usecase';
import { GetFollowUpUseCase } from '../application/use-cases/get-follow-up.usecase';
import { ListFollowUpsByCustomerUseCase } from '../application/use-cases/list-follow-ups-by-customer.usecase';
import { ListFollowUpsByStatusUseCase } from '../application/use-cases/list-follow-ups-by-status.usecase';
import { ListUpcomingFollowUpsUseCase } from '../application/use-cases/list-upcoming-follow-ups.usecase';
import { NotifyDueFollowUpsUseCase } from '../application/use-cases/notify-due-follow-ups.usecase';
import { UpdateFollowUpUseCase } from '../application/use-cases/update-follow-up.usecase';
import { FollowUpsController } from './controllers/follow-ups.controller';

@Module({
  imports: [CustomersModule, ZonesModule],
  controllers: [FollowUpsController],
  providers: [
    ListFollowUpsByCustomerUseCase,
    ListUpcomingFollowUpsUseCase,
    ListFollowUpsByStatusUseCase,
    GetFollowUpUseCase,
    CreateFollowUpUseCase,
    UpdateFollowUpUseCase,
    DeleteFollowUpUseCase,
    NotifyDueFollowUpsUseCase,
    FollowUpDueCron,
    FollowUpFacade,
    { provide: FOLLOW_UP_REPOSITORY, useClass: PrismaFollowUpRepository },
    {
      provide: FOLLOW_UP_ADMIN_READER,
      useClass: PrismaFollowUpAdminReader,
    },
  ],
  exports: [FollowUpFacade],
})
export class FollowUpsModule {}
