import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class ListDevicesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filial üzrə filtr' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
