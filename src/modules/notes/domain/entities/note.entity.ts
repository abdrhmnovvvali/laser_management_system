import { BaseEntity } from '../../../../shared/kernel/base.entity';
import { NoteType } from './note-type.enum';

export class Note extends BaseEntity<string> {
  constructor(
    id: string,
    createdAt: Date,
    public readonly customerId: string,
    public readonly type: NoteType,
    public readonly content: string,
    public readonly outcome: string | null,
  ) {
    super(id, createdAt);
  }
}
