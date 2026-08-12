import { Inject, Injectable } from '@nestjs/common';
import { resolvePagination } from '../../../../shared/pagination/pagination.util';
import { NOTE_REPOSITORY } from '../../domain/repositories/note.repository.interface';
import type { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { ListNotesQueryDto } from '../dto/list-notes-query.dto';

@Injectable()
export class ListNotesByCustomerUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: INoteRepository,
  ) {}

  async execute(
    query: ListNotesQueryDto,
    options?: { skipPagination?: boolean },
  ) {
    return this.noteRepository.findAll({
      customerId: query.customerId,
      type: query.type,
      pagination: options?.skipPagination
        ? undefined
        : resolvePagination(query),
    });
  }
}
