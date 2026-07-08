import {
  EMPTY_RELATION_LOOKUPS,
  RelationLookups,
} from '../../../../shared/relations/relation-lookups.interface';
import { lookupName } from '../../../../shared/relations/relation-name.util';
import { Note } from '../../domain/entities/note.entity';
import { NoteResponseDto } from '../dto/note-response.dto';

export class NoteMapper {
  static toResponseDto(
    note: Note,
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): NoteResponseDto {
    const dto = new NoteResponseDto();
    dto.id = note.id;
    dto.customerId = note.customerId;
    dto.customerName = lookupName(lookups.customers, note.customerId);
    dto.type = note.type;
    dto.content = note.content;
    dto.outcome = note.outcome;
    dto.createdAt = note.createdAt;
    return dto;
  }

  static toResponseDtoList(
    notes: Note[],
    lookups: RelationLookups = EMPTY_RELATION_LOOKUPS,
  ): NoteResponseDto[] {
    return notes.map((note) => this.toResponseDto(note, lookups));
  }
}
