import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { NoteType } from '../../domain/entities/note-type.enum';

export class ListNotesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Müştəri ID üzrə filtr' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({
    enum: NoteType,
    description: 'Qeyd növü üzrə filtr (call | social | in_person)',
  })
  @IsOptional()
  @IsEnum(NoteType)
  type?: NoteType;
}
