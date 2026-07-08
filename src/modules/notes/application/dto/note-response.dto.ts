import { ApiProperty } from '@nestjs/swagger';
import { NoteType } from '../../domain/entities/note-type.enum';

export class NoteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ nullable: true, description: 'Müştərinin adı soyadı' })
  customerName: string | null;

  @ApiProperty({ enum: NoteType })
  type: NoteType;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  outcome: string | null;

  @ApiProperty()
  createdAt: Date;
}
