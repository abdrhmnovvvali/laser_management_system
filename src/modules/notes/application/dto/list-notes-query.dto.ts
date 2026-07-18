import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class ListNotesQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Müştəri ID' })
  @IsUUID()
  customerId: string;
}
