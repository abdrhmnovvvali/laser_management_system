import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { NOTE_REPOSITORY } from '../../domain/repositories/note.repository.interface';
import type {
  INoteRepository,
  UpdateNoteData,
} from '../../domain/repositories/note.repository.interface';
import { Note } from '../../domain/entities/note.entity';

@Injectable()
export class UpdateNoteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(id: string, data: UpdateNoteData): Promise<Note> {
    const existing = await this.noteRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Note', id);
    }
    return this.noteRepository.update(id, data);
  }
}
