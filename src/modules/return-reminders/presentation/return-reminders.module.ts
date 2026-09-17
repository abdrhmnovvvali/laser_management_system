import { Module } from '@nestjs/common';
import { ListReturnDueCustomersUseCase } from '../application/use-cases/list-return-due-customers.usecase';
import { RETURN_DUE_READER } from '../domain/repositories/return-due-reader.interface';
import { PrismaReturnDueReader } from '../infrastructure/persistence/prisma/prisma-return-due-reader';
import { ReturnRemindersController } from './controllers/return-reminders.controller';

@Module({
  controllers: [ReturnRemindersController],
  providers: [
    ListReturnDueCustomersUseCase,
    { provide: RETURN_DUE_READER, useClass: PrismaReturnDueReader },
  ],
})
export class ReturnRemindersModule {}
