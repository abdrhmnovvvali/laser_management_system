import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export class UpcomingFollowUpsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 7, default: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number = 7;
}
