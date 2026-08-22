import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

const PLANNED_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class UpdateFollowUpDto {
  @ApiProperty({ example: 'a1b2c3d4-...', required: false })
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiProperty({ example: '2026-07-15', required: false })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiProperty({ example: '10:30', required: false })
  @IsOptional()
  @Matches(PLANNED_TIME_PATTERN, {
    message: 'plannedTime HH:mm formatında olmalıdır',
  })
  plannedTime?: string;

  @ApiProperty({
    example: ['a1b2...', 'c3d4...'],
    type: [String],
    required: false,
    description: 'Planlaşdırılan nahiyələr',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  zoneIds?: string[];

  @ApiProperty({ enum: FollowUpStatus, required: false })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
