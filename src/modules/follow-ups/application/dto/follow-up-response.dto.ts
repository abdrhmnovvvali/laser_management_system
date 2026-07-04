import { ApiProperty } from '@nestjs/swagger';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export class FollowUpResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  plannedDate: Date;

  @ApiProperty({ enum: FollowUpStatus })
  status: FollowUpStatus;

  @ApiProperty()
  createdAt: Date;
}
