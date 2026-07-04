import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export class UpdateFollowUpDto {
  @ApiProperty({ example: '2026-07-15', required: false })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiProperty({ enum: FollowUpStatus, required: false })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
