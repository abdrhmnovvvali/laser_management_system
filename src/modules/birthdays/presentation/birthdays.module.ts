import { Module } from '@nestjs/common';
import {
  BIRTHDAY_ADMIN_READER,
  BIRTHDAY_READER,
} from '../domain/repositories/birthday-reader.interface';
import { SupabaseBirthdayAdminReader } from '../infrastructure/persistence/supabase/supabase-birthday-admin-reader';
import { SupabaseBirthdayReader } from '../infrastructure/persistence/supabase/supabase-birthday-reader';
import { BirthdayCheckCron } from '../application/cron/birthday-check.cron';
import { BirthdayFacade } from '../application/birthday.facade';
import { ListTodaysBirthdaysUseCase } from '../application/use-cases/list-todays-birthdays.usecase';
import { NotifyTodaysBirthdaysUseCase } from '../application/use-cases/notify-todays-birthdays.usecase';
import { BirthdaysController } from './controllers/birthdays.controller';

@Module({
  controllers: [BirthdaysController],
  providers: [
    ListTodaysBirthdaysUseCase,
    NotifyTodaysBirthdaysUseCase,
    BirthdayCheckCron,
    BirthdayFacade,
    { provide: BIRTHDAY_READER, useClass: SupabaseBirthdayReader },
    { provide: BIRTHDAY_ADMIN_READER, useClass: SupabaseBirthdayAdminReader },
  ],
  exports: [BirthdayFacade],
})
export class BirthdaysModule {}
