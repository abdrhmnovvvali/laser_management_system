import { Inject, Injectable } from '@nestjs/common';
import { NOTE_REPOSITORY } from '../../domain/repositories/note.repository.interface';
import type { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { Note } from '../../domain/entities/note.entity';

@Injectable()
export class ListNotesByCustomerUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(customerId: string): Promise<Note[]> {
    return this.noteRepository.findAllByCustomer(customerId);
  }
}
