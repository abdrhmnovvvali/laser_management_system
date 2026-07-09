import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export class CreateFollowUpDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  plannedDate: string;

  @ApiProperty({
    example: 'a1b2c3d4-...',
    required: false,
    description: 'Planlaşdırılan nahiyə',
  })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiProperty({
    enum: FollowUpStatus,
    required: false,
    default: FollowUpStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
