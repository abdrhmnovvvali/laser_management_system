import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/dto/pagination-query.dto';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export class ListFollowUpsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Müştəri ID üzrə filtr' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Cihaz ID üzrə filtr' })
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiPropertyOptional({ example: '2026-07-15', description: 'Tarix üzrə filtr' })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiPropertyOptional({
    enum: FollowUpStatus,
    description: 'Status üzrə filtr (pending | done | missed)',
  })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
