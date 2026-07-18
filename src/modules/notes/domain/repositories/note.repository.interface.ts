import { PaginatedResult, PaginationParams } from '../../../../shared/pagination/pagination.types';
import { Note } from '../entities/note.entity';
import { NoteType } from '../entities/note-type.enum';

export const NOTE_REPOSITORY = Symbol('INoteRepository');

export interface CreateNoteData {
  customerId: string;
  type: NoteType;
  content: string;
  outcome?: string | null;
}

export interface UpdateNoteData {
  type?: NoteType;
  content?: string;
  outcome?: string | null;
}

export interface NoteListOptions {
  customerId: string;
  pagination?: PaginationParams;
}

export interface INoteRepository {
  findAllByCustomer(options: NoteListOptions): Promise<PaginatedResult<Note>>;
  findById(id: string): Promise<Note | null>;
  create(data: CreateNoteData): Promise<Note>;
  update(id: string, data: UpdateNoteData): Promise<Note>;
  delete(id: string): Promise<void>;
}
