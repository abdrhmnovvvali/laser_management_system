import { Module } from '@nestjs/common';
import { CustomersModule } from '../../customers/presentation/customers.module';
import { NOTE_REPOSITORY } from '../domain/repositories/note.repository.interface';
import { PrismaNoteRepository } from '../infrastructure/persistence/prisma/prisma-note.repository';
import { CreateNoteUseCase } from '../application/use-cases/create-note.usecase';
import { DeleteNoteUseCase } from '../application/use-cases/delete-note.usecase';
import { GetNoteUseCase } from '../application/use-cases/get-note.usecase';
import { ListNotesByCustomerUseCase } from '../application/use-cases/list-notes-by-customer.usecase';
import { UpdateNoteUseCase } from '../application/use-cases/update-note.usecase';
import { NotesController } from './controllers/notes.controller';

@Module({
  imports: [CustomersModule],
  controllers: [NotesController],
  providers: [
    ListNotesByCustomerUseCase,
    GetNoteUseCase,
    CreateNoteUseCase,
    UpdateNoteUseCase,
    DeleteNoteUseCase,
    { provide: NOTE_REPOSITORY, useClass: PrismaNoteRepository },
  ],
})
export class CommunicationModule {}
