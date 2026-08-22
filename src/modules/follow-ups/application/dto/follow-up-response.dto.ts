import { ApiProperty } from '@nestjs/swagger';
import { NamedEntityDto } from '../../../../shared/dto/named-entity.dto';
import { FollowUpStatus } from '../../domain/entities/follow-up-status.enum';

export class FollowUpResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ nullable: true, description: 'Müştərinin adı soyadı' })
  customerName: string | null;

  @ApiProperty()
  deviceId: string;

  @ApiProperty({ nullable: true, description: 'Cihazın adı/tipi' })
  deviceName: string | null;

  @ApiProperty({ example: '2026-07-15', description: 'Rezervasiya tarixi (YYYY-MM-DD)' })
  plannedDate: string;

  @ApiProperty({ example: '10:30', description: 'Rezervasiya saatı (HH:mm)' })
  plannedTime: string;

  @ApiProperty({ enum: FollowUpStatus })
  status: FollowUpStatus;

  @ApiProperty({ type: [String], description: 'Planlaşdırılan nahiyə ID-ləri' })
  zoneIds: string[];

  @ApiProperty({
    type: [NamedEntityDto],
    description: 'Planlaşdırılan nahiyələrin id və adları',
  })
  zones: NamedEntityDto[];

  @ApiProperty()
  createdAt: Date;
}
