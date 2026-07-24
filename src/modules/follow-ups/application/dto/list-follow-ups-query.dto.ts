import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class ListFollowUpsQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Müştəri ID' })
  @IsUUID()
  customerId: string;
}
