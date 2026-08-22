import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class AvailableReservationSlotsQueryDto {
  @ApiProperty({ description: 'Cihaz ID' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ example: '2026-07-15', description: 'Rezervasiya tarixi' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Redaktə zamanı cari rezervasiyanı slot yoxlamasından çıxar',
  })
  @IsOptional()
  @IsUUID()
  excludeFollowUpId?: string;
}

export class ReservationSlotDto {
  @ApiProperty({ example: '10:30' })
  time: string;

  @ApiProperty()
  available: boolean;
}

export class AvailableReservationSlotsResponseDto {
  @ApiProperty({ type: [ReservationSlotDto] })
  slots: ReservationSlotDto[];
}
