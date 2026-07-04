import { Note } from '../../domain/entities/note.entity';
import { NoteType } from '../../domain/entities/note-type.enum';

export interface NoteRow {
  id: string;
  customer_id: string;
  type: NoteType;
  content: string;
  outcome: string | null;
  created_at: string;
}

export class NotePersistenceMapper {
  static toDomain(row: NoteRow): Note {
    return new Note(
      row.id,
      new Date(row.created_at),
      row.customer_id,
      row.type,
      row.content,
      row.outcome,
    );
  }
}
