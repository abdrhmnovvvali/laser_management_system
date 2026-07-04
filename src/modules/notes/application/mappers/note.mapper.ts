import { Note } from '../../domain/entities/note.entity';
import { NoteResponseDto } from '../dto/note-response.dto';

export class NoteMapper {
  static toResponseDto(note: Note): NoteResponseDto {
    const dto = new NoteResponseDto();
    dto.id = note.id;
    dto.customerId = note.customerId;
    dto.type = note.type;
    dto.content = note.content;
    dto.outcome = note.outcome;
    dto.createdAt = note.createdAt;
    return dto;
  }

  static toResponseDtoList(notes: Note[]): NoteResponseDto[] {
    return notes.map((note) => this.toResponseDto(note));
  }
}
