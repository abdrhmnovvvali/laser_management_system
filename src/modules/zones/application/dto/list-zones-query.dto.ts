import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class ListZonesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Cihaz üzrə filtr' })
  @IsOptional()
  @IsUUID()
  deviceId?: string;
}
