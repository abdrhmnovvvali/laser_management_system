import { Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '../../../../shared/kernel/domain.exception';
import { NOTE_REPOSITORY } from '../../domain/repositories/note.repository.interface';
import type { INoteRepository } from '../../domain/repositories/note.repository.interface';

@Injectable()
export class DeleteNoteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.noteRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Note', id);
    }
    await this.noteRepository.delete(id);
  }
}
