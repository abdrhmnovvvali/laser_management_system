import { ApiProperty } from '@nestjs/swagger';
import { ZoneEntityDto } from '../../../../shared/dto/zone-entity.dto';
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

  @ApiProperty({ example: 25, description: 'Seansın təxmini minimum müddəti (dəq)' })
  durationMinMinutes: number;

  @ApiProperty({ example: 35, description: 'Seansın təxmini maksimum müddəti (dəq)' })
  durationMaxMinutes: number;

  @ApiProperty({ example: '09:25', description: 'Təxmini ən tez bitmə saatı' })
  estimatedEndTime: string;

  @ApiProperty({ example: '09:35', description: 'Təxmini ən gec bitmə saatı' })
  estimatedLatestEndTime: string;

  @ApiProperty({ enum: FollowUpStatus })
  status: FollowUpStatus;

  @ApiProperty({ type: [String], description: 'Planlaşdırılan nahiyə ID-ləri' })
  zoneIds: string[];

  @ApiProperty({
    type: [ZoneEntityDto],
    description: 'Planlaşdırılan nahiyələrin id, ad və normaları',
  })
  zones: ZoneEntityDto[];

  @ApiProperty()
  createdAt: Date;
}
