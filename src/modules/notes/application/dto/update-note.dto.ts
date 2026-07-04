import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { NoteType } from '../../domain/entities/note-type.enum';

export class UpdateNoteDto {
  @ApiProperty({ enum: NoteType, required: false })
  @IsOptional()
  @IsEnum(NoteType)
  type?: NoteType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  outcome?: string;
}
