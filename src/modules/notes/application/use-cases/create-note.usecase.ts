import { Inject, Injectable } from '@nestjs/common';
import { CustomerFacade } from '../../../customers/application/customer.facade';
import { NOTE_REPOSITORY } from '../../domain/repositories/note.repository.interface';
import type {
  CreateNoteData,
  INoteRepository,
} from '../../domain/repositories/note.repository.interface';
import { Note } from '../../domain/entities/note.entity';

@Injectable()
export class CreateNoteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
    private readonly customerFacade: CustomerFacade,
  ) {}

  async execute(data: CreateNoteData): Promise<Note> {
    await this.customerFacade.getById(data.customerId);
    return this.noteRepository.create(data);
  }
}
