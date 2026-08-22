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

export class CreateFollowUpDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 'a1b2c3d4-...', description: 'Rezervasiya cihazı' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  plannedDate: string;

  @ApiProperty({ example: '10:30', description: 'Rezervasiya saatı (HH:mm)' })
  @Matches(PLANNED_TIME_PATTERN, {
    message: 'plannedTime HH:mm formatında olmalıdır',
  })
  plannedTime: string;

  @ApiProperty({
    example: ['a1b2...', 'c3d4...'],
    type: [String],
    description: 'Planlaşdırılan nahiyələr',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  zoneIds: string[];

  @ApiProperty({
    enum: FollowUpStatus,
    required: false,
    default: FollowUpStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
