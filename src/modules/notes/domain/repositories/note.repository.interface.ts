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

export interface INoteRepository {
  findAllByCustomer(customerId: string): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  create(data: CreateNoteData): Promise<Note>;
  update(id: string, data: UpdateNoteData): Promise<Note>;
  delete(id: string): Promise<void>;
}
