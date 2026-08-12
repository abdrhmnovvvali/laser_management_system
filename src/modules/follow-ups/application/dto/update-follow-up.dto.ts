import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export class UpdateFollowUpDto {
  @ApiProperty({ example: '2026-07-15', required: false })
  @IsOptional()
  @IsDateString()
  plannedDate?: string;

  @ApiProperty({
    example: ['a1b2...', 'c3d4...'],
    type: [String],
    required: false,
    description: 'Planlaşdırılan nahiyələr',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  zoneIds?: string[];

  @ApiProperty({ enum: FollowUpStatus, required: false })
  @IsOptional()
  @IsEnum(FollowUpStatus)
  status?: FollowUpStatus;
}
