import { Module } from '@nestjs/common';
import { BranchesModule } from '../../branches/presentation/branches.module';
import {
  BIRTHDAY_ADMIN_READER,
  BIRTHDAY_READER,
} from '../domain/repositories/birthday-reader.interface';
import { PrismaBirthdayAdminReader } from '../infrastructure/persistence/prisma/prisma-birthday-admin-reader';
import { PrismaBirthdayReader } from '../infrastructure/persistence/prisma/prisma-birthday-reader';
import { BirthdayCheckCron } from '../application/cron/birthday-check.cron';
import { BirthdayFacade } from '../application/birthday.facade';
import { ListTodaysBirthdaysUseCase } from '../application/use-cases/list-todays-birthdays.usecase';
import { NotifyTodaysBirthdaysUseCase } from '../application/use-cases/notify-todays-birthdays.usecase';
import { BirthdaysController } from './controllers/birthdays.controller';

@Module({
  imports: [BranchesModule],
  controllers: [BirthdaysController],
  providers: [
    ListTodaysBirthdaysUseCase,
    NotifyTodaysBirthdaysUseCase,
    BirthdayCheckCron,
    BirthdayFacade,
    { provide: BIRTHDAY_READER, useClass: PrismaBirthdayReader },
    { provide: BIRTHDAY_ADMIN_READER, useClass: PrismaBirthdayAdminReader },
  ],
  exports: [BirthdayFacade],
})
export class BirthdaysModule {}
