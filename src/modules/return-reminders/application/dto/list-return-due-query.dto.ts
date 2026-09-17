import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';

export const DEFAULT_MIN_DAYS = 30;
export const DEFAULT_MAX_DAYS = 60;

export class ListReturnDueQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    default: DEFAULT_MIN_DAYS,
    description: 'Son vizitdən ən azı bu qədər gün keçib',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minDays?: number;

  @ApiPropertyOptional({
    default: DEFAULT_MAX_DAYS,
    description:
      'Son vizitdən ən çoxu bu qədər gün keçib. 0 göndərilsə yuxarı hədd tətbiq olunmur.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDays?: number;

  @ApiPropertyOptional({ description: 'Filial üzrə filtr' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
