import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { NoteType } from '../../domain/entities/note-type.enum';

export class CreateNoteDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: NoteType, example: NoteType.CALL })
  @IsEnum(NoteType)
  type: NoteType;

  @ApiProperty({ example: 'Növbəti vizit üçün zəng edildi' })
  @IsString()
  @MinLength(2)
  content: string;

  @ApiProperty({ example: 'Razılaşdı', required: false })
  @IsOptional()
  @IsString()
  outcome?: string;
}
